import { LocalS3Simulator } from "./S3Client";

export interface CustomFile {
  file: File;
  md5: string;
  preSignedUrl: string;
}

export class S3UploadService {
  private s3Client: LocalS3Simulator;

  constructor(bucket = "test-uploads") {
    this.s3Client = new LocalS3Simulator({ bucket });
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.createBucket();
    } catch (error) {
      console.error("Bucket already exists or error:", error);
    }
  }

  async generateSignedUploadUrl(fileName: string): Promise<string> {
    await this.ensureBucketExists();

    return this.s3Client.generateSignedUploadUrl(fileName);
  }

  async uploadSingleFile(
    customFile: CustomFile,
    signedUrl: string
  ): Promise<Response> {
    try {
      const response = await fetch(signedUrl, {
        method: "PUT",
        body: customFile.file,
        headers: {
          "Content-Type": customFile.file.type,
          "Content-MD5": customFile.md5,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
}
