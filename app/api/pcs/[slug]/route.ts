import { NextResponse } from "next/server";
import { MOCK_PCS } from "@/lib/mock-data";
import type { PCDetailResponse } from "@/types/pc";
import { withTelegramAuth, type TelegramAuthRequest } from "@/lib/middleware/telegram-auth";

async function handler(
  request: TelegramAuthRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const pc = MOCK_PCS.find((p) => p.slug === slug);

  if (!pc) {
    return NextResponse.json(
      { error: "PC not found" },
      { status: 404 }
    );
  }

  const response: PCDetailResponse = {
    pc,
  };

  return NextResponse.json(response);
}

export const GET = withTelegramAuth(handler);
