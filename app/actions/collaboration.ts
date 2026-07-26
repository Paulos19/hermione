"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import axios from "axios";

// Generate a random code like HERM-XXXX-XXXX
function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HERM-${p1}-${p2}`;
}

export async function generateShareCodeAction(bookId: string, permissions: string[] = ["READ"]) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.user.id) {
      return { success: false, error: "Livro não encontrado ou sem permissão" };
    }

    const code = generateRandomCode();

    const shareCode = await prisma.bookShareCode.create({
      data: {
        bookId,
        code,
        permissions,
      },
    });

    revalidatePath(`/dashboard`);
    return { success: true, shareCode };
  } catch (error: any) {
    console.error("Error generating share code:", error);
    return { success: false, error: error.message };
  }
}

export async function getShareCodeInfoAction(code: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const shareCode = await prisma.bookShareCode.findUnique({
      where: { code },
      include: {
        book: {
          select: {
            title: true,
            coverImage: true,
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!shareCode) {
      return { success: false, error: "Código inválido ou expirado" };
    }

    return { success: true, book: shareCode.book, permissions: shareCode.permissions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function joinBookByCodeAction(code: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const shareCode = await prisma.bookShareCode.findUnique({
      where: { code },
      include: { book: true }
    });

    if (!shareCode) {
      return { success: false, error: "Código inválido ou expirado" };
    }

    if (shareCode.book.userId === session.user.id) {
      return { success: false, error: "Você já é o dono deste livro" };
    }

    const existingCollab = await prisma.bookCollaborator.findUnique({
      where: {
        bookId_userId: {
          bookId: shareCode.bookId,
          userId: session.user.id,
        }
      }
    });

    if (existingCollab && !existingCollab.isActive) {
      return { success: false, error: "Seu acesso a este livro foi revogado pelo proprietário." };
    }

    const collaborator = await prisma.bookCollaborator.upsert({
      where: {
        bookId_userId: {
          bookId: shareCode.bookId,
          userId: session.user.id,
        }
      },
      update: {
        permissions: shareCode.permissions,
      },
      create: {
        bookId: shareCode.bookId,
        userId: session.user.id,
        permissions: shareCode.permissions,
        isActive: true,
      }
    });

    // Update lastUsedAt on the code
    await prisma.bookShareCode.update({
      where: { id: shareCode.id },
      data: { lastUsedAt: new Date() }
    });

    // Notify the owner via WebSocket API
    try {
      const ownerId = shareCode.book.userId;
      // POST directly to the WebSocket server's HTTP handler
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      const httpUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      
      await axios.post(`${httpUrl}/api/notify`, {
        targetUserId: ownerId,
        message: `${session.user.name || session.user.email} acabou de acessar o livro "${shareCode.book.title}"!`,
        bookId: shareCode.bookId
      });
    } catch (e) {
      console.warn("Could not send websocket notification", e);
    }

    revalidatePath(`/dashboard`);
    return { success: true, bookId: shareCode.bookId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBookCollaboratorsAction(bookId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== session.user.id) {
      return { success: false, error: "Sem permissão" };
    }

    const collaborators = await prisma.bookCollaborator.findMany({
      where: { bookId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    });

    const activeCodes = await prisma.bookShareCode.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, collaborators, shareCodes: activeCodes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCollaboratorAccessAction(collabId: string, isActive: boolean) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return { success: false, error: "Não autorizado" };

    const collab = await prisma.bookCollaborator.findUnique({ where: { id: collabId }, include: { book: true } });
    if (!collab || collab.book.userId !== session.user.id) {
      return { success: false, error: "Sem permissão" };
    }

    await prisma.bookCollaborator.update({
      where: { id: collabId },
      data: { isActive }
    });

    if (!isActive) {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
        const httpUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
        const axios = (await import("axios")).default;
        
        await axios.post(`${httpUrl}/api/notify`, {
          targetUserId: collab.userId,
          message: `Seu acesso ao livro "${collab.book.title}" foi revogado.`,
          type: 'collaborator_removed',
          bookId: collab.bookId
        });
      } catch(e) {
        console.error("Failed to notify removed collaborator", e);
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteShareCodeAction(codeId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) return { success: false, error: "Não autorizado" };

    const shareCode = await prisma.bookShareCode.findUnique({ where: { id: codeId }, include: { book: true } });
    if (!shareCode || shareCode.book.userId !== session.user.id) {
      return { success: false, error: "Sem permissão" };
    }

    await prisma.bookShareCode.delete({ where: { id: codeId } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
