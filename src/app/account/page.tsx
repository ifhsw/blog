import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { QuestionDeleteButton } from "@/components/QuestionDeleteButton";
import { redirect } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      role: true,
      createdAt: true,
      bio: true,
      website: true,
      location: true,
      github: true,
      twitter: true,
    },
  });
  if (!user) redirect("/login");

  const questions = await prisma.question.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-primary-800 mb-8">账号管理</h1>

      {/* User info */}
      <div className="card mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary-700">基本信息</h2>
          <Link
            href={`/user/${user.username}`}
            className="text-xs text-blue-500 hover:underline"
          >
            查看我的主页
          </Link>
        </div>
        <div className="text-sm text-primary-600/60 space-y-1">
          <div>用户名：{user.username}</div>
          <div>邮箱：{user.email}</div>
          <div>
            角色：{user.role === "ADMIN" ? "管理员" : "读者"}
          </div>
          <div>
            注册时间：{new Date(user.createdAt).toLocaleString("zh-CN")}
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card mb-6 space-y-4">
        <h2 className="text-base font-semibold text-primary-700">个人资料</h2>
        <ProfileEditForm
          initialData={{
            bio: user.bio || "",
            website: user.website || "",
            location: user.location || "",
            github: user.github || "",
            twitter: user.twitter || "",
          }}
        />
      </div>

      {/* Change password */}
      <div className="card mb-6 space-y-4">
        <h2 className="text-base font-semibold text-primary-700">修改密码</h2>
        <ChangePasswordForm />
      </div>

      {/* My questions */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary-700">
            我的匿名提问
          </h2>
          <Link href="/qa" className="text-xs text-blue-500 hover:underline">
            去提问
          </Link>
        </div>
        {questions.length === 0 ? (
          <p className="text-sm text-primary-400/60">
            暂无提问，<Link href="/qa" className="text-blue-500 hover:underline">去提一个</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="border border-primary-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm text-primary-800 leading-relaxed line-clamp-3
                        [&_img]:max-w-full [&_img]:rounded [&_img]:max-h-20
                        [&_p]:mb-1 [&_pre]:hidden"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(q.content) as string,
                      }}
                    />
                    <div className="flex items-center gap-3 mt-2 text-xs text-primary-400/50">
                      <span>
                        {new Date(q.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                      {q.reply ? (
                        <span className="text-green-500/70">已回复</span>
                      ) : (
                        <span className="text-primary-400/40">待回复</span>
                      )}
                    </div>
                  </div>
                  <QuestionDeleteButton questionId={q.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
