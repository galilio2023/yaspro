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
 * Cloudinary storage provider (Smart Media DAM + Global CDN).
 * Activated automatically when CLOUDINARY_CLOUD_NAME is defined,
 * or when STORAGE_DRIVER === "cloudinary".
 */
export class CloudinaryStorageProvider implements StorageProvider {
  private folder: string;

  constructor(folder = process.env.CLOUDINARY_FOLDER || "yaspro") {
    this.folder = folder;
  }

  async save(filename: string, buffer: Buffer): Promise<UploadResult> {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      // Strip extension for Cloudinary public_id
      const publicId = filename.replace(/\.[^/.]+$/, "");

      return new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: this.folder,
            public_id: publicId,
            resource_type: "auto",
            overwrite: true,
          },
          (error, result) => {
            if (error || !result) {
              return reject(new Error(error?.message || "Cloudinary upload failed"));
            }
            resolve({
              url: result.secure_url,
              path: result.public_id,
              size: result.bytes || buffer.length,
            });
          }
        );

        uploadStream.end(buffer);
      });
    } catch (err: unknown) {
      throw new Error(
        `Failed to persist file to Cloudinary: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

// Singleton storage provider based on environment
export const storageProvider: StorageProvider =
  process.env.STORAGE_DRIVER === "cloudinary" ||
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    ? new CloudinaryStorageProvider()
    : process.env.STORAGE_DRIVER === "s3"
      ? new S3CompatibleStorageProvider()
      : new LocalDiskStorageProvider();


