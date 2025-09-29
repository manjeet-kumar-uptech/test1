# CSV Uploader App

A full-featured CSV file uploader with Papa Parser integration, Vercel Blob storage, and Neon PostgreSQL database. Built with Next.js 15 App Router.

## Features

- 🚀 **Modern Next.js 15** with App Router and TypeScript
- 📁 **Drag & Drop CSV Upload** with react-dropzone
- 📊 **Papa Parser Integration** for robust CSV parsing
- 🗄️ **Neon PostgreSQL** database for data storage
- ☁️ **Vercel Blob Storage** for file storage
- 📈 **Real-time Processing Status** with polling
- 🎨 **Beautiful UI** with Tailwind CSS and dark mode support
- ⚡ **Background Processing** ready for Inngest integration

## Quick Start

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- Vercel Blob Storage token
- GitHub repository

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/csv-uploader-app.git
cd csv-uploader-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_your_token_here"
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"
```

4. **Initialize the database:**
```bash
npm run db:init
```

5. **Start development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage token | ✅ |
| `INNGEST_EVENT_KEY` | Inngest event key (optional) | ❌ |
| `INNGEST_SIGNING_KEY` | Inngest signing key (optional) | ❌ |

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: CSV uploader with Papa Parser and database"
git branch -M main
git remote add origin https://github.com/yourusername/csv-uploader-app.git
git push -u origin main
```

### 2. Deploy on Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   In your Vercel dashboard, go to Project Settings > Environment Variables and add:

   ```
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
   INNGEST_EVENT_KEY=your-inngest-event-key
   INNGEST_SIGNING_KEY=your-inngest-signing-key
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### 3. Set Up Vercel Blob Storage

1. Go to [vercel.com/storage](https://vercel.com/storage)
2. Create a new Blob store
3. Copy the token to your environment variables
4. The token should be: `vercel_blob_rw_...`

### 4. Database Setup

1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Run the database initialization:
   ```bash
   npm run db:init
   ```

## How It Works

1. **Upload**: Users drag & drop or select CSV files
2. **Storage**: Files are stored in Vercel Blob storage
3. **Parsing**: Papa Parser processes CSV with automatic header detection
4. **Database**: Parsed data is stored in PostgreSQL with JSONB format
5. **Status**: Real-time updates show processing progress

## API Endpoints

- `POST /api/upload` - Upload CSV file and start processing
- `GET /api/upload/[id]` - Check upload status and results

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   ├── route.ts          # File upload endpoint
│   │   │   └── [id]/route.ts     # Status check endpoint
│   │   └── inngest/
│   ├── components/
│   │   └── DropZone.tsx          # File upload component
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main upload interface
├── lib/
│   ├── csv-processor.ts          # Papa Parser integration
│   ├── db.ts                     # Database connection
│   └── schema.sql                # Database schema
└── scripts/
    └── init-db.js                # Database initialization
```

## Development

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:init    # Initialize database
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Papa Parser** - CSV parsing
- **Vercel Blob** - File storage
- **Neon PostgreSQL** - Database
- **Inngest** - Background processing (optional)

## License

MIT License - feel free to use this project for your own applications.
