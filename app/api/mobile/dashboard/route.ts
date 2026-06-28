import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is 1, Sunday is 0. Transform so Monday is 0, Sunday is 6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    // 1. Fetch books and documents for overview
    const books = await prisma.book.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            wordCount: true,
            updatedAt: true,
            createdAt: true
          }
        }
      }
    })

    // 2. Fetch daily progress for the current week
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    startOfWeek.setHours(0, 0, 0, 0);

    const progressRecords = await prisma.dailyProgress.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfWeek.toISOString().split("T")[0] // e.g. "2023-10-23"
        }
      }
    });

    // 3. Map progress to Mon-Sun array
    const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    progressRecords.forEach((record) => {
      const recordDate = new Date(record.date + "T12:00:00"); // avoid timezone shifting
      let dayIndex = recordDate.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday
      weeklyData[dayIndex] = record.words;
    });

    return NextResponse.json({ books, weeklyData })
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
