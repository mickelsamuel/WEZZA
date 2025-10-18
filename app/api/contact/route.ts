import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/email";
import { escapeHtml, sanitizeEmail, sanitizeText, sanitizeUrl, getSafeErrorMessage, logError } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface CustomOrderRequest {
  name: string;
  email: string;
  hoodieColor: string;
  size: string;
  designNotes: string;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting to prevent spam
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`contact:${ip}`, 3, 300000); // 3 requests per 5 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const data: CustomOrderRequest & { website?: string } = await request.json();
    const { name, email, hoodieColor, size, designNotes, imageUrl, website } = data;

    // SECURITY: Honeypot field check - reject if filled (indicates bot)
    if (website && website.trim() !== '') {
      console.warn('[SECURITY] Honeypot triggered for contact form:', email);
      // Return success to not alert the bot
      return NextResponse.json(
        { message: "Custom order request submitted successfully" },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!name || !email || !hoodieColor || !size || !designNotes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // SECURITY: Validate and sanitize all inputs
    let sanitizedEmail: string;
    try {
      sanitizedEmail = sanitizeEmail(email);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name is too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Validate design notes length
    if (designNotes.length > 5000) {
      return NextResponse.json(
        { error: "Design notes are too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Sanitize text inputs to remove control characters
    const sanitizedName = sanitizeText(name);
    const sanitizedHoodieColor = sanitizeText(hoodieColor);
    const sanitizedSize = sanitizeText(size);
    const sanitizedDesignNotes = sanitizeText(designNotes);

    // SECURITY: Validate and sanitize image URL if provided
    let sanitizedImageUrl: string | undefined;
    if (imageUrl) {
      try {
        sanitizedImageUrl = sanitizeUrl(imageUrl);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid image URL format" },
          { status: 400 }
        );
      }
    }

    // SECURITY: Escape HTML to prevent XSS in emails
    const emailHtml = `
      <h2>New Custom Order Request</h2>
      <p><strong>Customer Name:</strong> ${escapeHtml(sanitizedName)}</p>
      <p><strong>Customer Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
      <p><strong>Hoodie Color:</strong> ${escapeHtml(sanitizedHoodieColor)}</p>
      <p><strong>Size:</strong> ${escapeHtml(sanitizedSize)}</p>
      <p><strong>Design Notes:</strong></p>
      <p>${escapeHtml(sanitizedDesignNotes).replace(/\n/g, '<br>')}</p>
      ${sanitizedImageUrl ? `<p><strong>Design Image:</strong> <a href="${escapeHtml(sanitizedImageUrl)}">${escapeHtml(sanitizedImageUrl)}</a></p>` : ""}
      <hr />
      <p><em>Received via WEZZA Custom Orders form</em></p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: FROM_EMAIL,
      reply_to: sanitizedEmail, // Using sanitized email prevents header injection
      subject: `New Custom Order from ${escapeHtml(sanitizedName)}`,
      html: emailHtml,
    });

    return NextResponse.json({
      message: "Custom order request submitted successfully",
    });
  } catch (error) {
    logError(error, 'contact/route');
    return NextResponse.json(
      { error: getSafeErrorMessage(error) },
      { status: 500 }
    );
  }
}
