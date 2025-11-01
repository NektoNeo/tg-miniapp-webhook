"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@vapc/ui/components";
import type { PC } from "@/types/pc";

interface PCCardProps {
  pc: PC;
}

export function PCCard({ pc }: PCCardProps) {
  return (
    <Link href={`/pcs/${pc.slug}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{pc.name}</CardTitle>
            <Badge variant="neon">{pc.quality}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="w-full h-48 rounded bg-cover bg-center"
            style={{ backgroundImage: `url(${pc.thumbnail})` }}
          />
          <p className="text-sm text-muted-foreground line-clamp-2">
            {pc.description}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">
              {pc.price.toLocaleString("ru-RU")} ₽
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
