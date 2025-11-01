"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@vapc/ui/components";
import type { Spec } from "@/types/pc";

interface SpecsListProps {
  specs: Spec[];
}

export function SpecsList({ specs }: SpecsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Характеристики</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="flex justify-between gap-4 pb-3 border-b border-border last:border-0 last:pb-0"
            >
              <dt className="text-sm text-muted-foreground font-medium">
                {spec.label}
              </dt>
              <dd className="text-sm font-medium text-right">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
