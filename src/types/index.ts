export interface PDFDocument {
  id: string
  title: string
  originalFileName: string
  filePath: string
  fileSize: number
  pageCount: number
  thumbnailPath: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Annotation {
  id: string
  documentId: string
  pageNumber: number
  type: 'text' | 'highlight' | 'underline' | 'strikethrough' | 'note' | 'drawing' | 'image'
  content?: string
  x: number
  y: number
  width: number
  height: number
  color?: string
}

export interface CanvasObject {
  type: 'text' | 'image' | 'drawing'
  left: number
  top: number
  width?: number
  height?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fill?: string
  src?: string
  strokeWidth?: number
  stroke?: string
}

export interface EditorState {
  documentId: string
  pageNumber: number
  zoom: number
  objects: CanvasObject[]
  annotations: Annotation[]
}

export interface CommandHistory {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}
