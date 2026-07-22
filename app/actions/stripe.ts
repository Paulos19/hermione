"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {})

export async function createStripeCheckoutSessionAction(lang: string = "pt", plan: "pro" | "premium" = "premium") {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Não autorizado.")
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) throw new Error("Usuário não encontrado.")

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id }
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    let priceId = process.env.STRIPE_PRICE_ID || "price_test"
    if (plan === "pro") {
      priceId = process.env.STRIPE_PRO_PRICE_ID || priceId
    } else if (plan === "premium") {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID || priceId
    }

    // Use localhost in dev, or actual domain in prod
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      mode: "subscription",
      success_url: `${baseUrl}/${lang}/dashboard`,
      cancel_url: `${baseUrl}/${lang}/subscribe`,
      metadata: { userId: user.id }
    })

    if (!checkoutSession.url) throw new Error("Falha ao gerar URL de checkout.")

    return checkoutSession.url
  } catch (error: any) {
    console.error("Stripe checkout action error:", error)
    throw new Error(error.message || "Erro interno do servidor.")
  }
}
