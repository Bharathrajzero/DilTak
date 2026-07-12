# DilTak PDF Editor

A fully functional PDF editing web application built with Next.js 14, React 18, TypeScript, and Tailwind CSS. Edit, merge, split, compress, convert, and OCR PDFs entirely in your browser — no external services required.

## Features

- **PDF Editor** — Add text, images, and freehand drawings on PDF pages
- **Annotations** — Highlight, underline, strikethrough, and sticky notes
- **Merge PDFs** — Combine multiple PDFs with drag-and-drop reordering
- **Split PDFs** — Extract pages by range or split into chunks
- **Compress PDFs** — Reduce file size with Low / Medium / High levels
- **Convert** — PDF to PNG/JPG, or images to PDF
- **OCR** — Extract text from scanned documents using Tesseract.js
- **Search** — Full-text search across documents
- **Undo / Redo** — Up to 50 actions
- **Autosave** — Automatic session backup every 30 seconds
- **Dark Mode** — System-aware theme with manual toggle
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS, Shadcn UI |
| PDF Rendering | PDF.js |
| PDF Manipulation | pdf-lib |
| Canvas Editing | Fabric.js |
| OCR | Tesseract.js |
| State | Zustand |
| Database | Prisma + SQLite |
| Validation | Zod |
| Forms | React Hook Form |
| Notifications | Sonner |
| Icons | Lucide React |
| Themes | next-themes |

## Installation

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate dev

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── annotate/       # Annotation tool
│   │   ├── compress/       # Compress PDFs
│   │   ├── convert/        # Convert PDFs
│   │   ├── dashboard/      # File management
│   │   ├── login/          # Login page
│   │   ├── merge/          # Merge PDFs
│   │   ├── ocr/            # OCR extraction
│   │   ├── register/       # Register page
│   │   ├── search/         # Search page
│   │   ├── settings/       # Settings
│   │   ├── split/          # Split PDFs
│   │   └── api/            # API routes (upload, documents, autosave, annotations, files)
│   ├── components/
│   │   ├── editor/         # pdf-canvas, text-toolbar
│   │   ├── layout/         # theme-provider
│   │   └── ui/             # Shadcn components
│   ├── hooks/              # useAutosave, useCommandHistory
│   ├── lib/                # prisma, utils
│   ├── services/           # pdfService, storageService
│   ├── store/              # editorStore (Zustand)
│   ├── types/              # TypeScript types
│   └── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── dev.db
├── storage/
│   ├── uploads/
│   ├── edited/
│   ├── exports/
│   ├── thumbnails/
│   ├── autosave/
│   └── ocr/
└── public/
```

## Database Schema

- **Document** — id, title, originalFileName, filePath, fileSize, pageCount, thumbnailPath, createdAt, updatedAt
- **DocumentVersion** — id, documentId, versionNumber, filePath, createdAt
- **Annotation** — id, documentId, pageNumber, type, content, x, y, width, height, color
- **OCRResult** — id, documentId, pageNumber, extractedText, createdAt
- **Autosave** — id, documentId, sessionData, updatedAt

## Troubleshooting

**PDF.js worker not loading:**
```js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

**Reset database:**
```bash
del prisma\dev.db
npx prisma migrate dev
```

**Clear storage:**
```bash
del /q storage\uploads\*
del /q storage\edited\*
```

## Browser Compatibility

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## License

MIT License
