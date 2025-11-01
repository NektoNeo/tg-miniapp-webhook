"use client";

import { CategoryTiles } from "@/components/home/category-tiles";
import { TopPCs } from "@/components/home/top-pcs";
import { useTelegramBackButton } from "@/lib/telegram/navigation";

export default function HomePage() {
  // Telegram navigation integration
  useTelegramBackButton();

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">VA-PC</h1>
          <p className="text-muted-foreground">
            Игровые компьютеры и периферия
          </p>
        </div>

        {/* Category Tiles */}
        <CategoryTiles />

        {/* Top PCs */}
        <TopPCs />
      </div>
    </main>
  );
}
