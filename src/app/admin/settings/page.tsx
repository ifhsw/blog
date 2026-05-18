import { getSiteSetting } from "@/actions/settings";
import { BackgroundUploader } from "@/components/BackgroundUploader";
import { AboutEditor } from "@/components/AboutEditor";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [backgroundUrl, aboutContent] = await Promise.all([
    getSiteSetting("background"),
    getSiteSetting("about_content"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-primary-700">站点设置</h2>
        <p className="mt-1 text-sm text-primary-600/60">
          管理网站全局配置
        </p>
      </div>

      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-primary-700">
          网页背景
        </h3>
        <p className="text-sm text-primary-600/60">
          上传一张图片作为网页全局背景。推荐使用深色或低饱和度的图片以确保文字可读性。
        </p>
        <BackgroundUploader initialUrl={backgroundUrl} />
      </div>

      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-primary-700">
          关于页面
        </h3>
        <p className="text-sm text-primary-600/60">
          编辑"关于"页面的内容，支持 Markdown 格式。可上传图片。
        </p>
        <AboutEditor initialContent={aboutContent} />
      </div>

      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-primary-700">
          修改密码
        </h3>
        <p className="text-sm text-primary-600/60">
          修改当前管理员账号的登录密码。
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
