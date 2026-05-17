"use client";

import { logoutAction } from "@/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="ml-2 text-sm text-warm-link hover:underline"
    >
      退出
    </button>
  );
}
