import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSetting } from "@/actions/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "博客",
  description: "孤灯残雪，写意留白。",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgUrl = await getSiteSetting("background");

  return (
    <html lang="zh-CN">
      <body className="bg-primary-50 text-primary-800 min-h-screen flex flex-col">
        {bgUrl && (
          <style>{`body::before{background-image:url('${bgUrl}')}`}</style>
        )}
        <a
          href="#main-content"
          className="absolute -top-10 left-4 z-[100] bg-primary-700 text-white px-4 py-2 rounded-lg
                     shadow-lg outline-none focus:top-4 transition-all"
        >
          跳到主要内容
        </a>
        <SessionProvider>
          <Header />
          <div id="main-content" className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
