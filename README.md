# Frontend Concurrency Control

A React + TypeScript project demonstrating different approaches to file upload concurrency control using AWS S3 with LocalStack for local development.

## Overview

This project explores various concurrency patterns for file uploads to S3, starting with sequential uploads and progressing to more sophisticated parallel upload strategies. It uses LocalStack to simulate AWS S3 locally for development and testing.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **AWS SDK**: @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner
- **Local Infrastructure**: LocalStack + Docker + Nginx (CORS proxy)
- **Development**: ESLint + TypeScript strict mode

## Project Structure

```
src/
├── infra/
│   ├── S3Client.ts          # LocalStack S3 client configuration
│   ├── S3UploadService.ts   # Upload service implementations
│   └── crypto.ts            # MD5 integrity checking utilities
├── useCases/
│   └── useSequentialUpload.ts # Upload strategy implementations
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## Prerequisites

- Node.js (18+)
- Docker & Docker Compose
- npm or yarn

## Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd frontend-concurrency-control
   npm install
   ```

2. **Start LocalStack infrastructure**:
   ```bash
   docker-compose up -d
   ```
   This starts:
   - LocalStack S3 service on port 4566
   - Nginx CORS proxy for frontend access

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## LocalStack Configuration

The project uses LocalStack to simulate AWS S3 locally:

- **Endpoint**: `http://localhost:4566`
- **Region**: `us-east-1`
- **Credentials**: `test`/`test` (development only)
- **Default Bucket**: `test-uploads`

### CORS Configuration

Nginx proxy handles CORS issues between the frontend and LocalStack:
- Frontend requests go to `localhost:4566` (Nginx)
- Nginx proxies to LocalStack with proper CORS headers
- Supports file uploads up to 100MB

## Features

### Upload Strategies

1. **Sequential Upload**: Files uploaded one after another
2. **Parallel Upload**: Multiple concurrent uploads (coming soon)
3. **Batch Upload**: Chunked parallel processing (coming soon)

### Security Features

- Pre-signed URLs for secure uploads
- MD5 integrity checking
- File validation and size limits

## Resources

- [AWS S3 Upload Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)
- [Pre-signed URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [Object Integrity Checking](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html)
- [LocalStack Documentation](https://docs.localstack.cloud/)
