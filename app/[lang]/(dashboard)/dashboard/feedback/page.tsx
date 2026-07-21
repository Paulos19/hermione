import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FeedbackClient from "./FeedbackClient";

export default async function FeedbackPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-light text-white tracking-wide">Seu Feedback</h1>
        <p className="text-white/60 font-light">
          Ajude-nos a melhorar a Hermione deixando sua avaliação. Seu depoimento poderá aparecer na nossa página principal.
        </p>
      </div>

      <FeedbackClient user={session.user} />
    </div>
  );
}
