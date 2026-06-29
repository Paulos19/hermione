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
  { params }: { params: Promise<{ id: string, noteId: string }> }
) {
  try {
    const { id, noteId } = await params;
    const user = getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const book = await prisma.book.findUnique({
      where: { id: id, userId: user.id }
    });
    if (!book) return new NextResponse("Book not found", { status: 404 });

    const body = await req.json();
    const { title, content } = body;

    const note = await prisma.bookNote.update({
      where: { id: noteId, bookId: id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, noteId: string }> }
) {
  try {
    const { id, noteId } = await params;
    const user = getUserFromRequest(req);
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const book = await prisma.book.findUnique({
      where: { id: id, userId: user.id }
    });
    if (!book) return new NextResponse("Book not found", { status: 404 });

    await prisma.bookNote.delete({
      where: { id: noteId, bookId: id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[NOTE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
