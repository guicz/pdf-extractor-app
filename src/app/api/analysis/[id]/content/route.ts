import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { readFile, writeFile } from 'fs/promises';

// Define analysis directory
const ANALYSIS_DIR = path.join(process.cwd(), 'data', 'analysis');

// Ensure the directory exists
async function ensureAnalysisDir() {
  if (!fs.existsSync(ANALYSIS_DIR)) {
    fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
  }
  return ANALYSIS_DIR;
}

// Get the analysis file path
function getAnalysisFilePath(analysisId: string) {
  return path.join(ANALYSIS_DIR, `${analysisId}.json`);
}

// Update analysis content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ensureAnalysisDir();
  
  try {
    const analysisId = params.id;
    
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 400 }
      );
    }
    
    // Check if analysis exists
    const analysisPath = getAnalysisFilePath(analysisId);
    
    if (!fs.existsSync(analysisPath)) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    // Read existing analysis
    const analysisData = JSON.parse(await readFile(analysisPath, 'utf-8'));
    
    // Check if this analysis belongs to the current user's session
    // In a real app, you would have a more robust ownership check
    if (analysisData.sessionId && analysisData.sessionId !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit this analysis' },
        { status: 403 }
      );
    }
    
    // Get the content from the request body
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Update the analysis content
    const updatedAnalysis = {
      ...analysisData,
      content,
      editedAt: new Date().toISOString(),
    };
    
    // Save updated analysis
    await writeFile(analysisPath, JSON.stringify(updatedAnalysis, null, 2));
    
    // Return success
    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
    });
  } catch (error) {
    console.error('Error updating analysis content:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 