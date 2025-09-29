import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createCsvUploadRecord, processCsvFile } from '@/lib/csv-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob Storage with unique filename
    const blob = await put(file.name, file, {
      access: 'public',
      contentType: 'text/csv',
      addRandomSuffix: true, // Generate unique filename to avoid conflicts
    });

    // Create database record for this upload
    const uploadId = await createCsvUploadRecord(
      blob.pathname.split('/').pop() || file.name, // filename from blob path
      file.name, // original filename
      file.size,
      blob.url
    );

    // Process the CSV file asynchronously (don't await to avoid timeout)
    processCsvFile(blob.url, uploadId).catch(error => {
      console.error(`Failed to process CSV file ${uploadId}:`, error);
    });

    return NextResponse.json({
      id: uploadId,
      filename: file.name,
      size: file.size,
      url: blob.url,
      message: 'File uploaded successfully. CSV processing has started.',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
