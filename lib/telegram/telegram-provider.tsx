"use client";

import { useEffect } from "react";
import Script from "next/script";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Telegram WebApp when ready
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
