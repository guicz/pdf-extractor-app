import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { stat, readFile } from 'fs/promises';

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string; filename: string } }
) {
  try {
    const { sessionId, filename } = params;

    // Prevent directory traversal attacks
    const sanitizedSessionId = sessionId.replace(/\.\./g, '');
    const sanitizedFilename = filename.replace(/\.\./g, '');
    
    const filePath = path.join(UPLOAD_DIR, sanitizedSessionId, sanitizedFilename);
    
    // Check if file exists
    try {
      await stat(filePath);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.txt') contentType = 'text/plain';
    
    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(sanitizedFilename)}"`,
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to serve file' },
      { status: 500 }
    );
  }
} 