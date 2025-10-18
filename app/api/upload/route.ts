import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { isAdmin, getSafeErrorMessage, logError } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/upload - Upload image (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // SECURITY: Check admin role (case-insensitive)
    if (!session || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // SECURITY: Rate limiting to prevent upload abuse
    const userId = session.user.id || 'unknown';
    const rateLimit = checkRateLimit(`upload:${userId}`, 20, 60000); // 20 uploads per minute

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many upload requests. Please slow down." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "general"; // product, site, general

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // SECURITY: Validate file type using MIME type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" },
        { status: 400 }
      );
    }

    // Validate filename to prevent path traversal
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate category
    const allowedCategories = ['product', 'site', 'general'];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // SECURITY: Verify magic bytes (file signature) to ensure it's actually an image
    const magicBytes = buffer.slice(0, 12);
    const isValidImage = validateImageMagicBytes(magicBytes);

    if (!isValidImage) {
      return NextResponse.json(
        { error: "File is not a valid image" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `wezza/${category}`,
          resource_type: "auto",
          transformation: [
            { width: 2000, height: 2000, crop: "limit" }, // Max dimensions
            { quality: "auto:good" }, // Auto quality optimization
            { fetch_format: "auto" }, // Auto format (WebP when supported)
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.name,
      size: file.size,
      type: file.type,
      category,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    logError(error, 'upload/route');
    return NextResponse.json({ error: getSafeErrorMessage(error) }, { status: 500 });
  }
}

/**
 * Validate image file by checking magic bytes (file signature)
 * This prevents uploading of non-image files disguised as images
 */
function validateImageMagicBytes(buffer: Buffer): boolean {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return true;
  }

  // GIF: 47 49 46 38 (GIF8)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
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
    return true;
  }

  return false;
}
