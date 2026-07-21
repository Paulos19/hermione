"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitFeedbackAction(text: string, rating: number) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true }
    });

    if (!user) {
      return { success: false, error: "Usuário não encontrado." };
    }

    if (!text || rating < 1 || rating > 5) {
      return { success: false, error: "Feedback inválido." };
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        text,
        rating
      }
    });

    revalidatePath("/dashboard/feedback");

    return { 
      success: true, 
      feedback: {
        ...feedback,
        user: {
          name: user.name,
          image: user.image
        }
      } 
    };
  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    return { success: false, error: "Ocorreu um erro ao enviar o feedback." };
  }
}

export async function getFeedbacksAction(take = 9) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      take,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    return { success: true, feedbacks };
  } catch (error) {
    console.error("Erro ao carregar feedbacks:", error);
    return { success: false, error: "Erro ao carregar feedbacks." };
  }
}
