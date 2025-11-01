"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@vapc/ui/components";
import { useConfigStore } from "@/stores/config";
import type { ConfigOptions } from "@/types/pc";

interface ConfiguratorProps {
  options: ConfigOptions;
  basePrice: number;
}

export function Configurator({ options, basePrice }: ConfiguratorProps) {
  const {
    selectedRam,
    selectedSsd,
    setSelectedRam,
    setSelectedSsd,
    setBasePrice,
    getTotalPrice,
    reset,
  } = useConfigStore();

  // Initialize on mount
  useEffect(() => {
    setBasePrice(basePrice);

    // Set defaults
    const defaultRam = options.ram.find((r) => r.default);
    const defaultSsd = options.ssd.find((s) => s.default);

    if (defaultRam && !selectedRam) setSelectedRam(defaultRam);
    if (defaultSsd && !selectedSsd) setSelectedSsd(defaultSsd);

    return () => {
      reset();
    };
  }, [basePrice, options, selectedRam, selectedSsd, setBasePrice, setSelectedRam, setSelectedSsd, reset]);

  const totalPrice = getTotalPrice();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Конфигурация</CardTitle>
          <p className="text-2xl font-bold text-primary">
            {totalPrice.toLocaleString("ru-RU")} ₽
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RAM Options */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Оперативная память</h3>
          <div className="grid grid-cols-1 gap-2">
            {options.ram.map((option) => {
              const isSelected = selectedRam?.id === option.id;
              const priceChange = option.priceDelta;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedRam(option)}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {priceChange !== 0 && (
                      <Badge variant={priceChange > 0 ? "default" : "secondary"}>
                        {priceChange > 0 ? "+" : ""}
                        {priceChange.toLocaleString("ru-RU")} ₽
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SSD Options */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Накопитель</h3>
          <div className="grid grid-cols-1 gap-2">
            {options.ssd.map((option) => {
              const isSelected = selectedSsd?.id === option.id;
              const priceChange = option.priceDelta;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedSsd(option)}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {priceChange !== 0 && (
                      <Badge variant={priceChange > 0 ? "default" : "secondary"}>
                        {priceChange > 0 ? "+" : ""}
                        {priceChange.toLocaleString("ru-RU")} ₽
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
