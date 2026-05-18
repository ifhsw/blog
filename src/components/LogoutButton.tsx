"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await logoutAction();
        router.refresh();
      }}
      className="ml-2 text-sm text-primary-500 hover:underline"
    >
      退出
    </button>
  );
}
