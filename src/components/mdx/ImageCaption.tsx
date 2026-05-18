interface ImageCaptionProps {
  src?: string;
  alt?: string;
  title?: string;
  caption?: string;
  width?: number;
}

export function ImageCaption({ src, alt, title, caption, width }: ImageCaptionProps) {
  if (!src) return null;

  const displayCaption = caption || title || alt || "";

  return (
    <span className="block my-6">
      <img
        src={src}
        alt={alt || title || ""}
        width={width}
        className="w-full h-auto block rounded-xl shadow-md border border-black/5"
        loading="lazy"
      />
      {displayCaption && (
        <span className="block mt-2.5 text-center text-sm text-primary-400/70 italic">
          {displayCaption}
        </span>
      )}
    </span>
  );
}
