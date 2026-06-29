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

    const notes = await prisma.bookNote.findMany({
      where: { bookId: id, book: { userId: user.id } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("[NOTES_GET]", error);
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
    const { title, content } = body;
    if (!title) return new NextResponse("Title is required", { status: 400 });

    const note = await prisma.bookNote.create({
      data: {
        title,
        content: content || null,
        bookId: id
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
