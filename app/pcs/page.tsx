"use client";

import { useQuery } from "@tanstack/react-query";
import { BudgetFilter } from "@/components/pcs/budget-filter";
import { QualityFilterComponent } from "@/components/pcs/quality-filter";
import { PCCard } from "@/components/pcs/pc-card";
import { useFiltersStore } from "@/stores/filters";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import type { PCListResponse } from "@/types/pc";
import { Button, Card, CardContent } from "@vapc/ui/components";

export default function PCsPage() {
  const { budgetPreset, qualityFilter, clearFilters, getBudgetRange } =
    useFiltersStore();
  useTelegramBackButton();

  const budgetRange = getBudgetRange();

  const { data, isLoading } = useQuery<PCListResponse>({
    queryKey: ["pcs", budgetPreset, qualityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (budgetRange) {
        params.set("minPrice", budgetRange.min.toString());
        params.set("maxPrice", budgetRange.max.toString());
      }
      if (qualityFilter) {
        params.set("quality", qualityFilter);
      }

      const res = await fetch(`/api/pcs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch PCs");
      return res.json();
    },
  });

  const hasActiveFilters = budgetPreset !== "none" || qualityFilter !== null;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Игровые ПК</h1>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Сбросить фильтры
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <BudgetFilter />
            <QualityFilterComponent />
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-64 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Найдено: {data?.total || 0} сборок
            </p>
            {data && data.pcs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.pcs.map((pc) => (
                  <PCCard key={pc.id} pc={pc} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    По выбранным фильтрам ничего не найдено
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Сбросить фильтры
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
