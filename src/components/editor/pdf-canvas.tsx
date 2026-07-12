"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { fabric } from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

export interface PDFCanvasHandle {
  addText: () => void
  addWhiteout: () => void
  addHighlight: () => void
  setDrawMode: (on: boolean) => void
  setDrawColor: (color: string) => void
  setDrawWidth: (width: number) => void
  undo: () => void
  redo: () => void
  getCanvas: () => fabric.Canvas | null
  exportPNG: () => Promise<string | null>
  isReady: () => boolean
}

interface Props {
  documentPath: string
  pageNumber: number
  zoom: number
}

const PDFCanvas = forwardRef<PDFCanvasHandle, Props>(({ documentPath, pageNumber, zoom }, ref) => {
  // Mount point — Fabric owns everything inside this div
  const mountRef = useRef<HTMLDivElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const pdfDataUrlRef = useRef<string>('')
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const loadingRef = useRef(false)
  const initDoneRef = useRef(false)
  const readyRef = useRef(false)

  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const saveHistory = (fc: fabric.Canvas) => {
    const json = JSON.stringify(fc.toJSON(['data']))
    const sliced = historyRef.current.slice(0, historyIndexRef.current + 1)
    sliced.push(json)
    if (sliced.length > 50) sliced.shift()
    historyRef.current = sliced
    historyIndexRef.current = sliced.length - 1
  }

  useImperativeHandle(ref, () => ({
    addText: () => {
      const fc = fabricRef.current
      if (!fc) return
      const text = new fabric.IText('Type here', {
        left: Math.max(20, fc.getWidth() / 2 - 60),
        top: Math.max(20, fc.getHeight() / 2 - 12),
        fontSize: 18,
        fill: '#000000',
        fontFamily: 'Arial',
        padding: 4,
        data: { type: 'text' },
      })
      fc.add(text)
      fc.setActiveObject(text)
      fc.renderAll()
      text.enterEditing()
      text.selectAll()
      saveHistory(fc)
    },

    addWhiteout: () => {
      const fc = fabricRef.current
      if (!fc) return
      const rect = new fabric.Rect({
        left: 60, top: 60,
        width: 220, height: 44,
        fill: '#ffffff',
        stroke: '#cbd5e1', strokeWidth: 1,
        rx: 2, ry: 2,
        data: { type: 'whiteout' },
      })
      fc.add(rect)
      fc.setActiveObject(rect)
      fc.renderAll()
      saveHistory(fc)
    },

    addHighlight: () => {
      const fc = fabricRef.current
      if (!fc) return
      const rect = new fabric.Rect({
        left: 60, top: 60,
        width: 220, height: 26,
        fill: 'rgba(254,240,138,0.55)',
        stroke: 'rgba(202,138,4,0.3)', strokeWidth: 1,
        data: { type: 'highlight' },
      })
      fc.add(rect)
      fc.setActiveObject(rect)
      fc.renderAll()
      saveHistory(fc)
    },

    setDrawMode: (on: boolean) => {
      const fc = fabricRef.current
      if (!fc) return
      fc.isDrawingMode = on
    },

    setDrawColor: (color: string) => {
      const fc = fabricRef.current
      if (!fc) return
      fc.freeDrawingBrush.color = color
    },

    setDrawWidth: (width: number) => {
      const fc = fabricRef.current
      if (!fc) return
      fc.freeDrawingBrush.width = width
    },

    undo: () => {
      const fc = fabricRef.current
      if (!fc || historyIndexRef.current <= 0) return
      historyIndexRef.current -= 1
      fc.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        applyBackground(fc)
        fc.renderAll()
      })
    },

    redo: () => {
      const fc = fabricRef.current
      if (!fc || historyIndexRef.current >= historyRef.current.length - 1) return
      historyIndexRef.current += 1
      fc.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
        applyBackground(fc)
        fc.renderAll()
      })
    },

    getCanvas: () => fabricRef.current,

    exportPNG: () => new Promise<string | null>((resolve) => {
      const fc = fabricRef.current
      if (!fc || !readyRef.current) { resolve(null); return }
      fc.discardActiveObject()
      // renderAll is sync but setBackgroundImage callback may still be pending
      // so we render, then resolve on next animation frame to ensure paint is done
      fc.renderAll()
      requestAnimationFrame(() => {
        resolve(fc.toDataURL({ format: 'png', quality: 1 }))
      })
    }),

    isReady: () => readyRef.current,
  }))

  const applyBackground = (fc: fabric.Canvas) => {
    if (!pdfDataUrlRef.current) return
    fc.setBackgroundImage(
      pdfDataUrlRef.current,
      () => fc.renderAll(),
      { scaleX: 1, scaleY: 1 }
    )
  }

  // Init Fabric ONCE — create a real <canvas> element ourselves, append to mount div
  useEffect(() => {
    const mount = mountRef.current
    if (!mount || initDoneRef.current) return
    initDoneRef.current = true

    const canvasEl = document.createElement('canvas')
    canvasEl.id = 'pdf-editor-canvas'
    mount.appendChild(canvasEl)

    const fc = new fabric.Canvas(canvasEl, {
      width: 816,
      height: 1056,
      backgroundColor: '#ffffff',
      selection: true,
    })
    fabricRef.current = fc

    fc.on('object:modified', () => saveHistory(fc))
    fc.on('path:created', () => saveHistory(fc))

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if ((e.key === 'Delete' || e.key === 'Backspace') && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        const obj = fc.getActiveObject()
        if (obj) { fc.remove(obj); fc.discardActiveObject(); fc.renderAll(); saveHistory(fc) }
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      initDoneRef.current = false
      readyRef.current = false
      try { fc.dispose() } catch (_) {}
      fabricRef.current = null
      if (mount.contains(canvasEl)) mount.removeChild(canvasEl)
    }
  }, [])

  // Load PDF whenever path / page / zoom changes
  useEffect(() => {
    if (!documentPath) return
    // Wait for Fabric to be ready (dynamic import may delay it)
    let cancelled = false
    const run = async () => {
      let waited = 0
      while (!fabricRef.current && waited < 3000) {
        await new Promise(r => setTimeout(r, 80))
        waited += 80
      }
      if (!cancelled) loadPage()
    }
    run()
    return () => { cancelled = true }
  }, [documentPath, pageNumber, zoom])

  const loadPage = async () => {
    if (loadingRef.current) return
    const fc = fabricRef.current
    if (!fc) return
    loadingRef.current = true
    setPdfLoading(true)
    setPdfError(null)

    try {
      const qs = documentPath.includes('?') ? documentPath.split('?')[1] : ''
      const param = qs.split('&').find(p => p.startsWith('filename='))
      const fname = param
        ? decodeURIComponent(param.replace('filename=', ''))
        : documentPath.split('/').pop() || 'document.pdf'
      const pdfUrl = `/api/files?filename=${encodeURIComponent(fname)}`

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: zoom * 1.5 })

      const offscreen = document.createElement('canvas')
      offscreen.width = Math.floor(viewport.width)
      offscreen.height = Math.floor(viewport.height)
      const ctx = offscreen.getContext('2d')
      if (!ctx) throw new Error('Could not get 2D context for offscreen canvas')
      await page.render({ canvasContext: ctx, viewport }).promise

      pdfDataUrlRef.current = offscreen.toDataURL()

      fc.setDimensions({ width: offscreen.width, height: offscreen.height })
      fc.setBackgroundImage(pdfDataUrlRef.current, () => {
        fc.renderAll()
        readyRef.current = true
        setPdfLoading(false)
        if (historyRef.current.length === 0) {
          const json = JSON.stringify(fc.toJSON(['data']))
          historyRef.current = [json]
          historyIndexRef.current = 0
        }
      }, { scaleX: 1, scaleY: 1 })
    } catch (err: any) {
      console.error('PDF load error:', err)
      setPdfError(err?.message ?? 'Failed to load PDF')
      setPdfLoading(false)
    } finally {
      loadingRef.current = false
    }
  }

  return (
    <div className="relative inline-block shadow-xl bg-white">
      {pdfLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 min-w-[816px] min-h-[1056px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-9 w-9 border-4 border-[#1D9E75] border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}
      {pdfError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 min-w-[816px] min-h-[200px]">
          <div className="text-center p-6 max-w-sm">
            <p className="text-red-500 font-semibold mb-1">Failed to load PDF</p>
            <p className="text-xs text-muted-foreground font-mono mb-3">{pdfError}</p>
            <button
              onClick={() => { setPdfError(null); loadPage() }}
              className="px-4 py-1.5 bg-[#1D9E75] text-white text-sm rounded hover:bg-[#157A5A]"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Fabric mounts its own canvas inside here */}
      <div ref={mountRef} />
    </div>
  )
})

PDFCanvas.displayName = 'PDFCanvas'
export default PDFCanvas
