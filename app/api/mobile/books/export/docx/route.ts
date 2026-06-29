import { NextRequest, NextResponse } from "next/server";
import HTMLtoDOCX from "html-to-docx";
import { verifyToken } from "@/lib/jwt";

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { html } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "O HTML é obrigatório" }, { status: 400 });
    }

    // Gerar o DOCX como Buffer
    const docData = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // Converter para Base64 usando Buffer.from
    const buffer = Buffer.from(docData as any);
    const base64 = buffer.toString('base64');

    return NextResponse.json({ success: true, base64 });
  } catch (error) {
    console.error("Erro ao gerar DOCX:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
