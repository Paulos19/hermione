import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { verifyToken } from "@/lib/jwt";
import { getBackupEmailTemplate } from "@/lib/emailTemplates";

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function POST(req: Request) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, hrmContent, bookTitle } = await req.json();

    if (!fileName || !hrmContent) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const body = getBackupEmailTemplate(bookTitle || "Sem título");

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userPayload.email,
      subject: `Backup de Livro - Hermione`,
      html: body,
      attachments: [
        {
          filename: fileName,
          content: hrmContent,
          contentType: "application/json"
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending backup email:", error);
    return NextResponse.json({ error: "Failed to send backup email" }, { status: 500 });
  }
}
