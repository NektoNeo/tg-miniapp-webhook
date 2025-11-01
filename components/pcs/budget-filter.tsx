"use client";

import { Button } from "@vapc/ui/components";
import { useFiltersStore, type BudgetPreset } from "@/stores/filters";

const BUDGET_OPTIONS: { value: BudgetPreset; label: string }[] = [
  { value: "none", label: "Все цены" },
  { value: "46-100", label: "46-100k" },
  { value: "100-150", label: "100-150k" },
  { value: "150-225", label: "150-225k" },
  { value: "225-300", label: "225-300k" },
  { value: "300-500", label: "300-500k" },
];

export function BudgetFilter() {
  const { budgetPreset, setBudgetPreset } = useFiltersStore();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Бюджет</h3>
      <div className="flex flex-wrap gap-2">
        {BUDGET_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={budgetPreset === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setBudgetPreset(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
