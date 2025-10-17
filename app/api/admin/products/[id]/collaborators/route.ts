import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET collaborators for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const productId = params.id;

    // Get product collaborators
    const collaborations = await prisma.productCollaborator.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const collaborators = collaborations.map((collab) => ({
      id: collab.user.id,
      name: collab.user.name,
      email: collab.user.email,
      addedAt: collab.createdAt,
    }));

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error fetching product collaborators:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a collaborator to a product
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const productId = params.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify user exists and has collaborator role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role?.toLowerCase() !== "collaborator") {
      return NextResponse.json(
        { error: "User must have collaborator role" },
        { status: 400 }
      );
    }

    // Check if already a collaborator
    const existing = await prisma.productCollaborator.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already a collaborator on this product" },
        { status: 400 }
      );
    }

    // Add collaborator
    await prisma.productCollaborator.create({
      data: {
        productId,
        userId,
      },
    });

    return NextResponse.json({
      message: "Collaborator added successfully",
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a collaborator from a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || currentUser.role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const productId = params.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Remove collaborator
    await prisma.productCollaborator.delete({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    return NextResponse.json({
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
