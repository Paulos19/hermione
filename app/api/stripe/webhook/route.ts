import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Faltando assinatura do Stripe" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (customerId && subscriptionId) {
          await prisma.user.update({
            where: { stripeCustomerId: customerId },
            data: {
              isPremium: true,
              stripeSubscriptionId: subscriptionId
            }
          })
        }
        break

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            isPremium: false,
            stripeSubscriptionId: null
          }
        })
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handling error:", error)
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 })
  }
}
