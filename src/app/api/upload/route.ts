import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import crypto from "crypto";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Magic bytes validator to verify real image contents (ignoring spoofed headers/extensions).
 */
function detectImageFormat(buffer: Buffer): { ext: string; mime: string } | null {
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

  return null;
}

/**
 * Direct Admin Media File Upload API.
 * Enforces admin authorization, content-length limits, magic byte image validation, and collision-proof file writing.
 */
export async function POST(request: Request) {
  try {
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
      } catch (authErr) {
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

    // 5. Detect and validate image bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedFormat = detectImageFormat(buffer);

    if (!detectedFormat) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file content. Uploaded file must be a genuine JPEG, PNG, WEBP, or GIF image.",
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

    // 7. Write to public/uploads with flag 'wx' (exclusive creation)
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer, { flag: "wx" });

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
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
