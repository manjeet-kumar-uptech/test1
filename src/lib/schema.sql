-- CSV Uploads table to track uploaded files
CREATE TABLE IF NOT EXISTS csv_uploads (
  id VARCHAR(255) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  blob_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  row_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CSV Rows table to store individual rows of data
CREATE TABLE IF NOT EXISTS csv_rows (
  id SERIAL PRIMARY KEY,
  upload_id VARCHAR(255) NOT NULL REFERENCES csv_uploads(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(upload_id, row_index)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_csv_uploads_status ON csv_uploads(status);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_created_at ON csv_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_rows_upload_id ON csv_rows(upload_id);
CREATE INDEX IF NOT EXISTS idx_csv_rows_data ON csv_rows USING GIN(data);

-- Note: Trigger for auto-updating timestamps removed for simplicity
-- You can add it manually in your Neon dashboard if needed
