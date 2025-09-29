const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    const db = neon(DATABASE_URL);

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    // Split the schema into individual statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    for (const statement of statements) {
      if (statement.trim()) {
        // Use tagged template literal syntax
        await db(statement.trim());
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log('Tables created:');
    console.log('- csv_uploads (tracks uploaded CSV files)');
    console.log('- csv_rows (stores individual CSV data rows)');

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
