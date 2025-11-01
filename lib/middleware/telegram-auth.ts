import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  validateInitDataWithDevBypass,
  type TelegramUser,
} from '../telegram/validate-init-data';

/**
 * Extended request type with Telegram user info
 */
export interface TelegramAuthRequest extends NextRequest {
  telegramUser?: TelegramUser;
  telegramUserId?: number;
}

/**
 * Telegram authentication middleware for Next.js API routes
 *
 * Usage in API route:
 * ```ts
 * import { withTelegramAuth } from '@/lib/middleware/telegram-auth';
 *
 * async function handler(req: TelegramAuthRequest) {
 *   const userId = req.telegramUserId;
 *   const user = req.telegramUser;
 *   // ... your handler logic
 *   return NextResponse.json({ success: true });
 * }
 *
 * export const GET = withTelegramAuth(handler);
 * ```
 */
export function withTelegramAuth(
  handler: (req: TelegramAuthRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!botToken) {
        console.error('TELEGRAM_BOT_TOKEN environment variable is not set');
        return NextResponse.json(
          {
            error: 'Server configuration error',
            message: 'Telegram bot token not configured',
          },
          { status: 500 }
        );
      }

      // Extract initData from different sources
      let initData: string | undefined;

      // 1. Try to get from Authorization header (Bearer token)
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        initData = authHeader.substring(7);
      }

      // 2. Try to get from X-Telegram-Init-Data header
      if (!initData) {
        initData = req.headers.get('x-telegram-init-data') || undefined;
      }

      // 3. Try to get from query parameter (for GET requests)
      if (!initData) {
        const { searchParams } = new URL(req.url);
        initData = searchParams.get('initData') || undefined;
      }

      // 4. Try to get from request body (for POST/PUT/PATCH requests)
      if (!initData && req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          // Clone the request to read body without consuming it
          const clonedReq = req.clone();
          const body = await clonedReq.json();
          initData = body.initData;
        } catch {
          // Body parsing failed or not JSON, continue
        }
      }

      // Validate initData
      const validationResult = validateInitDataWithDevBypass(initData, botToken);

      if (!validationResult.valid) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: validationResult.error || 'Invalid Telegram authentication',
          },
          { status: 401 }
        );
      }

      // Attach user info to request
      const authReq = req as TelegramAuthRequest;
      authReq.telegramUserId = validationResult.userId;
      authReq.telegramUser = validationResult.user;

      // Call the actual handler
      return await handler(authReq);
    } catch (error) {
      console.error('Telegram auth middleware error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'Authentication failed',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simplified middleware that only checks for valid initData
 * and returns user info without requiring a handler
 */
export async function validateTelegramAuth(
  req: NextRequest
): Promise<
  | { valid: true; userId: number; user?: TelegramUser }
  | { valid: false; error: string; status: number }
> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return {
      valid: false,
      error: 'Server configuration error',
      status: 500,
    };
  }

  // Extract initData (same logic as withTelegramAuth)
  let initData: string | undefined;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    initData = authHeader.substring(7);
  }

  if (!initData) {
    initData = req.headers.get('x-telegram-init-data') || undefined;
  }

  if (!initData) {
    const { searchParams } = new URL(req.url);
    initData = searchParams.get('initData') || undefined;
  }

  const validationResult = validateInitDataWithDevBypass(initData, botToken);

  if (!validationResult.valid) {
    return {
      valid: false,
      error: validationResult.error || 'Invalid authentication',
      status: 401,
    };
  }

  return {
    valid: true,
    userId: validationResult.userId!,
    user: validationResult.user,
  };
}
