"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function NotificationsListener({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://services-websckt.khdya3.easypanel.host"
    const ws = new WebSocket(`${WS_URL}/ws/notifications?userId=${userId}`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'notification' || data.type === 'collaborator_joined') {
          toast.info("Nova Notificação", {
            description: data.message,
            duration: 5000,
            action: {
              label: "Ver",
              onClick: () => window.location.href = `/pt/editor/${data.bookId}`
            }
          })
        } else if (data.type === 'collaborator_removed') {
          toast.error(data.message, { duration: 5000 });
          if (window.location.pathname.includes(`/editor/${data.bookId}`)) {
            setTimeout(() => {
              window.location.href = '/pt/dashboard';
            }, 1500);
          }
        }
      } catch (e) {
        console.error("Erro processando notificação", e)
      }
    }

    return () => {
      ws.close()
    }
  }, [userId])

  return null
}
