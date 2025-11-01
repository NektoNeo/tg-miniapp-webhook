"use client";

import { SDKProvider } from "@/lib/telegram";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SDKProvider acceptCustomStyles debug>
      {children}
    </SDKProvider>
  );
}
