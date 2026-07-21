import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chaptersCount = await prisma.document.count();
    
    const wordsResult = await prisma.document.aggregate({
      _sum: {
        wordCount: true,
      },
    });
    
    const words = wordsResult._sum.wordCount || 0;
    
    const subscribers = await prisma.user.count({
      where: {
        isPremium: true,
      },
    });

    return NextResponse.json({
      chapters: chaptersCount,
      words: words,
      subscribers: subscribers,
    });
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
