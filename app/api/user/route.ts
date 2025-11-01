/**
 * User Endpoint with Telegram Authentication
 *
 * Демонстрирует использование Telegram initData валидации
 * для защиты API endpoints
 */

import { requireTelegramAuth } from "@/lib/telegram-server";

export async function GET(request: Request) {
  try {
    // Валидируем Telegram initData
    const initData = await requireTelegramAuth(request);

    if (!initData.user) {
      return Response.json(
        { error: "No user data in init data" },
        { status: 400 }
      );
    }

    // Возвращаем данные пользователя
    return Response.json({
      user: {
        id: initData.user.id,
        first_name: initData.user.first_name,
        last_name: initData.user.last_name,
        username: initData.user.username,
        language_code: initData.user.language_code,
        is_premium: initData.user.is_premium,
      },
      auth_date: initData.auth_date,
      query_id: initData.query_id,
    });
  } catch (error) {
    console.error("Auth error:", error);

    return Response.json(
      {
        error: "Unauthorized",
        message:
          error instanceof Error ? error.message : "Invalid Telegram data",
      },
      { status: 401 }
    );
  }
}
