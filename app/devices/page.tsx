"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@vapc/ui/components";
import type { DeviceListResponse, DeviceCategory } from "@/types/device";

export default function DevicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | null>(null);
  useTelegramBackButton();

  const { data, isLoading } = useQuery<DeviceListResponse>({
    queryKey: ["devices", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      const res = await fetch(`/api/devices?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch devices");
      return res.json();
    },
  });

  // Get featured devices (Top-4)
  const featuredDevices = data?.devices.filter((d) => d.featured).slice(0, 4) || [];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Девайсы</h1>
          {selectedCategory && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              Сбросить фильтр
            </Button>
          )}
        </div>

        {/* Categories */}
        {data?.categories && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Все ({data.devices.length})
                </Button>
                {data.categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label} ({cat.count})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top-4 Featured Devices */}
        {!selectedCategory && featuredDevices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Топ-4 девайса</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredDevices.map((device) => (
                <Card
                  key={device.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="text-base">{device.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div
                      className="w-full h-32 rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${device.thumbnail})` }}
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {device.description}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {device.price.toLocaleString("ru-RU")} ₽
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Devices */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-48 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedCategory ? "Отфильтровано" : "Все девайсы"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Найдено: {data?.devices.length || 0}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.devices.map((device) => (
                <Card
                  key={device.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {device.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div
                      className="w-full h-40 rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${device.thumbnail})` }}
                    />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {device.description}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {device.price.toLocaleString("ru-RU")} ₽
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
