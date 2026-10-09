import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PDF_EXTRACTOR_CONFIG } from '@/lib/config/environment';
import { getPdfExtractorApiKey } from '@/lib/config/pdfExtractor.server';

// Define OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getPdfExtractorApiKey();
    // Force using port 56002
    const API_ENDPOINT = `http://localhost:56002/extract-pdf`;
    console.log(`Proxying extract-pdf request to ${API_ENDPOINT}`, {
      configuredUrl: PDF_EXTRACTOR_CONFIG.API_URL
    });
    
    // Get the form data from the request
    const originalFormData = await request.formData();
    
    // Create a new FormData object for the API request
    const apiFormData = new FormData();
    
    // Process the file from the client request
    const file = originalFormData.get('file') as File;
    if (!file) {
      console.error('No file provided in the request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Convert the file to a buffer and append it to the form
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || 'document.pdf';
    
    // Append the file with the correct content type
    apiFormData.append('file', new Blob([fileBuffer], { type: file.type }), fileName);
    
    // Add optional parameters if they exist
    const prompt = originalFormData.get('prompt');
    if (prompt) {
      apiFormData.append('prompt', prompt.toString());
      console.log('Custom prompt included in request');
    }
    
    const useOCR = originalFormData.get('use_ocr');
    if (useOCR) {
      apiFormData.append('use_ocr', useOCR.toString());
      console.log('OCR processing enabled');
    }
    
    // Add retry logic for better reliability
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Proxy attempt ${attempts}/${maxAttempts} to ${API_ENDPOINT}`);
        const response = await axios.post(API_ENDPOINT, apiFormData, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minute timeout for PDF extraction
        });
        
        console.log('PDF extraction successful');
        return NextResponse.json(response.data, { status: 200 });
      } catch (error) {
        lastError = error;
        console.error(`Proxy attempt ${attempts} failed:`, error instanceof Error ? error.message : 'Unknown error');
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.error('All proxy attempts failed:', lastError instanceof Error ? lastError.message : 'Unknown error');
    
    if (axios.isAxiosError(lastError)) {
      if (lastError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Cannot connect to PDF Extractor API. The service may be down.' },
          { status: 503 }
        );
      }
      
      if (lastError.response) {
        // The request was made and the server responded with an error status
        return NextResponse.json(
          { error: `API Error: ${lastError.response.status}`, details: lastError.response.data },
          { status: lastError.response.status }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Unknown error occurred while accessing PDF Extractor API' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Proxy extract-pdf error:', error);
    return NextResponse.json(
      { error: 'Internal server error in proxy', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
