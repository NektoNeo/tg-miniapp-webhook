"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Hook to manage Telegram BackButton
 * Shows BackButton on all pages except home
 *
 * Note: Telegram SDK integration will work when running in Telegram WebApp context
 * For development, these are no-ops
 */
export function useTelegramBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;

    const WebApp = window.Telegram.WebApp;

    // Show/hide based on route
    if (isHome) {
      WebApp.BackButton.hide();
    } else {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => router.back());
    }

    return () => {
      WebApp.BackButton.hide();
    };
  }, [isHome, router]);
}

/**
 * Hook to manage Telegram MainButton
 * Used for CTA actions (e.g., "Заказать" on PC detail page)
 */
export function useTelegramMainButton(config?: {
  text?: string;
  onClick?: () => void;
  visible?: boolean;
}) {
  useEffect(() => {
    // Check if running in Telegram WebApp
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;

    const WebApp = window.Telegram.WebApp;
    const MainButton = WebApp.MainButton;

    // Configure
    if (config?.text) {
      MainButton.setText(config.text);
    }

    // Show/hide
    if (config?.visible) {
      MainButton.show();
      if (config.onClick) {
        MainButton.onClick(config.onClick);
      }
    } else {
      MainButton.hide();
    }

    return () => {
      MainButton.hide();
      if (config?.onClick) {
        MainButton.offClick(config.onClick);
      }
    };
  }, [config]);

  return {
    show: () => window.Telegram?.WebApp?.MainButton.show(),
    hide: () => window.Telegram?.WebApp?.MainButton.hide(),
  };
}

// Type declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
      };
    };
  }
}
