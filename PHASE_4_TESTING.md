# Phase 4: Security InitData Guard - Testing Guide

## ✅ Implementation Complete

All Phase 4 tasks completed:
1. ✅ Validation utility module (`lib/telegram/validate-init-data.ts`)
2. ✅ Middleware for Next.js API routes (`lib/middleware/telegram-auth.ts`)
3. ✅ Environment variables documented (`.env.example`, `README.md`)
4. ✅ Protected routes: `/api/pcs/*`, `/api/devices`
5. ✅ Unit tests (`__tests__/lib/telegram/validate-init-data.test.ts`)

## 🔧 Setup

### 1. Configure Environment Variables

```bash
cd apps/miniapp
cp .env.example .env.local
```

Edit `.env.local` and add your Telegram bot token:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

Get your bot token from [@BotFather](https://t.me/BotFather) on Telegram.

### 2. Start Development Server

```bash
pnpm dev
```

Server will start on http://localhost:3002 (or next available port).

## 🧪 Manual Testing

### Test 1: Development Bypass (Quick Test)

In development mode, you can use the special "dev" initData to bypass validation:

```bash
# Test PCs endpoint with dev bypass
curl -H "Authorization: Bearer dev" http://localhost:3002/api/pcs

# Expected: 200 OK with PCs list
```

### Test 2: Missing Authentication (Should Fail)

```bash
# Test without initData
curl http://localhost:3002/api/pcs

# Expected: 401 Unauthorized
# Response: {"error":"Unauthorized","message":"Missing initData"}
```

### Test 3: Invalid Authentication (Should Fail)

```bash
# Test with invalid initData
curl -H "Authorization: Bearer invalid_data" http://localhost:3002/api/pcs

# Expected: 401 Unauthorized
# Response: {"error":"Unauthorized","message":"Invalid hash signature"}
```

### Test 4: Real Telegram InitData

To test with real Telegram initData, you need to:

1. Open your Telegram Mini App in Telegram
2. Extract the `initData` from `window.Telegram.WebApp.initData`
3. Use it in your API requests:

```bash
# Example with real initData
INIT_DATA="query_id=AAHdF6IQA...&user=%7B%22id%22%3A123456789...&hash=abc123..."

curl -H "Authorization: Bearer $INIT_DATA" http://localhost:3002/api/pcs

# Expected: 200 OK with PCs list (if valid and not expired)
```

### Test 5: Different Routes

Test all protected routes:

```bash
# PCs list
curl -H "Authorization: Bearer dev" http://localhost:3002/api/pcs

# PC detail
curl -H "Authorization: Bearer dev" http://localhost:3002/api/pcs/gaming-beast-rtx4090

# Devices list
curl -H "Authorization: Bearer dev" http://localhost:3002/api/devices

# Devices filtered
curl -H "Authorization: Bearer dev" "http://localhost:3002/api/devices?category=monitor"
```

### Test 6: Different Auth Methods

The middleware accepts initData from multiple sources:

```bash
# 1. Authorization header (Bearer token)
curl -H "Authorization: Bearer dev" http://localhost:3002/api/pcs

# 2. X-Telegram-Init-Data header
curl -H "X-Telegram-Init-Data: dev" http://localhost:3002/api/pcs

# 3. Query parameter
curl "http://localhost:3002/api/pcs?initData=dev"

# All should return 200 OK in development
```

## 📊 Success Metrics

### ✅ Validation Logic
- ✅ HMAC-SHA256 signature verification implemented
- ✅ Secure comparison prevents timing attacks
- ✅ Auth date expiration check (default 24 hours)
- ✅ Safe user data extraction
- ✅ Graceful error handling

### ✅ API Protection
- ✅ All `/api/pcs/*` routes protected
- ✅ All `/api/devices/*` routes protected
- ✅ 401 response for invalid auth
- ✅ User info attached to request object

### ✅ Development Experience
- ✅ Dev bypass mode (NODE_ENV=development + "dev" initData)
- ✅ Clear error messages
- ✅ TypeScript type safety
- ✅ Multiple auth methods supported

### ✅ Testing
- ✅ Comprehensive unit tests written
- ✅ Valid initData test cases
- ✅ Invalid initData test cases
- ✅ Edge cases covered
- ✅ Dev bypass tested

## 🔒 Security Features

1. **HMAC-SHA256 Validation**: Cryptographic signature verification using bot token
2. **Constant-time Comparison**: Prevents timing attacks
3. **Replay Protection**: Optional auth_date expiration check
4. **Input Validation**: Safe JSON parsing and error handling
5. **Type Safety**: Full TypeScript typing for user data

## 📝 Code Quality

- Clean, well-documented code
- Follows official Telegram WebApp validation algorithm
- Type-safe interfaces
- Separation of concerns (validation logic + middleware)
- Easy to test and maintain

## 🚀 Production Readiness

Before deploying to production:

1. ✅ Set `TELEGRAM_BOT_TOKEN` in production environment
2. ✅ Ensure `NODE_ENV=production` (disables dev bypass)
3. ✅ Consider adjusting `maxAge` parameter if needed
4. ✅ Monitor 401 errors in production logs
5. ✅ Test with real Telegram Mini App

## 📚 Usage Example

```typescript
// In your API route
import { withTelegramAuth, type TelegramAuthRequest } from '@/lib/middleware/telegram-auth';

async function handler(req: TelegramAuthRequest) {
  // Access user info
  const userId = req.telegramUserId;
  const user = req.telegramUser;

  // Your API logic here
  return NextResponse.json({
    message: `Hello, ${user?.first_name}!`,
    userId,
  });
}

export const GET = withTelegramAuth(handler);
```

## 🐛 Troubleshooting

### "Server configuration error"
- Check that `TELEGRAM_BOT_TOKEN` is set in `.env.local`

### "Invalid hash signature"
- Verify bot token is correct
- Check that initData hasn't expired
- Ensure initData hasn't been tampered with

### "Init data expired"
- InitData is older than maxAge (default 24 hours)
- Get fresh initData from Telegram WebApp

### Dev bypass not working
- Ensure `NODE_ENV=development`
- Use exactly "dev" as the initData value

## 📖 References

- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Init Data Validation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- [HMAC-SHA256 Algorithm](https://en.wikipedia.org/wiki/HMAC)
