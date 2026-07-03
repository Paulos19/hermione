import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { verifyToken } from "@/lib/jwt";
import { getWelcomeEmailTemplate } from "@/lib/emailTemplates";

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

    const { code } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id }
    });

    if (!user || !user.resetToken || user.resetToken !== code) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Código expirado" }, { status: 400 });
    }

    // Marca como verificado e limpa os tokens
    await prisma.user.update({
      where: { id: userPayload.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Envia o e-mail de Boas Vindas
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const body = getWelcomeEmailTemplate(user.name || "");

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Bem-vindo(a) ao Hermione!`,
      html: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming verification:", error);
    return NextResponse.json({ error: "Failed to confirm verification" }, { status: 500 });
  }
}
