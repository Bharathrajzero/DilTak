"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Highlighter, 
  Type, 
  FilePen, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Settings, 
  Upload,
  Trash2,
  Eye,
  FileText,
  User,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import { toast } from "sonner"

function DilTakLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scales: Record<string, { doc: number; wordmark: number }> = {
    sm: { doc: 0.55, wordmark: 14 },
    md: { doc: 0.75, wordmark: 20 },
    lg: { doc: 1,    wordmark: 26 },
  }
  const s = scales[size]
  const w = 40 * s.doc
  const h = 52 * s.doc

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={w} height={h} viewBox="0 0 40 52" aria-hidden="true">
        <rect x="0" y="0" width="40" height="52" rx="5" fill="#E1F5EE" stroke="#9FE1CB" strokeWidth="1" />
        <path d="M28 0 L40 12 L28 12 Z" fill="#9FE1CB" />
        <path d="M28 0 L28 12 L40 12" fill="none" stroke="#9FE1CB" strokeWidth="1" />
        <line x1="7" y1="22" x2="33" y2="22" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="30" x2="26" y2="30" stroke="#9FE1CB" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="38" x2="29" y2="38" stroke="#9FE1CB" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: s.wordmark, fontWeight: 300, letterSpacing: "-0.5px", color: "inherit", lineHeight: 1 }}>
        Dil<span style={{ color: "#1D9E75" }}>Tak</span>
      </span>
    </div>
  )
}

type ToolType = "select" | "highlight" | "text" | "draw"
type TextAnnotation = { id: string; x: number; y: number; text: string }

export default function AnnotatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [activeTool, setActiveTool] = useState<ToolType>("select")
  const [zoom, setZoom] = useState(100)
  const [color, setColor] = useState("#1D9E75")
  const [userEmail, setUserEmail] = useState('user@diltak.com')
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    setMounted(true)
    const defaultZoom = localStorage.getItem("editor_default_zoom")
    if (defaultZoom) setZoom(Number(defaultZoom))
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)
    const fname = searchParams.get('file')
    if (fname) autoLoadFile(fname)
  }, [])

  const autoLoadFile = async (fname: string) => {
    try {
      const res = await fetch(`/api/files?filename=${encodeURIComponent(fname)}`)
      if (!res.ok) return
      const blob = await res.blob()
      const f = new File([blob], fname, { type: 'application/pdf' })
      setUploadedFile(f)
      setFileUrl(URL.createObjectURL(f))
      setTextAnnotations([])
    } catch {}
  }

  useEffect(() => {
    if (canvasRef.current && fileUrl) {
      const canvas = canvasRef.current
      canvas.width = canvas.parentElement?.clientWidth || 800
      canvas.height = canvas.parentElement?.clientHeight || 1100
      
      const context = canvas.getContext("2d")
      if (context) {
        context.lineCap = "round"
        context.lineJoin = "round"
        contextRef.current = context
      }
    }
  }, [fileUrl, activeTool])

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFile(file)
      if (fileUrl) URL.revokeObjectURL(fileUrl)
      setFileUrl(URL.createObjectURL(file))
      setTextAnnotations([])
    }
  }

  const handleCloseFile = () => {
    setUploadedFile(null)
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl)
      setFileUrl(null)
    }
  }

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' })
    localStorage.removeItem('user_email')
    toast.success('Signed out safely')
    router.push('/')
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "select") return
    
    const { offsetX, offsetY } = e.nativeEvent
    if (!contextRef.current) return

    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    
    if (activeTool === "highlight") {
      contextRef.current.strokeStyle = `${color}55`
      contextRef.current.lineWidth = 18
    } else if (activeTool === "draw") {
      contextRef.current.strokeStyle = color
      contextRef.current.lineWidth = 3
    }

    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return
    const { offsetX, offsetY } = e.nativeEvent
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  const stopDrawing = () => {
    if (!contextRef.current) return
    contextRef.current.closePath()
    setIsDrawing(false)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "text") return
    if ((e.target as HTMLElement).tagName === "INPUT") return

    const rect = overlayRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newNote: TextAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      text: ""
    }

    setTextAnnotations((prev) => [...prev, newNote])
  }

  const updateTextValue = (id: string, text: string) => {
    setTextAnnotations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    )
  }

  const clearCanvasAndAnnotations = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    setTextAnnotations([])
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&display=swap');
            .fraunces { font-family: 'Fraunces', Georgia, serif; }
          `,
        }}
      />

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />

      {/* Header */}
      <nav className="border-b flex items-center justify-between px-8 py-4 bg-background z-20 sticky top-0">
        <Link href="/"><DilTakLogo size="md" /></Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Button size="sm" className="hover:opacity-90 text-white" style={{ background: "#1D9E75", border: "none" }} onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Open a PDF</Button>
          
          {/* Synchronized Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted border hover:bg-muted/80">
                <User className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 shadow-md">
              <DropdownMenuLabel className="font-normal flex flex-col py-2 px-3">
                <span className="font-semibold text-sm">Workspace User</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {!uploadedFile || !fileUrl ? (
        <main className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
          <Card className="max-w-md w-full border-dashed border-2 p-10 text-center flex flex-col items-center gap-6 bg-background shadow-sm">
            <div className="h-16 w-16 bg-[#E1F5EE] border border-[#9FE1CB] text-[#1D9E75] rounded-full flex items-center justify-center"><FileText className="h-8 w-8" /></div>
            <div>
              <h2 className="fraunces text-2xl font-normal mb-2">No document workspace active</h2>
              <p className="text-sm text-muted-foreground">Upload a real device PDF document to unlock drawing and highlighting canvas tools.</p>
            </div>
            <Button className="w-full text-white" style={{ background: "#1D9E75" }} onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Select PDF File</Button>
          </Card>
        </main>
      ) : (
        <>
          {/* Action Toolbar */}
          <div className="border-b bg-muted/30 px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-9 px-2" onClick={handleCloseFile}><ArrowLeft className="h-4 w-4 mr-1" />Close File</Button>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm font-medium max-w-[200px] truncate">{uploadedFile.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(50, zoom - 25))}><ZoomOut className="h-4 w-4" /></Button>
              <span className="text-xs font-mono min-w-[40px] text-center">{zoom}%</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(150, zoom + 25))}><ZoomIn className="h-4 w-4" /></Button>
              <div className="h-4 w-px bg-border mx-1" />
              <Button className="h-8 text-white" style={{ background: "#1D9E75" }} onClick={() => window.print()}><Download className="h-3.5 w-3.5 mr-1.5" /> Export / Print</Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-[260px_1fr] bg-muted/10">
            {/* Sidebar */}
            <aside className="border-r bg-background p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Annotation Tools</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant={activeTool === "select" ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTool("select")}><Eye className="h-4 w-4 mr-2.5" />View mode</Button>
                  <Button variant={activeTool === "highlight" ? "secondary" : "ghost"} className={`justify-start ${activeTool === "highlight" ? "text-[#0F6E56] bg-[#E1F5EE]" : ""}`} onClick={() => setActiveTool("highlight")}><Highlighter className="h-4 w-4 mr-2.5 text-[#1D9E75]" />Highlight Layer</Button>
                  <Button variant={activeTool === "text" ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTool("text")}><Type className="h-4 w-4 mr-2.5" />Add Text Note</Button>
                  <Button variant={activeTool === "draw" ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTool("draw")}><FilePen className="h-4 w-4 mr-2.5" />Freehand Pen</Button>
                </div>
              </div>

              <hr className="border-t" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ink Color</h3>
                <div className="flex items-center gap-2.5">
                  {["#1D9E75", "#EAB308", "#EF4444", "#3B82F6", "#000000"].map((hex) => (
                    <button key={hex} onClick={() => setColor(hex)} className={`w-7 h-7 rounded-full border ${color === hex ? 'scale-110 ring-2 ring-primary/40' : 'opacity-80'}`} style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10" onClick={clearCanvasAndAnnotations}><Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear Ink Canvas</Button>
              </div>
            </aside>

            {/* Viewport Workspace */}
            <main className="p-8 overflow-auto flex justify-center items-start">
              <div 
                className="transition-all duration-200 ease-out relative w-full max-w-4xl h-[78vh]"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              >
                <Card className="w-full h-full shadow-md bg-background border rounded-lg overflow-hidden relative">
                  <iframe src={`${fileUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none z-0 absolute top-0 left-0" title={uploadedFile.name} />

                  <div 
                    ref={overlayRef}
                    className={`absolute top-0 left-0 w-full h-full ${activeTool === "select" ? "pointer-events-none z-0" : "z-10 pointer-events-auto"}`}
                    onClick={handleOverlayClick}
                    style={{ cursor: activeTool === "text" ? "text" : activeTool === "select" ? "default" : "crosshair" }}
                  >
                    {textAnnotations.map((note) => (
                      <div 
                        key={note.id} 
                        className="absolute" 
                        style={{ left: note.x, top: note.y, transform: "translate(-5px, -5px)" }}
                      >
                        <input
                          type="text"
                          value={note.text}
                          placeholder="Type here..."
                          onChange={(e) => updateTextValue(note.id, e.target.value)}
                          className="px-2 py-1 text-xs border rounded shadow-sm bg-background font-medium focus:outline-none focus:ring-1 focus:ring-[#1D9E75] min-w-[120px]"
                          style={{ color: color }}
                          autoFocus
                        />
                      </div>
                    ))}

                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  )
}