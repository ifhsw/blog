// src/components/ProfileEditForm.tsx
"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/profile";
import { Avatar } from "@/components/Avatar";
import { AvatarCropModal } from "@/components/AvatarCropModal";

interface Props {
  initialData: {
    bio: string;
    website: string;
    location: string;
    github: string;
    twitter: string;
    avatar?: string | null;
  };
  username: string;
}

export function ProfileEditForm({ initialData, username }: Props) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatar || null);
  const [cropOpen, setCropOpen] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSaved(false);
        setError("");
        if (avatarUrl) formData.set("avatar", avatarUrl);
        const result = await updateProfile(formData);
        if (result.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          setError(result.error || "保存失败");
        }
      }}
      className="space-y-4"
    >
      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-2">头像</label>
        <button
          type="button"
          onClick={() => setCropOpen(true)}
          className="group relative rounded-full overflow-hidden ring-2 ring-primary-200/50 hover:ring-primary-400/50 transition-all"
        >
          <Avatar src={avatarUrl} name={username} size="lg" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">更换</span>
          </div>
        </button>
      </div>

      <AvatarCropModal
        isOpen={cropOpen}
        onClose={() => setCropOpen(false)}
        onSave={(url) => { setAvatarUrl(url); setCropOpen(false); }}
      />

      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">个人简介</label>
        <textarea
          name="bio"
          defaultValue={initialData.bio}
          rows={3}
          className="input-field min-h-[80px] resize-y"
          placeholder="介绍一下自己..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">位置</label>
        <input
          name="location"
          defaultValue={initialData.location}
          className="input-field"
          placeholder="例如：北京"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">个人网站</label>
        <input
          name="website"
          defaultValue={initialData.website}
          className="input-field"
          placeholder="例如：example.com"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-primary-600/60 mb-1">GitHub</label>
          <input
            name="github"
            defaultValue={initialData.github}
            className="input-field"
            placeholder="GitHub 用户名"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-primary-600/60 mb-1">Twitter</label>
          <input
            name="twitter"
            defaultValue={initialData.twitter}
            className="input-field"
            placeholder="Twitter 用户名"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary text-sm">
          保存资料
        </button>
        {saved && <span className="text-xs text-green-500">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </form>
  );
}
