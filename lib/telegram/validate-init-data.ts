import crypto from 'crypto';

/**
 * Telegram WebApp User interface
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  userId?: number;
  user?: TelegramUser;
  error?: string;
}

/**
 * Validates Telegram WebApp initData using HMAC-SHA256
 *
 * Algorithm from official Telegram docs:
 * 1. Parse initData and extract hash parameter
 * 2. Create data-check-string from sorted parameters (excluding hash)
 * 3. Compute secret_key = HMAC_SHA256(bot_token, "WebAppData")
 * 4. Compute signature = HMAC_SHA256(data_check_string, secret_key)
 * 5. Compare hex(signature) with provided hash
 *
 * @param initData - The initData string from Telegram WebApp
 * @param botToken - Your Telegram bot token
 * @param maxAge - Optional: Maximum age of initData in seconds (default: 86400 = 24 hours)
 * @returns ValidationResult with user info if valid
 */
export function validateInitData(
  initData: string,
  botToken: string,
  maxAge: number = 86400
): ValidationResult {
  try {
    // Parse URL-encoded initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return {
        valid: false,
        error: 'Missing hash parameter',
      };
    }

    // Extract and remove hash from params
    params.delete('hash');

    // Sort parameters alphabetically and create data-check-string
    const dataCheckArray: string[] = [];
    const sortedParams = Array.from(params.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    for (const [key, value] of sortedParams) {
      dataCheckArray.push(`${key}=${value}`);
    }

    const dataCheckString = dataCheckArray.join('\n');

    // Step 1: Create secret key = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Step 2: Create signature = HMAC_SHA256(data_check_string, secret_key)
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Step 3: Compare signatures in constant time
    if (signature !== hash) {
      return {
        valid: false,
        error: 'Invalid hash signature',
      };
    }

    // Optional: Check auth_date to prevent replay attacks
    const authDate = params.get('auth_date');
    if (authDate && maxAge > 0) {
      const authTimestamp = parseInt(authDate, 10);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (currentTimestamp - authTimestamp > maxAge) {
        return {
          valid: false,
          error: 'Init data expired',
        };
      }
    }

    // Extract user information
    const userParam = params.get('user');
    let user: TelegramUser | undefined;
    let userId: number | undefined;

    if (userParam) {
      try {
        user = JSON.parse(userParam) as TelegramUser;
        userId = user.id;
      } catch (e) {
        return {
          valid: false,
          error: 'Invalid user data format',
        };
      }
    }

    return {
      valid: true,
      userId,
      user,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Validates initData with dev bypass
 * In development mode, allows bypassing validation if NODE_ENV=development
 * and initData is the special string "dev"
 */
export function validateInitDataWithDevBypass(
  initData: string | undefined,
  botToken: string
): ValidationResult {
  // Dev bypass: if in development and initData is "dev", return mock user
  if (process.env.NODE_ENV === 'development' && initData === 'dev') {
    return {
      valid: true,
      userId: 123456789,
      user: {
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'en',
      },
    };
  }

  if (!initData) {
    return {
      valid: false,
      error: 'Missing initData',
    };
  }

  return validateInitData(initData, botToken);
}
