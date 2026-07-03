import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { auth } from "@/auth"; // assuming next-auth

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await req.json(); // type can be "pin" or "password"
    
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        resetToken: code,
        resetTokenExpiry: expiry
      }
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const title = type === "pin" ? "Resetar PIN Mestre" : "Resetar Senha";
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Solicitação de ${title}</h2>
        <p>Você solicitou a redefinição do seu ${type === "pin" ? "PIN Mestre" : "password"}.</p>
        <p>Seu código de verificação é: <strong>${code}</strong></p>
        <p>Este código expira em 15 minutos.</p>
        <p>Se não foi você, apenas ignore este e-mail.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: session.user.email!,
      subject: `Código de Verificação - ${title}`,
      html: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting reset:", error);
    return NextResponse.json({ error: "Failed to request reset" }, { status: 500 });
  }
}
