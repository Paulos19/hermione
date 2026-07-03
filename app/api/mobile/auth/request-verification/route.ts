import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { verifyToken } from "@/lib/jwt";
import { getVerificationEmailTemplate } from "@/lib/emailTemplates";

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

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await prisma.user.update({
      where: { id: userPayload.id },
      data: {
        resetToken: code,
        resetTokenExpiry: expiry
      }
    });

    if (user.emailVerified) {
        return NextResponse.json({ error: "Email já verificado" }, { status: 400 });
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

    const body = getVerificationEmailTemplate(code);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Código de Verificação de E-mail`,
      html: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting verification:", error);
    return NextResponse.json({ error: "Failed to request verification" }, { status: 500 });
  }
}
