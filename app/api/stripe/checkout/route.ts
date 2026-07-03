import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {})

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const userPayload = verifyToken(token)

    if (!userPayload || !userPayload.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id }
    })

    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })

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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_test", 
          quantity: 1,
        }
      ],
      mode: "subscription",
      success_url: "https://hermione-psi.vercel.app", // Redirect back to web if needed
      cancel_url: "https://hermione-psi.vercel.app",
      metadata: { userId: user.id }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
