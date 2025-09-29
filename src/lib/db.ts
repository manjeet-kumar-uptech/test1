import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = neon(process.env.DATABASE_URL);

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
