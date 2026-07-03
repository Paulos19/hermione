import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/jwt";

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

    const { type, code, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id }
    });

    if (!user || !user.resetToken || user.resetToken !== code) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Código expirado" }, { status: 400 });
    }

    // Se for password, atualizamos no banco
    if (type === "password") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "Senha inválida" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userPayload.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });
    } else {
      // Se for PIN, só limpamos o token pois o PIN é trocado localmente no device
      await prisma.user.update({
        where: { id: userPayload.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming reset:", error);
    return NextResponse.json({ error: "Failed to confirm reset" }, { status: 500 });
  }
}
