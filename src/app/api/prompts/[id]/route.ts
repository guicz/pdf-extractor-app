import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { readFile, writeFile } from 'fs/promises';

// Define prompts directory
const PROMPTS_DIR = path.join(process.cwd(), 'data', 'prompts');

// Helper to get prompt file path
function getPromptFilePath(sessionId: string, promptId: string) {
  return path.join(PROMPTS_DIR, sessionId, `${promptId}.json`);
}

// Update a prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id;
    
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 400 }
      );
    }
    
    // Get prompt file path
    const promptPath = getPromptFilePath(sessionId, promptId);
    
    // Check if prompt exists
    if (!fs.existsSync(promptPath)) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Read existing prompt data
    const promptData = JSON.parse(await readFile(promptPath, 'utf-8'));
    
    // Check if this is a preset prompt (cannot be modified)
    if (promptData.isPreset) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify preset prompts' },
        { status: 403 }
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
    
    // Update prompt
    const updatedPrompt = {
      ...promptData,
      name,
      content,
      updatedAt: new Date().toISOString(),
    };
    
    // Save updated prompt
    await writeFile(promptPath, JSON.stringify(updatedPrompt, null, 2));
    
    return NextResponse.json({ success: true, prompt: updatedPrompt });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// Delete a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id;
    
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 400 }
      );
    }
    
    // Get prompt file path
    const promptPath = getPromptFilePath(sessionId, promptId);
    
    // Check if prompt exists
    if (!fs.existsSync(promptPath)) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Read prompt data to check if it's a preset
    const promptData = JSON.parse(await readFile(promptPath, 'utf-8'));
    
    // Check if this is a preset prompt (cannot be deleted)
    if (promptData.isPreset) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete preset prompts' },
        { status: 403 }
      );
    }
    
    // Delete prompt file
    fs.unlinkSync(promptPath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
} 