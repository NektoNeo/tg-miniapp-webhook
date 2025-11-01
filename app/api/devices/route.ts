import { NextResponse } from "next/server";
import { MOCK_DEVICES } from "@/lib/mock-data";
import type { DeviceListResponse, DeviceCategory } from "@/types/device";
import { withTelegramAuth, type TelegramAuthRequest } from "@/lib/middleware/telegram-auth";

async function handler(request: TelegramAuthRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as DeviceCategory | null;

  let filteredDevices = [...MOCK_DEVICES];

  // Apply category filter
  if (category) {
    filteredDevices = filteredDevices.filter((d) => d.category === category);
  }

  // Calculate category counts
  const categoryCounts = MOCK_DEVICES.reduce(
    (acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    },
    {} as Record<DeviceCategory, number>
  );

  const categories = Object.entries(categoryCounts).map(([id, count]) => ({
    id: id as DeviceCategory,
    label: getCategoryLabel(id as DeviceCategory),
    count,
  }));

  const response: DeviceListResponse = {
    devices: filteredDevices,
    categories,
    total: filteredDevices.length,
  };

  return NextResponse.json(response);
}

function getCategoryLabel(category: DeviceCategory): string {
  const labels: Record<DeviceCategory, string> = {
    monitor: "Мониторы",
    keyboard: "Клавиатуры",
    mouse: "Мыши",
    headset: "Наушники",
    chair: "Кресла",
    other: "Другое",
  };
  return labels[category];
}

export const GET = withTelegramAuth(handler);
