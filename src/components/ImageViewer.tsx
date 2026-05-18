"use client";

import { useEffect } from "react";

export function ImageViewer() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const img = e.target as HTMLElement;
      if (img.tagName !== "IMG") return;

      if (img.classList.contains("fullscreen")) {
        img.classList.remove("fullscreen");
        document.body.style.overflow = "";
      } else {
        img.classList.add("fullscreen");
        document.body.style.overflow = "hidden";
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const fs = document.querySelector("img.fullscreen");
        if (fs) {
          fs.classList.remove("fullscreen");
          document.body.style.overflow = "";
        }
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return null;
}
