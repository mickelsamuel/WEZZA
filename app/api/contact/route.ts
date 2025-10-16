import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/email";

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
    const data: CustomOrderRequest = await request.json();

    const { name, email, hoodieColor, size, designNotes, imageUrl } = data;

    if (!name || !email || !hoodieColor || !size || !designNotes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailHtml = `
      <h2>New Custom Order Request</h2>
      <p><strong>Customer Name:</strong> ${name}</p>
      <p><strong>Customer Email:</strong> ${email}</p>
      <p><strong>Hoodie Color:</strong> ${hoodieColor}</p>
      <p><strong>Size:</strong> ${size}</p>
      <p><strong>Design Notes:</strong></p>
      <p>${designNotes}</p>
      ${imageUrl ? `<p><strong>Design Image:</strong> <a href="${imageUrl}">${imageUrl}</a></p>` : ""}
      <hr />
      <p><em>Received via WEZZA Custom Orders form</em></p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: FROM_EMAIL,
      reply_to: email,
      subject: `New Custom Order from ${name}`,
      html: emailHtml,
    });

    return NextResponse.json({
      message: "Custom order request submitted successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
