import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  FilePen,
  LayoutList,
  Scissors,
  SlidersHorizontal,
  FileImage,
  ScanText,
  Search,
  Highlighter,
  Upload,
  Lock,
  Zap,
  WifiOff,
  Settings, // Added Settings icon
} from "lucide-react"

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

const features: { icon: React.ReactNode; name: string; desc: string; href: string }[] = [
  {
    icon: <FilePen className="h-5 w-5" />,
    name: "Edit",
    desc: "Add text, images, and freehand drawings",
    href: "/dashboard",
  },
  {
    icon: <LayoutList className="h-5 w-5" />,
    name: "Merge",
    desc: "Combine multiple PDFs into one document",
    href: "/merge",
  },
  {
    icon: <Scissors className="h-5 w-5" />,
    name: "Split",
    desc: "Extract pages or split by custom range",
    href: "/split",
  },
  {
    icon: <SlidersHorizontal className="h-5 w-5" />,
    name: "Compress",
    desc: "Shrink file size, keep the quality",
    href: "/compress",
  },
  {
    icon: <FileImage className="h-5 w-5" />,
    name: "Convert",
    desc: "PDF to images, or images to PDF",
    href: "/convert",
  },
  {
    icon: <ScanText className="h-5 w-5" />,
    name: "OCR",
    desc: "Extract text from scanned documents",
    href: "/ocr",
  },
  {
    icon: <Search className="h-5 w-5" />,
    name: "Search",
    desc: "Find text across every page instantly",
    href: "/search",
  },
  {
    icon: <Highlighter className="h-5 w-5" />,
    name: "Annotate",
    desc: "Highlight, underline, and leave notes",
    href: "/annotate",
  },
]

const pills = [
  { icon: <Lock className="h-3.5 w-3.5" />, label: "Stays local" },
  { icon: <Zap className="h-3.5 w-3.5" />, label: "Instant" },
  { icon: <WifiOff className="h-3.5 w-3.5" />, label: "Works offline" },
]

export default function Home() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&display=swap');
            .fraunces { font-family: 'Fraunces', Georgia, serif; }
          `,
        }}
      />

      <div className="min-h-screen flex flex-col">

        {/* ── Nav ── */}
        <nav className="border-b flex items-center justify-between px-8 py-4">
          <Link href="/">
            <DilTakLogo size="md" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            {/* ── Settings Option ── */}
            <Link 
              href="/settings" 
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="hover:opacity-90"
              style={{ background: "#1D9E75", border: "none" }}
              asChild
            >
              <Link href="/dashboard">
                <Upload className="mr-2 h-4 w-4" />
                Open a PDF
              </Link>
            </Button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section
          className="container mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          style={{ position: "relative", zIndex: 0 }}
        >
          {/* Left */}
          <div>
            <p
              className="text-xs font-medium tracking-widest mb-4 uppercase"
              style={{ color: "#1D9E75" }}
            >
              Local-first · No uploads · Always yours
            </p>
            <h1
              className="fraunces mb-5"
              style={{ fontSize: 48, fontWeight: 300, lineHeight: 1.15, letterSpacing: "-1px" }}
            >
              Documents that{" "}
              <em style={{ fontStyle: "italic", color: "#1D9E75" }}>stay with you.</em>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Merge, split, compress, annotate, and extract text from PDFs — entirely in your browser.
              Nothing leaves your device.
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                className="hover:opacity-90"
                style={{ background: "#1D9E75", border: "none" }}
                asChild
              >
                <Link href="/dashboard">Get started free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">See how it works</Link>
              </Button>
            </div>
          </div>

          {/* Right — stacked doc preview */}
          <div className="rounded-xl border bg-muted/40 p-5 self-start">
            <div className="relative h-52" style={{ isolation: "isolate" }}>
              <div
                className="absolute inset-x-3 top-6 rounded-lg border bg-background p-4 opacity-50"
                style={{ transform: "rotate(1.5deg)", zIndex: 1 }}
              />
              <div
                className="absolute inset-x-1.5 top-3 rounded-lg border bg-background p-4 opacity-75"
                style={{ transform: "rotate(-0.8deg)", zIndex: 2 }}
              />
              <div className="absolute inset-0 rounded-lg border bg-background p-4" style={{ zIndex: 3 }}>
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-3/4 rounded-sm" style={{ background: "#9FE1CB" }} />
                  <div className="h-2 w-full rounded-sm bg-muted" />
                  <div className="h-2 w-1/2 rounded-sm bg-muted" />
                  <div className="h-2 w-full rounded-sm bg-muted" />
                  <div className="h-2 w-3/5 rounded-sm bg-muted" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">contract_v3.pdf</span>
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: "#E1F5EE", color: "#0F6E56" }}
                  >
                    Annotated
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pills.map((p) => (
                <span
                  key={p.label}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-full px-3 py-1"
                >
                  {p.icon}
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          className="container mx-auto px-8 pb-20"
          style={{ position: "relative", zIndex: 0 }}
        >
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            What you can do
          </p>
          <h2
            className="fraunces mb-8"
            style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.5px" }}
          >
            Everything your PDF needs
          </h2>

          <div className="rounded-xl border overflow-hidden">
            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4">
              {features.slice(0, 4).map((f, i) => (
                <Link
                  key={f.name}
                  href={f.href}
                  className={`block p-5 bg-background hover:bg-muted/50 transition-colors ${i > 0 ? "border-l" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "#E1F5EE", color: "#0F6E56" }}
                  >
                    {f.icon}
                  </div>
                  <p className="font-medium text-sm mb-1">{f.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{f.desc}</p>
                </Link>
              ))}
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t">
              {features.slice(4).map((f, i) => (
                <Link
                  key={f.name}
                  href={f.href}
                  className={`block p-5 bg-background hover:bg-muted/50 transition-colors ${i > 0 ? "border-l" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "#E1F5EE", color: "#0F6E56" }}
                  >
                    {f.icon}
                  </div>
                  <p className="font-medium text-sm mb-1">{f.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Strip ── */}
        <section className="border-t border-b bg-muted/40 px-8 py-12">
          <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2
                className="fraunces mb-1"
                style={{ fontSize: 24, fontWeight: 300, letterSpacing: "-0.3px" }}
              >
                Built for people who care where their files go.
              </h2>
              <p className="text-sm text-muted-foreground">
                Zero server uploads. All processing runs in your browser tab.
              </p>
            </div>
            <div className="flex gap-10 shrink-0">
              {[
                { num: "0 kb", label: "data uploaded" },
                { num: "100%", label: "in-browser" },
                { num: "Free", label: "to start" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="fraunces"
                    style={{ fontSize: 30, fontWeight: 300, color: "#1D9E75", letterSpacing: "-1px", lineHeight: 1 }}
                  >
                    {s.num}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t px-8 py-6 mt-auto">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <DilTakLogo size="sm" />
              <p className="text-xs text-muted-foreground mt-1.5">
                © 2025 Alpha Group Ltd. &nbsp;·&nbsp; Designed by Bharath raj
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
    </>
  )
}