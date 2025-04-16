import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { marked } from 'marked';

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Supported export formats
const SUPPORTED_FORMATS = ['markdown', 'text', 'html'];

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
    
    // Get analysis ID and format from query params
    const url = new URL(request.url);
    const analysisId = url.searchParams.get('id');
    const format = url.searchParams.get('format') || 'markdown';
    
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'No analysis ID provided' },
        { status: 400 }
      );
    }
    
    // Validate format
    if (!SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported export format' },
        { status: 400 }
      );
    }
    
    // Path to session directory
    const sessionDir = path.join(UPLOAD_DIR, sessionId);
    
    // Check if directory exists
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Path to analysis file
    const analysisPath = path.join(sessionDir, `analysis_${analysisId}.json`);
    
    // Check if analysis exists
    if (!fs.existsSync(analysisPath)) {
      return NextResponse.json(
        { success: false, error: 'Analysis result not found' },
        { status: 404 }
      );
    }
    
    // Read analysis result
    const content = await readFile(analysisPath, 'utf-8');
    const analysisResult = JSON.parse(content);
    
    // Create filename based on prompt name (or default if none)
    const promptName = analysisResult.promptName || 'analysis';
    const sanitizedName = promptName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${sanitizedName}_${timestamp}`;
    
    // Format the content based on requested format
    let exportContent = analysisResult.content;
    let contentType = 'text/plain';
    let fileExtension = 'txt';
    
    if (format === 'markdown') {
      contentType = 'text/markdown';
      fileExtension = 'md';
    } else if (format === 'html') {
      exportContent = marked(analysisResult.content);
      contentType = 'text/html';
      fileExtension = 'html';
      
      // Wrap in basic HTML structure
      exportContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${promptName} - Analysis</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    h1, h2, h3 { margin-top: 1.5em; }
  </style>
</head>
<body>
  <h1>${promptName} - Analysis</h1>
  <div class="content">
${exportContent}
  </div>
</body>
</html>`;
    }
    
    // Set filename for download
    const fullFilename = `${filename}.${fileExtension}`;
    
    // Return formatted content with appropriate headers
    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fullFilename)}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export analysis' },
      { status: 500 }
    );
  }
} 