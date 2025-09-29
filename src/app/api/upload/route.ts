import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Ensure the blob token is available for the SDK
if (typeof process !== 'undefined' && process.env?.BLOB_READ_WRITE_TOKEN) {
  // The Vercel Blob SDK should automatically read this environment variable
}


export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/upload called');

    // Test environment variable loading
    const dbUrl = process.env.DATABASE_URL;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    console.log('DATABASE_URL exists:', !!dbUrl);
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!blobToken);
    console.log('DATABASE_URL sample:', dbUrl?.substring(0, 30) + '...');
    console.log('BLOB_READ_WRITE_TOKEN sample:', blobToken?.substring(0, 30) + '...');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file ? file.name : 'No file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN not loaded from environment');
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    // Test blob upload with proper token handling
    try {
      console.log('Testing blob upload...');
      const testContent = 'test content for debugging';
      const blob = await put(`debug_${Date.now()}.txt`, testContent, {
        access: 'public',
        contentType: 'text/plain',
      });
      console.log('Blob upload successful:', blob.url);
    } catch (blobError) {
      console.error('Blob upload failed:', blobError);
      const errorMessage = blobError instanceof Error ? blobError.message : 'Unknown blob upload error';
      console.error('Error type:', blobError instanceof Error ? blobError.constructor.name : 'Unknown');
      return NextResponse.json(
        { error: `Blob upload failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    // For testing, just return success without processing
    const mockId = `mock_${Date.now()}`;
    console.log('Mock upload successful');

    return NextResponse.json({
      id: mockId,
      filename: file.name,
      size: file.size,
      message: 'File received successfully (mock response)',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
