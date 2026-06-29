import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from "@/lib/jwt";

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const characters = await prisma.character.findMany({
      where: { bookId: id, book: { userId: user.id } },
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
    const user = getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const book = await prisma.book.findUnique({
      where: { id: id, userId: user.id }
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
