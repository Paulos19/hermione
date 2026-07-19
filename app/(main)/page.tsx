import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  if (session && session.user?.email) {
    redirect("/dashboard")
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 overflow-hidden px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Controle de Acesso com{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hermione
          </span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg">
          Sistema seguro de autenticação construído com Next.js, Next-Auth v5, Prisma ORM e banco de dados PostgreSQL.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/login"
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98] text-center"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium rounded-xl border border-zinc-800 transition-all duration-200 active:scale-[0.98] text-center"
          >
            Cadastrar-se
          </Link>
        </div>
      </main>
    </div>
  )
}
