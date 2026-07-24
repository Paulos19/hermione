"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

// Helper: Generates a 6-digit numeric verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 1. Action to Send/Resend Email Verification Code
export async function sendVerificationCodeAction(email: string, name?: string, hashedPassword?: string) {
  if (!email || !email.includes("@")) {
    return { error: "Informe um endereço de e-mail válido." }
  }

  try {
    // Delete any previous codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email },
    })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        name: name || null,
        hashedPassword: hashedPassword || null,
        expiresAt,
      },
    })

    const emailRes = await sendVerificationEmail({ to: email, code, name })

    return {
      success: true,
      message: "Código de verificação enviado para seu e-mail!",
      cooldown: 30,
      previewUrl: emailRes?.previewUrl || null,
    }
  } catch (error: any) {
    console.error("Erro ao enviar código de verificação:", error)
    return { error: "Ocorreu um erro ao enviar o e-mail de verificação." }
  }
}

// 2. Action to Verify Code and Authenticate/Create User ONLY after verification
export async function verifyCodeAndLoginAction(email: string, code: string) {
  if (!email || !code || code.length !== 6) {
    return { error: "Código de verificação inválido." }
  }

  try {
    const record = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
    })

    if (!record) {
      return { error: "Código incorreto ou expirado. Solicite um novo código." }
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Mark existing user's email as verified
      user = await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      })
    } else {
      // Create user ONLY NOW after code verification
      if (!record.hashedPassword) {
        return { error: "Dados de cadastro expirados. Por favor, faça o cadastro novamente." }
      }

      user = await prisma.user.create({
        data: {
          name: record.name || "Autor",
          email,
          password: record.hashedPassword,
          emailVerified: new Date(),
        },
      })
    }

    // Clean up verification code after successful verification
    await prisma.verificationCode.deleteMany({
      where: { email },
    })

    return {
      success: true,
      userId: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error: any) {
    console.error("Erro ao verificar código:", error)
    return { error: "Não foi possível validar o código. Tente novamente." }
  }
}

// 3. Action to Update Onboarding Profile (Avatar & Plan selection)
export async function updateOnboardingProfileAction(userId: string, data: { image?: string; plan?: string }) {
  if (!userId) {
    return { error: "ID de usuário ausente." }
  }

  try {
    const updateData: any = {}
    if (data.image) updateData.image = data.image
    if (data.plan) {
      updateData.selectedPlan = data.plan
      if (data.plan === "pro" || data.plan === "premium") {
        updateData.isPremium = true
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Erro ao atualizar perfil no onboarding:", error)
    return { error: "Ocorreu um erro ao salvar as preferências do perfil." }
  }
}

// 4. Registration Action (Validates inputs, checks duplicate in DB, sends code WITHOUT creating User in DB yet)
export async function cadastroAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios." }
  }

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { error: "A senha precisa ser forte (mínimo 8 caracteres, maiúscula, minúscula, número e símbolo)." }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Este e-mail já está cadastrado. Faça login para continuar." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Trigger verification code email and save code + pending reg info in VerificationCode
    const sendResult = await sendVerificationCodeAction(email, name, hashedPassword)

    if (sendResult.error) {
      return { error: sendResult.error }
    }

    return {
      success: true,
      requiresVerification: true,
      email,
      name,
      previewUrl: sendResult.previewUrl || null,
    }
  } catch (error: any) {
    console.error("Erro no cadastro:", error)
    return { error: "Ocorreu um erro ao processar o cadastro. Tente novamente." }
  }
}

// 5. Login Action
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return { error: "E-mail ou senha incorretos." }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { error: "E-mail ou senha incorretos." }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      const sendResult = await sendVerificationCodeAction(email, user.name || undefined)
      return {
        requiresVerification: true,
        email,
        name: user.name,
        userId: user.id,
        previewUrl: sendResult.previewUrl || null,
      }
    }

    // Direct sign in for already verified users
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })

    return { success: true, userId: user.id }
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

// 7. Request Password Reset Action
export async function requestPasswordResetAction(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Informe um endereço de e-mail válido." }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      // Don't leak whether the email exists or not for security reasons
      return { success: true, message: "Se o e-mail existir em nossa base, você receberá um link de redefinição em breve." }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry,
      },
    })

    const emailRes = await sendPasswordResetEmail({ to: email, token, name: user.name || undefined })

    return {
      success: true,
      message: "Se o e-mail existir em nossa base, você receberá um link de redefinição em breve.",
      previewUrl: emailRes?.previewUrl || null,
    }
  } catch (error: any) {
    console.error("Erro ao solicitar redefinição de senha:", error)
    return { error: "Ocorreu um erro. Tente novamente mais tarde." }
  }
}

// 8. Reset Password Action
export async function resetPasswordAction(token: string, newPassword: string) {
  if (!token || !newPassword || newPassword.length < 6) {
    return { error: "Token inválido ou senha muito curta (mínimo 6 caracteres)." }
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Token must not be expired
      },
    })

    if (!user) {
      return { error: "O link de redefinição de senha é inválido ou expirou." }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return { success: true, message: "Senha redefinida com sucesso! Você já pode fazer login." }
  } catch (error: any) {
    console.error("Erro ao redefinir senha:", error)
    return { error: "Ocorreu um erro ao redefinir a senha." }
  }
}
