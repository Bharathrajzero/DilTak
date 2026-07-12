import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

export class PDFService {
  static async loadPDF(file: File | ArrayBuffer): Promise<PDFDocument> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file
    return await PDFDocument.load(arrayBuffer)
  }

  static async mergePDFs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const pdf = await this.loadPDF(file)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    return await mergedPdf.save()
  }

  static async splitPDF(file: File, startPage: number, endPage: number): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    const newPdf = await PDFDocument.create()
    
    const pages = await newPdf.copyPages(
      pdf,
      Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
    )
    
    pages.forEach(page => newPdf.addPage(page))
    return await newPdf.save()
  }

  static async compressPDF(file: File, level: 'low' | 'medium' | 'high'): Promise<Uint8Array> {
    const pdf = await this.loadPDF(file)
    
    return await pdf.save({
      useObjectStreams: level !== 'low',
      addDefaultPage: false,
      objectsPerTick: level === 'high' ? 50 : 100,
    })
  }

  static async addTextToPDF(
    pdfBytes: Uint8Array,
    text: string,
    x: number,
    y: number,
    pageIndex: number
  ): Promise<Uint8Array> {
    const pdf = await PDFDocument.load(pdfBytes)
    const pages = pdf.getPages()
    const page = pages[pageIndex]
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    page.drawText(text, {
      x,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })

    return await pdf.save()
  }

  static async renderPageToCanvas(
    pdfPath: string,
    pageNumber: number,
    scale: number
  ): Promise<HTMLCanvasElement> {
    const pdfUrl = `/api/files?path=${encodeURIComponent(pdfPath)}`
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(pageNumber)
    
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) throw new Error('Failed to get canvas context')

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    return canvas
  }

  static async extractText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += `\n--- Page ${i} ---\n${pageText}`
    }

    return fullText
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
