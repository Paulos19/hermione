import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ragContext: user.ragContext,
        isPremium: user.isPremium,
        emailVerified: user.emailVerified
      }
    })
  } catch (error) {
    console.error("Login mobile error:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
