import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-[#12101B] text-white selection:bg-purple-500/30 flex items-center justify-center">
      {children}
    </div>
  )
}
