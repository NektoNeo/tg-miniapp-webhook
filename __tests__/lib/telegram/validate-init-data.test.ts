/**
 * Unit tests for Telegram initData validation
 *
 * To run these tests, install a test framework like Jest or Vitest:
 * ```bash
 * pnpm add -D vitest @vitest/ui
 * ```
 *
 * Then add to package.json scripts:
 * ```json
 * "test": "vitest",
 * "test:ui": "vitest --ui"
 * ```
 */

import crypto from 'crypto';
import {
  validateInitData,
  validateInitDataWithDevBypass,
  type ValidationResult,
} from '../../../lib/telegram/validate-init-data';

describe('validateInitData', () => {
  const TEST_BOT_TOKEN = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';

  /**
   * Helper to create valid initData with proper HMAC signature
   */
  function createValidInitData(data: Record<string, string>): string {
    // Create data-check-string
    const dataCheckArray = Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`);
    const dataCheckString = dataCheckArray.join('\n');

    // Compute secret_key = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(TEST_BOT_TOKEN)
      .digest();

    // Compute signature = HMAC_SHA256(data_check_string, secret_key)
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Create initData string
    const params = new URLSearchParams(data);
    params.set('hash', hash);

    return params.toString();
  }

  describe('Valid initData', () => {
    it('should validate correct initData with user info', () => {
      const userData = {
        id: 123456789,
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        language_code: 'en',
      };

      const initData = createValidInitData({
        user: JSON.stringify(userData),
        auth_date: String(Math.floor(Date.now() / 1000)),
        query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
      });

      const result = validateInitData(initData, TEST_BOT_TOKEN);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userData.id);
      expect(result.user).toEqual(userData);
      expect(result.error).toBeUndefined();
    });

    it('should validate initData without user info', () => {
      const initData = createValidInitData({
        auth_date: String(Math.floor(Date.now() / 1000)),
        query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
      });

      const result = validateInitData(initData, TEST_BOT_TOKEN);

      expect(result.valid).toBe(true);
      expect(result.userId).toBeUndefined();
      expect(result.user).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should validate recent initData within maxAge', () => {
      const initData = createValidInitData({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
      });

      const result = validateInitData(initData, TEST_BOT_TOKEN, 7200); // 2 hours maxAge

      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid initData', () => {
    it('should reject initData with missing hash', () => {
      const params = new URLSearchParams({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000)),
      });

      const result = validateInitData(params.toString(), TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing hash parameter');
    });

    it('should reject initData with invalid hash', () => {
      const params = new URLSearchParams({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000)),
        hash: 'invalid_hash_value',
      });

      const result = validateInitData(params.toString(), TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid hash signature');
    });

    it('should reject tampered initData', () => {
      const validInitData = createValidInitData({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000)),
      });

      // Tamper with the data
      const params = new URLSearchParams(validInitData);
      params.set('user', JSON.stringify({ id: 999, first_name: 'Hacker' }));

      const result = validateInitData(params.toString(), TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid hash signature');
    });

    it('should reject expired initData', () => {
      const initData = createValidInitData({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000) - 86400), // 24 hours ago
      });

      const result = validateInitData(initData, TEST_BOT_TOKEN, 3600); // 1 hour maxAge

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Init data expired');
    });

    it('should reject initData with invalid user JSON', () => {
      const initData = createValidInitData({
        user: 'invalid_json{{{',
        auth_date: String(Math.floor(Date.now() / 1000)),
      });

      const result = validateInitData(initData, TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid user data format');
    });

    it('should reject initData with wrong bot token', () => {
      const initData = createValidInitData({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000)),
      });

      const wrongToken = '987654321:XYZwvuTSRqponmlkJIHgfedCBA';
      const result = validateInitData(initData, wrongToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid hash signature');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty initData', () => {
      const result = validateInitData('', TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing hash parameter');
    });

    it('should handle special characters in user data', () => {
      const userData = {
        id: 123,
        first_name: 'Иван',
        last_name: "O'Connor",
        username: 'test_user-123',
      };

      const initData = createValidInitData({
        user: JSON.stringify(userData),
        auth_date: String(Math.floor(Date.now() / 1000)),
      });

      const result = validateInitData(initData, TEST_BOT_TOKEN);

      expect(result.valid).toBe(true);
      expect(result.user?.first_name).toBe('Иван');
      expect(result.user?.last_name).toBe("O'Connor");
    });

    it('should allow disabling maxAge check', () => {
      const veryOldInitData = createValidInitData({
        user: JSON.stringify({ id: 123, first_name: 'Test' }),
        auth_date: String(Math.floor(Date.now() / 1000) - 86400 * 365), // 1 year ago
      });

      const result = validateInitData(veryOldInitData, TEST_BOT_TOKEN, 0);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateInitDataWithDevBypass', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should bypass validation in development with "dev" initData', () => {
      process.env.NODE_ENV = 'development';

      const result = validateInitDataWithDevBypass('dev', TEST_BOT_TOKEN);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(123456789);
      expect(result.user?.first_name).toBe('Dev');
      expect(result.user?.username).toBe('devuser');
    });

    it('should NOT bypass in production even with "dev" initData', () => {
      process.env.NODE_ENV = 'production';

      const result = validateInitDataWithDevBypass('dev', TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
    });

    it('should validate real initData in development', () => {
      process.env.NODE_ENV = 'development';

      const validInitData = createValidInitData({
        user: JSON.stringify({ id: 999, first_name: 'Real' }),
        auth_date: String(Math.floor(Date.now() / 1000)),
      });

      const result = validateInitDataWithDevBypass(validInitData, TEST_BOT_TOKEN);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(999);
    });

    it('should handle missing initData', () => {
      process.env.NODE_ENV = 'development';

      const result = validateInitDataWithDevBypass(undefined, TEST_BOT_TOKEN);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing initData');
    });
  });
});

/**
 * Simple expect implementation for manual testing
 * Replace with proper test framework (Jest/Vitest) for production
 */
function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(value)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeUndefined() {
      if (value !== undefined) {
        throw new Error(`Expected ${value} to be undefined`);
      }
    },
  };
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${error instanceof Error ? error.message : error}`);
  }
}

function afterEach(fn: () => void) {
  // Simple implementation - run after each test
  // In real test framework, this would be handled properly
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running Telegram initData validation tests...');
  // Tests will run when imports are executed
}
