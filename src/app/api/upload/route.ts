import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { storageProvider } from "@/lib/storage";
import crypto from "crypto";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

/**
 * Magic bytes validator to verify real media contents (ignoring spoofed headers/extensions).
 */
function detectMediaFormat(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { ext: "gif", mime: "image/gif" };
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  // MP4 / QuickTime: bytes 4-7 are 'ftyp'
  if (
    buffer.length >= 8 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return { ext: "mp4", mime: "video/mp4" };
  }

  return null;
}

export const maxDuration = 60;

/**
 * Direct Admin Media File Upload API.
 * Supports:
 * 1. Cloudinary direct client upload signature generation.
 * 2. Standard Multipart FormData upload with magic byte verification and Cloudinary/storageProvider persistence.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // A. Handle Cloudinary Client-Side Direct Upload Signature Generation
    if (contentType.includes("application/json") && process.env.CLOUDINARY_API_SECRET) {
      if (process.env.NODE_ENV !== "test") {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (!session || (session.user as { role?: string })?.role !== "admin") {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Admin credentials required." },
            { status: 401 }
          );
        }
      }

      const { v2: cloudinary } = await import("cloudinary");
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = process.env.CLOUDINARY_FOLDER || "yaspro";
      const signature = cloudinary.utils.api_sign_request(
        { folder, timestamp },
        process.env.CLOUDINARY_API_SECRET
      );

      return NextResponse.json({
        success: true,
        signature,
        timestamp,
        folder,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      });
    }

    // 1. Enforce admin authentication unconditionally (except unit test runner)
    if (process.env.NODE_ENV !== "test") {
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (!session || (session.user as { role?: string })?.role !== "admin") {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Admin credentials required." },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Admin credentials required." },
          { status: 401 }
        );
      }
    }

    // 2. Ingress Content-Length pre-check to prevent large payload buffering
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE_BYTES + 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Payload exceeds 10MB ingress limit." },
        { status: 413 }
      );
    }

    // 3. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file was attached to the upload request." },
        { status: 400 }
      );
    }

    // 4. File size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds maximum permitted size of 10MB." },
        { status: 400 }
      );
    }

    // 5. Detect and validate media bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedFormat = detectMediaFormat(buffer);

    if (!detectedFormat) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file content. Uploaded file must be a genuine JPEG, PNG, WEBP, GIF, or MP4 media file.",
        },
        { status: 400 }
      );
    }

    // 6. Generate collision-proof filename using random UUID and verified extension
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .slice(0, 24);
    const uniqueFileName = `${Date.now()}-${randomSuffix}-${sanitizedBase || "asset"}.${detectedFormat.ext}`;

    // 7. Write to storage provider
    const saveResult = await storageProvider.save(uniqueFileName, buffer);

    return NextResponse.json({
      success: true,
      url: saveResult.url,
      fileName: uniqueFileName,
      sizeBytes: file.size,
      mimeType: detectedFormat.mime,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message || "Internal file upload failure" },
      { status: 500 }
    );
  }
}
