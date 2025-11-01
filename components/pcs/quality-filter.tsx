"use client";

import { Badge } from "@vapc/ui/components";
import { useFiltersStore, type QualityFilter } from "@/stores/filters";

const QUALITY_OPTIONS: { value: QualityFilter; label: string }[] = [
  { value: null, label: "Все" },
  { value: "FHD", label: "FHD" },
  { value: "2K", label: "2K" },
  { value: "4K", label: "4K" },
];

export function QualityFilterComponent() {
  const { qualityFilter, setQualityFilter } = useFiltersStore();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Качество</h3>
      <div className="flex flex-wrap gap-2">
        {QUALITY_OPTIONS.map((option) => (
          <Badge
            key={option.value || "all"}
            variant={qualityFilter === option.value ? "neon-solid" : "outline"}
            className="cursor-pointer"
            onClick={() => setQualityFilter(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
