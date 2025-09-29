import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createCsvUploadRecord, processCsvFile } from '@/lib/csv-processor';


export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/upload called');
    console.log('Environment check - DATABASE_URL:', !!process.env.DATABASE_URL);
    console.log('Environment check - BLOB_READ_WRITE_TOKEN:', !!process.env.BLOB_READ_WRITE_TOKEN);

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
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    console.log('About to test blob upload');
    try {
      // Test blob upload with a simple text file
      const testContent = 'test content';
      const blob = await put(`test_${Date.now()}.txt`, testContent, {
        access: 'public',
        contentType: 'text/plain',
      });
      console.log('Blob upload test successful:', blob.url);
    } catch (blobError) {
      console.error('Blob upload test failed:', blobError);
      return NextResponse.json(
        { error: `Blob upload failed: ${blobError instanceof Error ? blobError.message : 'Unknown error'}` },
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
