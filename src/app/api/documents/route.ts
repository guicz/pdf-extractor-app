import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { readdir, readFile } from 'fs/promises';

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function GET(request: NextRequest) {
  try {
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 400 }
      );
    }
    
    // Path to session directory
    const sessionDir = path.join(UPLOAD_DIR, sessionId);
    
    // Check if directory exists
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json({ success: true, documents: [] });
    }
    
    // Get all JSON files (document metadata)
    const files = await readdir(sessionDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Read each document metadata
    const documents = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(sessionDir, file);
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );
    
    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list documents' },
      { status: 500 }
    );
  }
} 