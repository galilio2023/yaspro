import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface StorageProvider {
  save(filename: string, buffer: Buffer): Promise<UploadResult>;
}

/**
 * Local filesystem storage provider (used in development or self-hosted persistent environments).
 */
export class LocalDiskStorageProvider implements StorageProvider {
  private baseDir: string;
  private publicPath: string;

  constructor(baseDir = "public/uploads", publicPath = "/uploads") {
    this.baseDir = baseDir;
    this.publicPath = publicPath;
  }

  async save(filename: string, buffer: Buffer): Promise<UploadResult> {
    const uploadDir = join(/*turbopackIgnore: true*/ process.cwd(), this.baseDir);
    await mkdir(uploadDir, { recursive: true });
    const filepath = join(/*turbopackIgnore: true*/ uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
      url: `${this.publicPath}/${filename}`,
      path: filepath,
      size: buffer.length,
    };
  }
}

/**
 * Cloud storage provider (S3 / Cloudflare R2 / Vercel Blob compatible).
 * Ready for cloud credentials activation without altering upload routes.
 */
export class S3CompatibleStorageProvider implements StorageProvider {
  private bucket: string;
  private publicUrlBase: string;

  constructor(bucket = process.env.S3_BUCKET || "yaspro-uploads", publicUrlBase = process.env.S3_PUBLIC_URL || "") {
    this.bucket = bucket;
    this.publicUrlBase = publicUrlBase;
  }

  async save(filename: string, buffer: Buffer): Promise<UploadResult> {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("S3 object storage upload failed: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required.");
    }

    try {
      // Dynamic import to support optional AWS SDK without bundling penalty for local storage
      // @ts-expect-error - optional runtime dependency
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
      });

      await client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filename,
          Body: buffer,
        })
      );

      const publicUrl = this.publicUrlBase
        ? `${this.publicUrlBase.replace(/\/$/, "")}/${filename}`
        : `https://${this.bucket}.s3.amazonaws.com/${filename}`;

      return {
        url: publicUrl,
        path: `${this.bucket}/${filename}`,
        size: buffer.length,
      };
    } catch (err: unknown) {
      throw new Error(
        `Failed to persist file to S3 object storage: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

/**
 * Vercel Blob cloud storage provider (native Pro edge object store).
 * Activated automatically when BLOB_READ_WRITE_TOKEN is defined in production.
 */
export class VercelBlobStorageProvider implements StorageProvider {
  async save(filename: string, buffer: Buffer): Promise<UploadResult> {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`yaspro/${filename}`, buffer, {
        access: "public",
        addRandomSuffix: false,
      });

      return {
        url: blob.url,
        path: blob.pathname,
        size: buffer.length,
      };
    } catch (err: unknown) {
      throw new Error(
        `Failed to persist file to Vercel Blob: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

// Singleton storage provider based on environment
export const storageProvider: StorageProvider =
  process.env.STORAGE_DRIVER === "s3"
    ? new S3CompatibleStorageProvider()
    : process.env.BLOB_READ_WRITE_TOKEN
      ? new VercelBlobStorageProvider()
      : new LocalDiskStorageProvider();

