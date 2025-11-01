/**
 * Telegram Mini App Hooks and Provider
 */
"use client";

import { useEffect, useState } from "react";

export function useInitData() {
  const [initData, setInitData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe) {
        setInitData(tg.initDataUnsafe);
      }
    }
  }, []);

  return initData;
}

export function useMiniApp() {
  const [miniApp, setMiniApp] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      setMiniApp(tg);
    }
  }, []);

  return miniApp;
}

export function SDKProvider({
  children,
  acceptCustomStyles,
  debug
}: {
  children: React.ReactNode;
  acceptCustomStyles?: boolean;
  debug?: boolean;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (debug) {
          console.log('[TG SDK] Initialized:', tg);
        }
      }
    }
  }, [debug]);

  return <>{children}</>;
}
