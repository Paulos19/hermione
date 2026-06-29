import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from "@/lib/jwt";

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, charId: string }> }
) {
  try {
    const { id, charId } = await params;
    const user = getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const book = await prisma.book.findUnique({
      where: { id: id, userId: user.id }
    });
    if (!book) return new NextResponse("Book not found", { status: 404 });

    const body = await req.json();
    const { name, role, description } = body;

    const character = await prisma.character.update({
      where: { id: charId, bookId: id },
      data: {
        ...(name && { name }),
        ...(role !== undefined && { role }),
        ...(description !== undefined && { description }),
      }
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("[CHARACTER_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, charId: string }> }
) {
  try {
    const { id, charId } = await params;
    const user = getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const book = await prisma.book.findUnique({
      where: { id: id, userId: user.id }
    });
    if (!book) return new NextResponse("Book not found", { status: 404 });

    await prisma.character.delete({
      where: { id: charId, bookId: id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[CHARACTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
