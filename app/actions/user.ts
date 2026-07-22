"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function salvarRagAction(prevState: any, formData: FormData): Promise<{ success?: string; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autorizado." }
  }

  const ragContext = formData.get("ragContext") as string

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ragContext: ragContext || null,
      },
    })

    revalidatePath("/configuracoes")
    return { success: "Configurações de RAG salvas com sucesso!" }
  } catch (error) {
    console.error("Erro ao salvar RAG:", error)
    return { error: "Erro ao salvar as configurações. Tente novamente." }
  }
}

export async function updateUserProfileServerAction(name: string, image: string): Promise<{ success?: string; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autorizado." }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        image: image || null,
      },
    })

    revalidatePath("/configuracoes")
    return { success: "Perfil atualizado com sucesso!" }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { error: "Erro ao atualizar o perfil. Tente novamente." }
  }
}

export async function salvarMasterPinAction(pin: string): Promise<{ success?: string; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autorizado." }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        masterPin: pin,
      },
    })

    return { success: "PIN Mestre salvo com sucesso!" }
  } catch (error) {
    console.error("Erro ao salvar PIN Mestre:", error)
    return { error: "Erro ao salvar o PIN Mestre. Tente novamente." }
  }
}

function anonymizeEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  if (localPart.length <= 2) return `*@${domain}`;
  return `${localPart.substring(0, 3)}***@${domain}`;
}

export async function getCommunityUsersAction(page: number = 1, limit: number = 10, random: boolean = false) {
  try {
    if (random) {
      // Prisma doesn't have native random ordering that works perfectly across all adapters without raw queries,
      // but we can query a set and shuffle, or use skip.
      const totalCount = await prisma.user.count();
      const skip = Math.max(0, Math.floor(Math.random() * (totalCount - limit)));
      
      const users = await prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isPremium: true,
          createdAt: true
        }
      });
      
      return {
        users: users.map(u => ({
          ...u,
          name: u.name || "Membro da Comunidade",
          email: anonymizeEmail(u.email)
        }))
      };
    }

    const skip = (page - 1) * limit;
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isPremium: true,
          createdAt: true
        }
      }),
      prisma.user.count()
    ]);

    return {
      users: users.map(u => ({
        ...u,
        name: u.name || "Membro da Comunidade",
        email: anonymizeEmail(u.email)
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error("Erro ao buscar usuários da comunidade:", error);
    return { users: [], totalCount: 0, totalPages: 0 };
  }
}
