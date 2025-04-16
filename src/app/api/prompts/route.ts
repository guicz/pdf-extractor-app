import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Define prompts directory
const PROMPTS_DIR = path.join(process.cwd(), 'data', 'prompts');

// Ensure prompts directory exists
async function ensurePromptsDir(sessionId: string) {
  const sessionDir = path.join(PROMPTS_DIR, sessionId);
  await mkdir(sessionDir, { recursive: true });
  return sessionDir;
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
    
    // Path to session directory
    const sessionDir = path.join(PROMPTS_DIR, sessionId);
    
    // Check if directory exists
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json({ success: true, prompts: [] });
    }
    
    // Get all JSON files (prompt metadata)
    const files = await readdir(sessionDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Read each prompt metadata
    const prompts = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(sessionDir, file);
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );
    
    return NextResponse.json({ success: true, prompts });
  } catch (error) {
    console.error('Error listing prompts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { name, content } = await request.json();
    
    if (!name || !content) {
      return NextResponse.json(
        { success: false, error: 'Name and content are required' },
        { status: 400 }
      );
    }
    
    // Create session directory
    const sessionDir = await ensurePromptsDir(sessionId);
    
    // Generate unique ID
    const promptId = uuidv4();
    
    // Create prompt metadata
    const prompt = {
      id: promptId,
      name,
      content,
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
    
    // Save metadata
    const metadataPath = path.join(sessionDir, `${promptId}.json`);
    await writeFile(metadataPath, JSON.stringify(prompt, null, 2));
    
    return NextResponse.json({ success: true, prompt });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
} 