"use client";

import { logoutAction } from "@/actions/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="ml-2 text-sm text-primary-500 hover:underline"
    >
      退出
    </button>
  );
}
