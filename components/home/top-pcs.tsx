"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@vapc/ui/components";
import type { PCListResponse } from "@/types/pc";

export function TopPCs() {
  const { data, isLoading } = useQuery<PCListResponse>({
    queryKey: ["pcs", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/pcs");
      if (!res.ok) throw new Error("Failed to fetch PCs");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Топ-4 сборки</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const topPCs = data?.pcs.filter((pc) => pc.featured).slice(0, 4) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Топ-4 сборки</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topPCs.map((pc) => (
          <Link key={pc.id} href={`/pcs/${pc.slug}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{pc.name}</CardTitle>
                  <Badge variant="neon">{pc.quality}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="w-full h-32 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${pc.thumbnail})` }}
                />
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pc.description}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {pc.price.toLocaleString("ru-RU")} ₽
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
