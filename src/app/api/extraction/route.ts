import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readFile, writeFile } from 'fs/promises';

// Define extractions directory
const EXTRACTIONS_DIR = path.join(process.cwd(), 'data', 'extractions');

// Ensure extractions directory exists
function ensureExtractionsDir() {
  if (!fs.existsSync(EXTRACTIONS_DIR)) {
    fs.mkdirSync(EXTRACTIONS_DIR, { recursive: true });
  }
  return EXTRACTIONS_DIR;
}

export async function POST(request: NextRequest) {
  ensureExtractionsDir();
  
  try {
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const { documentId, content, metadata } = await request.json();
    
    if (!documentId || !content) {
      return NextResponse.json(
        { success: false, error: 'DocumentId and content are required' },
        { status: 400 }
      );
    }
    
    // Generate unique ID
    const extractionId = uuidv4();
    
    // Create extraction result
    const extractionResult = {
      id: extractionId,
      documentId,
      content,
      metadata: metadata || {},
      extractedAt: new Date().toISOString(),
      sessionId // Include the sessionId for permission checks
    };
    
    // Salvar em subpasta por sessão
    const sessionDir = path.join(EXTRACTIONS_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    const extractionPath = path.join(sessionDir, `${extractionId}.json`);
    await writeFile(extractionPath, JSON.stringify(extractionResult, null, 2));
    
    return NextResponse.json({
      success: true,
      extractionResult,
    });
  } catch (error) {
    console.error('Error storing extraction:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

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
    
    // NOVO: Buscar extração mais recente por documentId
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    if (documentId) {
      const sessionDir = path.join(EXTRACTIONS_DIR, sessionId);
      if (!fs.existsSync(sessionDir)) {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
      }
      const files = fs.readdirSync(sessionDir).filter(f => f.endsWith('.json'));
      const extractions = files.map(f => {
        const content = fs.readFileSync(path.join(sessionDir, f), 'utf-8');
        return JSON.parse(content);
      }).filter(e => e.documentId === documentId);
      if (extractions.length === 0) {
        return NextResponse.json({ success: false, error: 'No extraction found for this document' }, { status: 404 });
      }
      extractions.sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime());
      return NextResponse.json({ success: true, extractionResult: extractions[0] });
    }
    
    // Get extraction ID from query params
    const extractionId = url.searchParams.get('id');
    
    if (!extractionId) {
      return NextResponse.json(
        { success: false, error: 'No extraction ID provided' },
        { status: 400 }
      );
    }
    
    // Path to session directory
    const sessionDir = path.join(EXTRACTIONS_DIR, sessionId);
    
    // Check if directory exists
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Path to extraction file
    const extractionPath = path.join(sessionDir, `${extractionId}.json`);
    
    // Check if extraction exists
    if (!fs.existsSync(extractionPath)) {
      return NextResponse.json(
        { success: false, error: 'Extraction result not found' },
        { status: 404 }
      );
    }
    
    // Read extraction result
    const content = await readFile(extractionPath, 'utf-8');
    const extractionResult = JSON.parse(content);
    
    return NextResponse.json({ 
      success: true, 
      extractionResult 
    });
  } catch (error) {
    console.error('Error retrieving extraction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve extraction result' },
      { status: 500 }
    );
  }
} 