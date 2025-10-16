import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// GET - Get user's saved payment methods
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paymentMethods = await prisma.savedPaymentMethod.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST - Save a new payment method
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentMethodId, setAsDefault } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    // Try to find existing customer by email
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Retrieve payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // If setting as default, unset other defaults
    if (setAsDefault) {
      await prisma.savedPaymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // Set as default in Stripe
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Save to database
    const savedPaymentMethod = await prisma.savedPaymentMethod.create({
      data: {
        userId: session.user.id,
        stripePaymentMethodId: paymentMethodId,
        type: paymentMethod.type,
        cardBrand: paymentMethod.card?.brand,
        cardLast4: paymentMethod.card?.last4,
        cardExpMonth: paymentMethod.card?.exp_month,
        cardExpYear: paymentMethod.card?.exp_year,
        isDefault: setAsDefault || false,
      },
    });

    return NextResponse.json(
      {
        message: 'Payment method saved successfully',
        paymentMethod: savedPaymentMethod,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving payment method:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save payment method' },
      { status: 500 }
    );
  }
}

// PATCH - Update payment method (set as default)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, setAsDefault } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const paymentMethod = await prisma.savedPaymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod || paymentMethod.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    if (setAsDefault) {
      // Unset other defaults
      await prisma.savedPaymentMethod.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update this payment method
    const updated = await prisma.savedPaymentMethod.update({
      where: { id },
      data: {
        isDefault: setAsDefault,
      },
    });

    return NextResponse.json({
      message: 'Payment method updated successfully',
      paymentMethod: updated,
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a payment method
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const paymentMethod = await prisma.savedPaymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod || paymentMethod.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Detach from Stripe
    try {
      await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
    } catch (stripeError) {
      console.error('Stripe detach error:', stripeError);
      // Continue even if Stripe fails (payment method might already be detached)
    }

    // Delete from database
    await prisma.savedPaymentMethod.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Payment method removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
