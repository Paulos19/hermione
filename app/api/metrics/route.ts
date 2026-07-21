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

    const recentDocuments = await prisma.document.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        wordCount: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const recentActivity = recentDocuments.map((doc) => {
      const authorName = doc.user?.name || doc.user?.email?.split("@")[0] || "autor";
      const cleanUser = `@${authorName.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
      return {
        user: cleanUser,
        chapter: doc.title || "Capítulo",
        action: `sincronizou ${doc.wordCount || 0} palavras`,
      };
    });

    return NextResponse.json({
      chapters: chaptersCount,
      words: words,
      subscribers: subscribers,
      recentActivity: recentActivity,
    });
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
