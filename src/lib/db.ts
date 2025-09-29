import { neon } from '@neondatabase/serverless';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  return url;
}

export const db = neon(getDatabaseUrl());

// Database schema types
export interface CsvUpload {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  blobUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rowCount?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CsvRow {
  id: string;
  uploadId: string;
  rowIndex: number;
  data: Record<string, string | number>;
  createdAt: Date;
}
