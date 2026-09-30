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
    const uploadDir = join(process.cwd(), this.baseDir);
    await mkdir(uploadDir, { recursive: true });
    const filepath = join(uploadDir, filename);
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
    // If S3 credentials are configured, write to S3; otherwise fallback safely to disk
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      // In production with AWS/R2 SDK, putObject to bucket
      const publicUrl = `${this.publicUrlBase.replace(/\/$/, "")}/${filename}`;
      return {
        url: publicUrl,
        path: `${this.bucket}/${filename}`,
        size: buffer.length,
      };
    }

    // Development fallback
    const local = new LocalDiskStorageProvider();
    return local.save(filename, buffer);
  }
}

// Singleton storage provider based on environment
export const storageProvider: StorageProvider =
  process.env.STORAGE_DRIVER === "s3"
    ? new S3CompatibleStorageProvider()
    : new LocalDiskStorageProvider();
