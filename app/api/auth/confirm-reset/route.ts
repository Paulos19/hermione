import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, code, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
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
        where: { id: session.user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });
    } else {
      // Se for PIN, só limpamos o token pois o PIN é trocado localmente no device
      await prisma.user.update({
        where: { id: session.user.id },
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
