import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { readFile } from 'fs/promises';

// Define analysis directory
const ANALYSIS_DIR = path.join(process.cwd(), 'data', 'analysis');

// Get the analysis file path
function getAnalysisFilePath(analysisId: string) {
  return path.join(ANALYSIS_DIR, `${analysisId}.json`);
}

// Get analysis by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Read analysis
    const analysisData = JSON.parse(await readFile(analysisPath, 'utf-8'));
    
    // Check if this analysis belongs to the current user's session
    // In a real app, you would have a more robust ownership check
    if (analysisData.sessionId && analysisData.sessionId !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to view this analysis' },
        { status: 403 }
      );
    }
    
    // Return the analysis
    return NextResponse.json({
      success: true,
      analysis: analysisData,
    });
  } catch (error) {
    console.error('Error getting analysis:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 