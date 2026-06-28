import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const characters = await prisma.character.findMany({
      where: { bookId: id, book: { userId: session.user.id } },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error("[CHARACTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const book = await prisma.book.findUnique({
      where: { id: id, userId: session.user.id }
    });
    if (!book) return new NextResponse("Book not found", { status: 404 });

    const body = await req.json();
    const { name, role, description } = body;
    if (!name) return new NextResponse("Name is required", { status: 400 });

    const character = await prisma.character.create({
      data: {
        name,
        role: role || null,
        description: description || null,
        bookId: id
      }
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("[CHARACTERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
