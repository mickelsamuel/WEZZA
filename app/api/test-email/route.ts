import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Check env variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    console.log("=== EMAIL DEBUG INFO ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key first 10 chars:", apiKey?.substring(0, 10));
    console.log("From Email:", fromEmail);

    if (!apiKey) {
      return NextResponse.json({
        error: "RESEND_API_KEY is not set",
        debug: {
          apiKeySet: false,
          fromEmail: fromEmail || "not set",
        },
      });
    }

    const resend = new Resend(apiKey);

    // Use Resend's testing email or custom domain
    const testFromEmail = fromEmail || "onboarding@resend.dev";

    // Get email from query param or use a default
    const testToEmail = request.nextUrl.searchParams.get("email") || "delivered@resend.dev";

    console.log("Attempting to send test email...");
    console.log("From:", testFromEmail);
    console.log("To:", testToEmail);

    const result = await resend.emails.send({
      from: testFromEmail,
      to: testToEmail,
      subject: "WEZZA Test Email",
      html: `
        <h1>Test Email from WEZZA</h1>
        <p>If you're seeing this, email sending is working!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });

    console.log("Email sent successfully!");
    console.log("Result:", result);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      emailId: result.data?.id,
      debug: {
        from: testFromEmail,
        to: testToEmail,
        apiKeySet: true,
      },
    });
  } catch (error) {
    console.error("=== EMAIL ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
        debug: {
          apiKeySet: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.RESEND_FROM_EMAIL || "not set",
        },
      },
      { status: 500 }
    );
  }
}
