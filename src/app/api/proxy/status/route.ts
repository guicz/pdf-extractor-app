import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import { PDF_EXTRACTOR_CONFIG } from '@/lib/config/environment';

// Define OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Force using port 56002
    const API_ENDPOINT = 'http://localhost:56002/status';
    console.log(`Proxying status request to ${API_ENDPOINT}`, {
      configuredUrl: PDF_EXTRACTOR_CONFIG.API_URL
    });
    
    // Add retry logic for better reliability
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Proxy attempt ${attempts}/${maxAttempts} to ${API_ENDPOINT}`);
        const response = await axios.get(API_ENDPOINT, {
          headers: {
            'Authorization': `Bearer ${PDF_EXTRACTOR_CONFIG.API_KEY}`,
          },
          timeout: 5000, // 5 second timeout
        });
        
        console.log('Status check successful:', response.data);
        return NextResponse.json(response.data, { status: 200 });
      } catch (error) {
        lastError = error;
        console.error(`Status check attempt ${attempts} failed:`, error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.error('All proxy attempts failed:', lastError);
    
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
    console.error('Proxy status error:', error);
    return NextResponse.json(
      { error: 'Internal server error in proxy', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 