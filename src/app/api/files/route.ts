import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Normalize parameters: accepts either ?path=... or ?filename=...
    const rawFilename = searchParams.get('path') || searchParams.get('filename') || ''

    if (!rawFilename) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing file identifier parameter (path or filename)' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Decode both %20 and + encoded spaces
    let decodedFilename = decodeURIComponent(rawFilename.replace(/\+/g, ' '))
    
    // If the incoming string is a full path, extract just the filename
    const filenameMatch = decodedFilename.match(/[^\\/]+$/)
    if (filenameMatch) {
      decodedFilename = filenameMatch[0]
    }

    // Map precisely to your system path structure: D:\PDFEDIT\storage\uploads
    const uploadDir = path.join(process.cwd(), 'storage', 'uploads')
    
    // Check path variant 1 (Decoded spaces file names)
    let filePath = path.join(uploadDir, decodedFilename)

    // Fallback path variant 2 (Raw encoded parameter fallback)
    if (!fs.existsSync(filePath)) {
      filePath = path.join(uploadDir, rawFilename)
    }

    // Direct sanity check validation pass
    if (!fs.existsSync(filePath)) {
      console.error(`🔴 Disk Asset Exception: File not found. Inspected structural route: ${filePath}`)
      return new NextResponse(
        JSON.stringify({ 
          error: 'File path asset vectors not found on local disk storage',
          attemptedPath: filePath 
        }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Read asset bytes array stream safely
    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(decodedFilename)}"`,
      },
    })
  } catch (error) {
    console.error("File stream compilation critical error:", error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error Pipeline Breakdown' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}