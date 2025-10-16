import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user's stock notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await prisma.stockNotification.findMany({
      where: {
        email: session.user.email,
        notified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching stock notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create a stock notification request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { productSlug, size, email: providedEmail } = await req.json();

    if (!productSlug || !size) {
      return NextResponse.json(
        { error: 'Product slug and size are required' },
        { status: 400 }
      );
    }

    // Use session email if logged in, otherwise require provided email
    const email = session?.user?.email || providedEmail;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if notification already exists
    const existing = await prisma.stockNotification.findUnique({
      where: {
        email_productSlug_size: {
          email,
          productSlug,
          size,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'You are already on the waitlist for this item' },
        { status: 200 }
      );
    }

    // Create notification
    const notification = await prisma.stockNotification.create({
      data: {
        email,
        productSlug,
        size,
        userId: session?.user?.id,
      },
    });

    return NextResponse.json(
      {
        message: 'You will be notified when this item is back in stock',
        notification
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stock notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a stock notification
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const notification = await prisma.stockNotification.findUnique({
      where: { id },
    });

    if (!notification || notification.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await prisma.stockNotification.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Notification removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting stock notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
