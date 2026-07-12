"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  FileText, 
  Trash2, 
  Search, 
  Grid, 
  List, 
  Merge, 
  Scissors, 
  Percent, 
  Languages, 
  RefreshCw,
  Highlighter,
  Download,
  ChevronDown,
  User, 
  LogOut, 
  Settings 
} from 'lucide-react'

interface Document {
  id: string
  title: string
  fileSize: number
  pageCount: number
  createdAt: string
  filePath: string
}

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

export default function DashboardPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // State initialization for active authentication profile sync
  const [userEmail, setUserEmail] = useState('user@diltak.com')

  useEffect(() => {
    fetchDocuments()
    
    // Pull the active identity payload out of browser local storage index
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) {
      setUserEmail(savedEmail)
    }
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (res.ok) {
        toast.success('File uploaded successfully')
        fetchDocuments()
      } else {
        toast.error('Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Document deleted')
        fetchDocuments()
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' })
    localStorage.removeItem('user_email') // Clean user storage
    toast.success('Signed out safely')
    router.push('/')
  }

  const handleDownload = async (doc: Document) => {
    const fname = doc.filePath.split(/[/\\]/).pop() || ''
    const url = `/api/files?filename=${encodeURIComponent(fname)}`
    const a = document.createElement('a')
    a.href = url
    a.download = fname
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { a.remove() }, 100)
  }

  const getFileParam = (doc: Document) =>
    encodeURIComponent(doc.filePath.split(/[/\\]/).pop() || '')

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <Link href="/dashboard" className="text-sm font-medium text-foreground transition-colors">
            Dashboard
          </Link>
          <Button
            size="sm"
            className="hover:opacity-90 text-white"
            style={{ background: "#1D9E75", border: "none" }}
            onClick={() => document.getElementById('dashboard-file-input')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Open a PDF
          </Button>

          {/* ── User Profile Authentication Dropdown Menu ── */}
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

      {/* ── Main Workspace Content ── */}
      <main className="flex-1 container mx-auto px-8 py-10">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your PDF documents local-first</p>
          </div>
        </div>

        {/* Upload Area */}
        <Card className="mb-8 border-dashed border-2 hover:border-muted-foreground/50 transition-colors">
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Select a PDF file to upload and parse directly in your browser tab</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="cursor-pointer block">
              <input
                id="dashboard-file-input"
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="rounded-lg p-8 text-center bg-muted/30 hover:bg-muted/60 transition group">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
                <p className="text-lg font-medium mb-2">
                  {uploading ? 'Processing & Vectorizing...' : 'Click to upload PDF'}
                </p>
                <p className="text-sm text-muted-foreground">PDF formats only · Max limit 50MB</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Search and View Toggles */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search local documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              style={viewMode === 'grid' ? { backgroundColor: '#1D9E75', color: '#fff' } : {}}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              style={viewMode === 'list' ? { backgroundColor: '#1D9E75', color: '#fff' } : {}}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documents Content Loader */}
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-sm text-muted-foreground">Reading storage index...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-24 border rounded-xl bg-muted/10">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
            <p className="text-lg text-muted-foreground font-medium">No files indexable</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a PDF above to inspect or update text assets.</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition flex flex-col justify-between">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <FileText className="h-6 w-6" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="truncate mt-3 text-xl">{doc.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{doc.pageCount} pages</span>
                      <span>•</span>
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="flex-1 text-white text-xs h-9" style={{ backgroundColor: '#1D9E75' }}>
                            Actions <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Use this PDF in...</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/annotate?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Highlighter className="h-3.5 w-3.5" /> Annotate
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/split?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Scissors className="h-3.5 w-3.5" /> Split
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/compress?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Percent className="h-3.5 w-3.5" /> Compress
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/ocr?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Languages className="h-3.5 w-3.5" /> OCR
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/convert?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <RefreshCw className="h-3.5 w-3.5" /> Convert
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownload(doc)} className="flex items-center gap-2 cursor-pointer">
                            <Download className="h-3.5 w-3.5" /> Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-xl divide-y bg-background overflow-hidden">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition">
                  <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                    <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="font-medium text-sm truncate max-w-md">{doc.title}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {doc.pageCount} pages · {(doc.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="h-8 text-white text-xs gap-1" style={{ backgroundColor: '#1D9E75' }}>
                            Actions <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Use this PDF in...</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/annotate?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Highlighter className="h-3.5 w-3.5" /> Annotate
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/split?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Scissors className="h-3.5 w-3.5" /> Split
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/compress?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Percent className="h-3.5 w-3.5" /> Compress
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/ocr?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <Languages className="h-3.5 w-3.5" /> OCR
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/convert?file=${getFileParam(doc)}`} className="flex items-center gap-2 cursor-pointer">
                              <RefreshCw className="h-3.5 w-3.5" /> Convert
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownload(doc)} className="flex items-center gap-2 cursor-pointer">
                            <Download className="h-3.5 w-3.5" /> Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Global Operations Grid */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Omni PDF Operations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link href="/merge">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Merge className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Merge PDFs</CardTitle>
                    <CardDescription className="text-xs">Combine documents</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/split">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Split PDF</CardTitle>
                    <CardDescription className="text-xs">Extract target sheets</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/compress">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Compress PDF</CardTitle>
                    <CardDescription className="text-xs">Shrink bundle bytesize</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/ocr">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">OCR Engine</CardTitle>
                    <CardDescription className="text-xs">Extract text streams</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/convert">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Convert</CardTitle>
                    <CardDescription className="text-xs">PDF ↔ Word, PNG, JPG</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/search">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Search</CardTitle>
                    <CardDescription className="text-xs">Find text in documents</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/annotate">
              <Card className="hover:border-emerald-600/40 hover:shadow-sm transition cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Highlighter className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Annotate</CardTitle>
                    <CardDescription className="text-xs">Highlight, draw & notes</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

          </div>
        </div>
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