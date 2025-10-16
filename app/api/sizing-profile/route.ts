import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Size recommendation algorithm based on measurements
function calculateRecommendedSize(
  heightCm: number,
  weightKg: number,
  chestCm: number | null,
  preferredFit: string
): string {
  // Base size calculation using height and weight
  let baseSize: string;

  // Height-based sizing (primary factor)
  if (heightCm < 165) {
    baseSize = 'S';
  } else if (heightCm < 175) {
    baseSize = 'M';
  } else if (heightCm < 183) {
    baseSize = 'L';
  } else if (heightCm < 191) {
    baseSize = 'XL';
  } else {
    baseSize = 'XXL';
  }

  // Weight adjustment
  const bmi = weightKg / ((heightCm / 100) ** 2);

  if (bmi > 27) {
    // Higher BMI, size up
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    const currentIndex = sizeOrder.indexOf(baseSize);
    if (currentIndex < sizeOrder.length - 1) {
      baseSize = sizeOrder[currentIndex + 1];
    }
  } else if (bmi < 20) {
    // Lower BMI, consider sizing down
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    const currentIndex = sizeOrder.indexOf(baseSize);
    if (currentIndex > 0) {
      baseSize = sizeOrder[currentIndex - 1];
    }
  }

  // Chest measurement refinement (if provided)
  if (chestCm) {
    if (chestCm >= 117) baseSize = 'XXL';
    else if (chestCm >= 112) baseSize = 'XL';
    else if (chestCm >= 107) baseSize = 'L';
    else if (chestCm >= 102) baseSize = 'M';
    else baseSize = 'S';
  }

  // Preferred fit adjustment
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
  const currentIndex = sizeOrder.indexOf(baseSize);

  if (preferredFit === 'oversized' && currentIndex < sizeOrder.length - 1) {
    return sizeOrder[currentIndex + 1];
  } else if (preferredFit === 'slim' && currentIndex > 0) {
    return sizeOrder[currentIndex - 1];
  }

  return baseSize;
}

// GET - Get user's sizing profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.userSizingProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching sizing profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sizing profile' },
      { status: 500 }
    );
  }
}

// POST - Create or update sizing profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { heightCm, weightKg, chestCm, preferredFit } = await req.json();

    if (!heightCm || !weightKg) {
      return NextResponse.json(
        { error: 'Height and weight are required' },
        { status: 400 }
      );
    }

    // Calculate recommended size
    const recommendedSize = calculateRecommendedSize(
      heightCm,
      weightKg,
      chestCm,
      preferredFit || 'regular'
    );

    // Upsert the profile
    const profile = await prisma.userSizingProfile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        heightCm,
        weightKg,
        chestCm,
        preferredFit: preferredFit || 'regular',
        recommendedSize,
      },
      create: {
        userId: session.user.id,
        heightCm,
        weightKg,
        chestCm,
        preferredFit: preferredFit || 'regular',
        recommendedSize,
      },
    });

    return NextResponse.json({
      profile,
      message: `Based on your measurements, we recommend size ${recommendedSize}`,
    });
  } catch (error) {
    console.error('Error saving sizing profile:', error);
    return NextResponse.json(
      { error: 'Failed to save sizing profile' },
      { status: 500 }
    );
  }
}

// DELETE - Delete sizing profile
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.userSizingProfile.delete({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: 'Sizing profile deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting sizing profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete sizing profile' },
      { status: 500 }
    );
  }
}
