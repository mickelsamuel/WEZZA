import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// POST - One-click "Buy Now" checkout
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to use Buy Now' },
        { status: 401 }
      );
    }

    const { productSlug, size, quantity = 1, useDefaultPayment = true } = await req.json();

    if (!productSlug || !size) {
      return NextResponse.json(
        { error: 'Product slug and size are required' },
        { status: 400 }
      );
    }

    // Get product data
    const productsModule = await import('@/lib/products');
    const product = productsModule.products.find((p: any) => p.slug === productSlug);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get default address
    const defaultAddress = await prisma.address.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
    });

    if (!defaultAddress) {
      return NextResponse.json(
        { error: 'Please add a shipping address to your account first' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = product.price * quantity;
    const shipping = subtotal >= 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + shipping;

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // If using default payment method
    if (useDefaultPayment) {
      const defaultPaymentMethod = await prisma.savedPaymentMethod.findFirst({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
      });

      if (!defaultPaymentMethod) {
        return NextResponse.json(
          { error: 'No default payment method found. Please add a payment method first.' },
          { status: 400 }
        );
      }

      // Create payment intent with saved payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'cad',
        customer: stripeCustomerId,
        payment_method: defaultPaymentMethod.stripePaymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          userId: session.user.id,
          productSlug,
          size,
          quantity: quantity.toString(),
        },
      });

      // Create order immediately
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          stripeSessionId: paymentIntent.id,
          status: 'processing',
          total: Math.round(total * 100),
          currency: 'CAD',
          customerEmail: session.user.email,
          customerName: session.user.name || 'Customer',
          items: [
            {
              productSlug,
              title: product.title,
              price: product.price,
              size,
              quantity,
              image: product.images[0],
            },
          ],
          shippingAddress: {
            street: defaultAddress.street,
            city: defaultAddress.city,
            province: defaultAddress.province,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
          },
          statusHistory: [
            {
              status: 'processing',
              timestamp: new Date().toISOString(),
              note: 'Order placed via Buy Now',
            },
          ],
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: 'Order placed successfully!',
      });
    } else {
      // Create Checkout Session for new payment method
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: `${product.title} - ${size}`,
                images: [product.images[0]],
                description: product.description,
              },
              unit_amount: Math.round(product.price * 100),
            },
            quantity,
          },
          // Shipping fee if applicable
          ...(shipping > 0
            ? [
                {
                  price_data: {
                    currency: 'cad',
                    product_data: {
                      name: 'Shipping',
                    },
                    unit_amount: Math.round(shipping * 100),
                  },
                  quantity: 1,
                },
              ]
            : []),
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productSlug}`,
        customer_email: session.user.email,
        metadata: {
          userId: session.user.id,
          productSlug,
          size,
          quantity: quantity.toString(),
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0,
                currency: 'cad',
              },
              display_name: shipping > 0 ? 'Standard Shipping' : 'Free Shipping',
            },
          },
        ],
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutSession.url,
      });
    }
  } catch (error: any) {
    console.error('Buy Now checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
