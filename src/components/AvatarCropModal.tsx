// src/components/AvatarCropModal.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
}

export function AvatarCropModal({ isOpen, onClose, onSave }: AvatarCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;
    const image = new Image();
    image.src = imageSrc;
    await new Promise<void>((resolve) => { image.onload = () => resolve(); });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const { x, y, width, height } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9));
  };

  const handleSave = async () => {
    const blob = await createCroppedImage();
    if (!blob) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        onSave(data.url);
        setImageSrc(null);
        onClose();
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-200/20 flex items-center justify-between">
          <h3 className="font-semibold text-primary-800">裁剪头像</h3>
          <button onClick={handleClose} className="text-primary-400 hover:text-primary-600 text-lg leading-none">&times;</button>
        </div>

        {!imageSrc ? (
          <div className="p-6 text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary-200/40 rounded-xl p-10 cursor-pointer hover:border-primary-300/60 transition-colors"
            >
              <span className="text-4xl text-primary-300">📷</span>
              <p className="mt-3 text-sm text-primary-500/50">点击选择图片</p>
              <p className="text-xs text-primary-400/30 mt-1">JPG / PNG / WebP</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        ) : (
          <>
            <div className="relative w-full h-72 bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="px-6 py-3">
              <label className="text-xs text-primary-400/60">缩放</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={handleClose} className="flex-1 py-2 text-sm rounded-lg border border-primary-200/40 text-primary-600 hover:bg-primary-50 transition-colors">
                取消
              </button>
              <button onClick={handleSave} disabled={uploading} className="flex-1 py-2 text-sm rounded-lg bg-primary-900 text-white hover:bg-primary-800 transition-colors disabled:opacity-50">
                {uploading ? "上传中..." : "确认"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
