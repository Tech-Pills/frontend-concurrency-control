import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  HeadBucketCommand,
  type CreateBucketCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type LocalS3SimulatorOptions = {
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
};

class LocalS3Simulator {
  readonly client: S3Client;
  readonly bucket: string;
  readonly baseUrl: string;

  constructor(options: LocalS3SimulatorOptions = {}) {
    this.client = new S3Client({
      region: options.region || "us-east-1",
      endpoint: options.endpoint || "http://localhost:4566",
      forcePathStyle: true,
      credentials: {
        accessKeyId: options.accessKeyId || "test",
        secretAccessKey: options.secretAccessKey || "test",
      },
    });

    this.bucket = options.bucket || "test-uploads";
    this.baseUrl = options.endpoint || "http://localhost:4566";
  }

  async bucketExists(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch (error) {
      console.error("Bucket does not exist or access denied:", error);
      return false;
    }
  }

  async createBucket(): Promise<CreateBucketCommandOutput | undefined> {
    try {
      const exists = await this.bucketExists();
      if (exists) {
        return undefined;
      }

      const data = await this.client.send(
        new CreateBucketCommand({ Bucket: this.bucket })
      );

      return data;
    } catch (error) {
      console.error("Error creating bucket:", error);
      throw error;
    }
  }

  async generateSignedUploadUrl(fileName: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      ContentType: "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: 60 * 60, // 1 hour
    });

    return signedUrl;
  }
}

export { LocalS3Simulator };
