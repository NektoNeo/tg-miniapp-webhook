import { NextResponse } from "next/server";
import { MOCK_PCS } from "@/lib/mock-data";
import type { PCListResponse } from "@/types/pc";
import { withTelegramAuth, type TelegramAuthRequest } from "@/lib/middleware/telegram-auth";

async function handler(request: TelegramAuthRequest) {
  const { searchParams } = new URL(request.url);

  // Budget filter params
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // Quality filter
  const quality = searchParams.get("quality");

  let filteredPCs = [...MOCK_PCS];

  // Apply budget filter
  if (minPrice) {
    filteredPCs = filteredPCs.filter((pc) => pc.price >= Number(minPrice));
  }
  if (maxPrice) {
    filteredPCs = filteredPCs.filter((pc) => pc.price <= Number(maxPrice));
  }

  // Apply quality filter
  if (quality) {
    filteredPCs = filteredPCs.filter((pc) => pc.quality === quality);
  }

  const response: PCListResponse = {
    pcs: filteredPCs,
    total: filteredPCs.length,
  };

  return NextResponse.json(response);
}

export const GET = withTelegramAuth(handler);
