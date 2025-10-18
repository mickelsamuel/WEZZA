import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email-automation";
import {
  sanitizeEmail,
  validatePassword,
  checkRateLimit,
  getSafeErrorMessage,
  logError,
  checkPasswordBreach
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting to prevent spam registrations
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`register:${ip}`, 3, 3600000); // 3 registrations per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password, name, website } = await request.json();

    // SECURITY: Honeypot field check - reject if filled (indicates bot)
    if (website && website.trim() !== '') {
      console.warn('[SECURITY] Honeypot triggered for registration:', email);
      // Return success to not alert the bot
      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // SECURITY: Validate and sanitize email
    let sanitizedEmail: string;
    try {
      sanitizedEmail = sanitizeEmail(email);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // SECURITY: Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // SECURITY: Check if password has been breached (non-blocking)
    try {
      const breachCheck = await checkPasswordBreach(password);
      if (breachCheck.breached) {
        console.warn(`[SECURITY] Breached password attempt for email: ${sanitizedEmail}, found ${breachCheck.count} times`);
        return NextResponse.json(
          {
            error: `This password has been found in ${breachCheck.count.toLocaleString()} data breaches. Please choose a different password for your security.`,
            breached: true
          },
          { status: 400 }
        );
      }
    } catch (error) {
      // If breach check fails, log but don't block registration
      console.error('Password breach check failed:', error);
      // Continue with registration
    }

    // Validate name length if provided
    if (name && name.length > 100) {
      return NextResponse.json(
        { error: "Name must be less than 100 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with sanitized data
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: name ? name.trim() : null,
      }
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user.email, user.name || "", user.id).catch((error: any) => {
      console.error("Failed to send welcome email:", error);
    });

    // Create email subscription record
    await prisma.emailSubscription.create({
      data: {
        email: user.email,
        source: "account",
      },
    }).catch((error: any) => {
      console.error("Failed to create email subscription:", error);
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error, 'auth/register');
    return NextResponse.json(
      { error: getSafeErrorMessage(error) },
      { status: 500 }
    );
  }
}
