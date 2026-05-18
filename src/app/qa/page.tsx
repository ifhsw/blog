import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { QuestionList } from "@/components/QuestionList";
import { QaForm } from "@/components/QaForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function QaPage() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userId = (session?.user as any)?.id;

  let questions: {
    id: string;
    content: string;
    reply: string | null;
    repliedAt: Date | null;
    createdAt: Date;
    user?: { username: string };
  }[] = [];

  if (isAdmin) {
    questions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true } } },
    });
  } else if (userId) {
    questions = await prisma.question.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-primary-800">匿名提问</h1>
        <span className="text-xs text-primary-400 bg-primary-100/60 px-2 py-0.5 rounded-full">
          {questions.length}
        </span>
      </div>

      {session ? (
        <>
          <div className="card mb-8">
            <h2 className="text-sm font-semibold text-primary-700 mb-3">
              提出你的问题
            </h2>
            <QaForm />
          </div>

          {isAdmin && (
            <p className="text-xs text-primary-400/50 mb-4">
              管理员视图：显示所有用户的提问
            </p>
          )}

          <QuestionList questions={questions} isAdmin={isAdmin} canDelete={!!userId} />
        </>
      ) : (
        <div className="card text-center py-16 space-y-4">
          <div className="text-5xl opacity-15 select-none">?</div>
          <p className="text-primary-400/60 text-sm">
            登录后可匿名提问，你的身份对其他用户不可见。
          </p>
          <Link href="/login" className="btn-primary text-sm inline-flex">
            登录后提问
          </Link>
        </div>
      )}
    </main>
  );
}
