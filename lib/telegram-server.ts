/**
 * Server-side Telegram Init Data Validator
 *
 * Использует @telegram-apps/init-data-node для валидации подписи
 * и парсинга данных инициализации Telegram Mini App на сервере.
 */

import { validate, parse } from "@telegram-apps/init-data-node";
import type { TelegramInitData } from "@vapc/shared";

/**
 * Валидирует initData от Telegram и возвращает распарсенные данные
 *
 * @param initDataString - Raw init data string от Telegram (обычно из header или query)
 * @param expiresIn - Время жизни initData в секундах (по умолчанию 86400 = 24 часа)
 * @returns Распарсенные и валидированные данные
 * @throws Error если подпись невалидна или токен истек
 */
export async function validateTelegramInitData(
  initDataString: string,
  expiresIn: number = 86400
): Promise<TelegramInitData> {
  const botToken = process.env.BOT_TOKEN;

  if (!botToken) {
    throw new Error("BOT_TOKEN not configured");
  }

  try {
    // Валидация подписи
    validate(initDataString, botToken, { expiresIn });

    // Парсинг данных
    const data = parse(initDataString);

    // Преобразуем в наш тип
    return {
      user: data.user
        ? {
            id: data.user.id,
            first_name: data.user.firstName,
            last_name: data.user.lastName,
            username: data.user.username,
            language_code: data.user.languageCode,
            is_premium: data.user.isPremium,
            photo_url: data.user.photoUrl,
          }
        : undefined,
      auth_date: data.authDate.getTime() / 1000, // Конвертируем Date в timestamp
      hash: data.hash,
      query_id: data.queryId,
      start_param: data.startParam,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid Telegram init data: ${error.message}`);
    }
    throw new Error("Invalid Telegram init data");
  }
}

/**
 * Извлекает initData из Next.js Request
 *
 * Проверяет несколько источников:
 * 1. x-telegram-init-data header
 * 2. authorization header (Bearer token)
 * 3. query parameter initData
 *
 * @param request - Next.js Request object
 * @returns initData string или null
 */
export function extractInitData(request: Request): string | null {
  // Проверяем header
  const headerValue =
    request.headers.get("x-telegram-init-data") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (headerValue) {
    return headerValue;
  }

  // Проверяем query параметр
  const url = new URL(request.url);
  const queryValue = url.searchParams.get("initData");

  return queryValue;
}

/**
 * Middleware helper для защиты API routes
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const initData = await requireTelegramAuth(request);
 *
 *   // Теперь можно использовать initData.user
 *   return Response.json({ user: initData.user });
 * }
 * ```
 */
export async function requireTelegramAuth(
  request: Request
): Promise<TelegramInitData> {
  const initDataString = extractInitData(request);

  if (!initDataString) {
    throw new Error("No Telegram init data provided");
  }

  return await validateTelegramInitData(initDataString);
}
