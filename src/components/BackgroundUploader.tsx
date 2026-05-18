"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSetting } from "@/actions/settings";

interface Props {
  initialUrl: string | null;
}

export function BackgroundUploader({ initialUrl }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.error || "上传失败");
        return;
      }
      await updateSiteSetting("background", data.url);
      setUrl(data.url);
      setMessage("背景已更新");
      router.refresh();
    } catch {
      setMessage("上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function handleReset() {
    setMessage("");
    await updateSiteSetting("background", "");
    setUrl(null);
    setMessage("背景已清除");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-primary-600">当前背景</h3>
        {url ? (
          <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-primary-200">
            <img
              src={url}
              alt="背景预览"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video max-w-md rounded-lg border-2 border-dashed border-primary-200 flex items-center justify-center text-primary-400 text-sm">
            暂未设置背景图片
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        <button
          className="btn-primary text-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "上传中..." : "上传背景图片"}
        </button>
        {url && (
          <button
            className="btn-secondary text-sm"
            onClick={handleReset}
            disabled={uploading}
          >
            重置
          </button>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.includes("失败") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
