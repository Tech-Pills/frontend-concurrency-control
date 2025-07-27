# Frontend Concurrency Control

A React + TypeScript project demonstrating different approaches to file upload concurrency control using AWS S3 with LocalStack for local development.

## Overview

This project explores three distinct concurrency patterns for file uploads to S3:
1. **Sequential Upload** - complexity with blocking phases
2. **Async Batch Upload** - complexity with parallel processing within phases  
3. **Streaming Upload** - complexity with real-time progress tracking and mutex protection

Each implementation showcases different levels of concurrency control, from basic sequential processing to advanced streaming with race condition management using async-mutex.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **AWS SDK**: @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner
- **Concurrency**: async-mutex for race condition management
- **Local Infrastructure**: LocalStack + Docker + Nginx (CORS proxy)
- **Development**: ESLint + TypeScript strict mode

## Project Structure

```
src/
├── infra/
│   ├── S3Client.ts          # LocalStack S3 client configuration
│   └── crypto.ts            # MD5 integrity checking utilities
├── useCases/
│   ├── useSequentialUpload.ts # Sequential upload implementation
│   ├── useAsyncBatchUpload.ts # Batch async upload implementation
│   └── useStreamingUpload.ts  # Streaming upload with mutex protection
├── types/
│   └── uploadProgress.ts    # Unified progress tracking interfaces
├── blog/
│   ├── PT-BR.md            # Portuguese technical article
│   └── EN-US.md            # English technical article
├── App.tsx                  # Main application with centralized file display
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


### Security Features
- Pre-signed URLs for secure uploads
- MD5 integrity checking with Content-MD5 headers
- File validation and size limits

## Usage

1. **Start the application**: Follow the Development Setup steps above
2. **Select files**: Use the file input to choose multiple files
3. **Choose strategy**: Select from "Sequential", "Batch (Async)", or "Streaming" upload
4. **Run test**: Click the upload button and observe the performance
5. **Monitor progress**: For streaming uploads, watch real-time file-by-file progress
6. **Compare results**: Switch strategies and run again to compare performance
7. **View metrics**: Check the results table for detailed timing comparisons and percentage improvements

## Troubleshooting

### LocalStack Issues
- Ensure Docker is running: `docker ps`
- Check LocalStack logs: `docker-compose logs localstack`
- Verify bucket creation: Check LocalStack dashboard

### CORS Issues
- Nginx proxy should handle CORS automatically
- Verify nginx container is running: `docker-compose ps`

### Upload Failures
- Check network connectivity to LocalStack
- Verify pre-signed URL generation
- Check file size limits (100MB max)

### Performance Issues
- Browser connection limits affect batch performance
- LocalStack resource constraints in Docker
- Network saturation with many concurrent uploads

## Key Dependencies

- **async-mutex**: Race condition management for concurrent operations
- **crypto-js**: MD5 hash generation for file integrity
- **@aws-sdk/client-s3**: AWS S3 client for bucket operations
- **@aws-sdk/s3-request-presigner**: Pre-signed URL generation

## Resources

- [AWS S3 Upload Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)
- [Pre-signed URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [Object Integrity Checking](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html)
- [LocalStack Documentation](https://docs.localstack.cloud/)
- [async-mutex Library](https://github.com/DirtyHairy/async-mutex)
- [XMLHttpRequest Progress Events](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)
