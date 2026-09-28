import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Direct Admin Media File Upload API.
 * Saves uploaded assets to public/uploads/ and returns public URL path.
 */
export async function POST(request: Request) {
  try {
    // 1. Authorization check
    const isPreview = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx");
    if (!isPreview || process.env.NODE_ENV === "production") {
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
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Admin credentials required." },
            { status: 401 }
          );
        }
      }
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file was attached to the upload request." },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed formats: JPG, PNG, WEBP, AVIF, GIF.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds maximum permitted size of 10MB." },
        { status: 400 }
      );
    }

    // 5. Generate safe unique filename
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}-${sanitizedBase}.${extension}`;

    // 6. Write file to public/uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = join(uploadsDir, uniqueFileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      sizeBytes: file.size,
      mimeType: file.type,
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
