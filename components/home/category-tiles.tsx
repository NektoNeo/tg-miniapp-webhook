"use client";

import Link from "next/link";
import { Card, CardContent } from "@vapc/ui/components";
import { Monitor, Gamepad2 } from "lucide-react";

export function CategoryTiles() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href="/pcs">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
          <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
            <Gamepad2 className="w-12 h-12 text-primary" />
            <h2 className="text-xl font-bold text-center">Игровые ПК</h2>
            <p className="text-sm text-muted-foreground text-center">
              Готовые сборки
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/devices">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
          <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
            <Monitor className="w-12 h-12 text-primary" />
            <h2 className="text-xl font-bold text-center">Девайсы</h2>
            <p className="text-sm text-muted-foreground text-center">
              Периферия и аксессуары
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
