"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Upload, 
  Download, 
  ArrowLeft, 
  Percent,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { PDFDocument } from 'pdf-lib'

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
      <span
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: s.wordmark,
          fontWeight: 300,
          letterSpacing: "-0.5px",
          color: "inherit",
          lineHeight: 1,
        }}
      >
        Dil<span style={{ color: "#1D9E75" }}>Tak</span>
      </span>
    </div>
  )
}

export default function CompressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [compressing, setCompressing] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [userEmail, setUserEmail] = useState('user@diltak.com')

  useEffect(() => {
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
      setFile(f)
      setOriginalSize(f.size)
    } catch {}
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    setFile(selectedFile)
    setOriginalSize(selectedFile.size)
  }

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please select a PDF file')
      return
    }

    setCompressing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: level !== 'low',
        addDefaultPage: false,
        objectsPerTick: level === 'high' ? 50 : 100,
      })

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed_${file.name}`
      
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
      
      const compressionRatio = ((1 - pdfBytes.length / originalSize) * 100).toFixed(1)
      toast.success(`Compressed by ${compressionRatio}%`)
    } catch (error) {
      console.error('Compression error:', error)
      toast.error('Failed to compress PDF')
    } finally {
      setCompressing(false)
    }
  }

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' })
    localStorage.removeItem('user_email') // Clean user storage
    toast.success('Signed out safely')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      {/* ── Navigation Header ── */}
      <nav className="border-b flex items-center justify-between px-8 py-4 bg-background">
        <Link href="/">
          <DilTakLogo size="md" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Button
            size="sm"
            className="hover:opacity-90 text-white"
            style={{ background: "#1D9E75", border: "none" }}
            asChild
          >
            <Link href="/dashboard">
              Open Workspace
            </Link>
          </Button>

          {/* ── Synchronized User Profile Dropdown ── */}
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

      {/* ── Workspace Content ── */}
      <main className="flex-1 container mx-auto px-8 py-10 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-muted">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight flex items-center gap-2">
              <Percent className="h-5 w-5 text-emerald-600" />
              Compress PDF
            </CardTitle>
            <CardDescription>Optimize binary allocations and reduce binary stream weight directly inside your client browser environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Target Area File Trigger Dropzone */}
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                <p className="text-lg font-medium mb-1 truncate px-4">
                  {file ? file.name : 'Select PDF File'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file ? `Original Size: ${(originalSize / 1024).toFixed(1)} KB` : 'Click to analyze stream density'}
                </p>
              </div>
            </label>

            {/* Compression Strength Options Selection */}
            {file && (
              <div className="space-y-3 animate-in fade-in-50 duration-200">
                <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block">Compression Level</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={level === 'low' ? 'default' : 'outline'}
                    onClick={() => setLevel('low')}
                    style={level === 'low' ? { backgroundColor: '#1D9E75', color: '#fff', border: 'none' } : {}}
                    className="w-full"
                  >
                    Low
                  </Button>
                  <Button
                    type="button"
                    variant={level === 'medium' ? 'default' : 'outline'}
                    onClick={() => setLevel('medium')}
                    style={level === 'medium' ? { backgroundColor: '#1D9E75', color: '#fff', border: 'none' } : {}}
                    className="w-full"
                  >
                    Medium
                  </Button>
                  <Button
                    type="button"
                    variant={level === 'high' ? 'default' : 'outline'}
                    onClick={() => setLevel('high')}
                    style={level === 'high' ? { backgroundColor: '#1D9E75', color: '#fff', border: 'none' } : {}}
                    className="w-full"
                  >
                    High
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {level === 'low' && 'Quick processing with basic structure indexing optimization.'}
                  {level === 'medium' && 'Recommended. Restructures objects and streams for optimal space allocation.'}
                  {level === 'high' && 'Aggressive stream packing optimization. Smaller output weight.'}
                </p>
              </div>
            )}

            {/* Action Trigger Interface */}
            <Button
              onClick={handleCompress}
              disabled={!file || compressing}
              className="w-full text-white hover:opacity-90 h-11"
              style={{ backgroundColor: '#1D9E75', border: 'none' }}
            >
              <Download className="mr-2 h-4 w-4" />
              {compressing ? 'Optimizing Binary Stream Allocation...' : 'Compress PDF'}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-6 mt-auto bg-background">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <DilTakLogo size="sm" />
            <p className="text-xs text-muted-foreground mt-1.5">
              © 2026 Alpha Group &nbsp;·&nbsp; Designed by Bharath raj
            </p>
          </div>
          <div className="flex gap-5">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}