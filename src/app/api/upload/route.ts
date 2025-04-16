import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir(sessionId: string) {
  const sessionDir = path.join(UPLOAD_DIR, sessionId);
  await mkdir(sessionDir, { recursive: true });
  return sessionDir;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get or create sessionId
    let sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Create session directory
    const sessionDir = await ensureUploadDir(sessionId);
    
    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = path.extname(file.name);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(sessionDir, fileName);
    
    // Convert file to ArrayBuffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    
    // Create document metadata
    const document = {
      id: fileId,
      name: file.name,
      path: `/api/files/${sessionId}/${fileName}`,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    // Save metadata in session folder
    const metadataPath = path.join(sessionDir, `${fileId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(document, null, 2));

    // Set cookie for session tracking
    const response = NextResponse.json({ success: true, document });
    response.cookies.set('sessionId', sessionId, { 
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 