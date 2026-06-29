import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import HTMLtoDOCX from "html-to-docx";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { html } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "O HTML é obrigatório" }, { status: 400 });
    }

    // Gerar o DOCX como Buffer
    const buffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // Converter para Base64
    const base64 = buffer.toString('base64');

    return NextResponse.json({ success: true, base64 });
  } catch (error) {
    console.error("Erro ao gerar DOCX:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
