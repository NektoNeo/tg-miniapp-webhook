"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gallery } from "@/components/pc-detail/gallery";
import { SpecsList } from "@/components/pc-detail/specs-list";
import { Configurator } from "@/components/pc-detail/configurator";
import { useTelegramBackButton, useTelegramMainButton } from "@/lib/telegram/navigation";
import { useConfigStore } from "@/stores/config";
import { Badge, Card, CardContent } from "@vapc/ui/components";
import type { PCDetailResponse } from "@/types/pc";

export default function PCDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const getTotalPrice = useConfigStore((state) => state.getTotalPrice);

  const { data, isLoading, error } = useQuery<PCDetailResponse>({
    queryKey: ["pc", slug],
    queryFn: async () => {
      const res = await fetch(`/api/pcs/${slug}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("PC not found");
        throw new Error("Failed to fetch PC");
      }
      return res.json();
    },
  });

  useTelegramBackButton();

  // MainButton for order CTA
  useTelegramMainButton({
    text: "Заказать",
    visible: !!data,
    onClick: () => {
      const totalPrice = getTotalPrice();
      // TODO: Implement order logic
      alert(`Заказ оформлен! Сумма: ${totalPrice.toLocaleString("ru-RU")} ₽`);
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-96 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
              <p className="text-muted-foreground">
                {error?.message || "Не удалось загрузить информацию о ПК"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { pc } = data;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{pc.name}</h1>
            <p className="text-muted-foreground">{pc.description}</p>
          </div>
          <Badge variant="neon" className="flex-shrink-0">
            {pc.quality}
          </Badge>
        </div>

        {/* Gallery */}
        <Gallery images={pc.gallery} videoUrl={pc.videoUrl} />

        {/* Configurator */}
        <Configurator options={pc.configOptions} basePrice={pc.price} />

        {/* Specs */}
        <SpecsList specs={pc.specs} />
      </div>
    </main>
  );
}
