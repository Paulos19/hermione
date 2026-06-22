"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function cadastroAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios." }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return { success: "Cadastro realizado com sucesso! Você já pode fazer login." }
  } catch (error: any) {
    console.error("Erro no cadastro:", error)
    return { error: "Ocorreu um erro ao criar a conta. Tente novamente." }
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha incorretos." }
        default:
          return { error: "Ocorreu um erro no login. Tente novamente." }
      }
    }
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
