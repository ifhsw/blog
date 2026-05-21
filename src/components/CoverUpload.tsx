// src/components/CoverUpload.tsx
"use client";

import { useState, useRef } from "react";

interface CoverUploadProps {
  name: string;
  defaultValue?: string;
}

export function CoverUpload({ name, defaultValue }: CoverUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setUrl(data.url);
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  };

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="relative rounded-lg overflow-hidden border border-primary-200/20">
          <img src={url} alt="封面图" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`text-center p-10 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragOver ? "border-primary-400 bg-primary-50" : "border-primary-200/40 hover:border-primary-300/60"
          }`}
        >
          <span className="text-3xl text-primary-300">🖼</span>
          <p className="mt-2 text-sm text-primary-500/50">{uploading ? "上传中..." : "点击或拖拽上传封面图"}</p>
          <p className="mt-1 text-xs text-primary-400/30">推荐 1920×1080，JPG/PNG/WebP，最大 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
