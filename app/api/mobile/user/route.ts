import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function GET(request: Request) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { id: true, name: true, email: true, ragContext: true, image: true, emailVerified: true, isPremium: true, masterPin: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("User GET error:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { name, ragContext, dailyGoal, image, masterPin } = await request.json()

    const dataToUpdate: any = {}
    if (name !== undefined) dataToUpdate.name = name
    if (ragContext !== undefined) dataToUpdate.ragContext = ragContext
    if (dailyGoal !== undefined) dataToUpdate.dailyGoal = dailyGoal
    if (image !== undefined) dataToUpdate.image = image
    if (masterPin !== undefined) dataToUpdate.masterPin = masterPin

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, ragContext: true, dailyGoal: true, image: true, emailVerified: true, masterPin: true }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("User PUT error:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
