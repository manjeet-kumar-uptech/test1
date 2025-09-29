const { Client } = require('pg');
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

    // Parse the DATABASE_URL to get connection details
    const url = new URL(DATABASE_URL);
    const client = new Client({
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    // Split the schema into individual statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement.trim());
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log('Tables created:');
    console.log('- csv_uploads (tracks uploaded CSV files)');
    console.log('- csv_rows (stores individual CSV data rows)');

    await client.end();

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
