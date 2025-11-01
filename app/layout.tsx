import type { Metadata } from "next";
import "@vapc/ui/globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { TelegramProvider } from "@/lib/telegram/telegram-provider";

export const metadata: Metadata = {
  title: "VA-PC | Игровые компьютеры",
  description: "Каталог игровых компьютеров VA-PC в Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className="antialiased">
        <TelegramProvider>
          <QueryProvider>{children}</QueryProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
