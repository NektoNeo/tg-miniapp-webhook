# Telegram Bot Webhook & Reminders Implementation

## Overview

This implementation adds Telegram bot webhook functionality with automated reminder scheduling using Telegraf v4 and BullMQ.

## Features

✅ **Webhook Route Handler** - Next.js Route Handler at `/api/telegram/webhook`
✅ **First Interaction Detection** - Automatically schedules reminders on user's first interaction
✅ **Delayed Reminders** - +3 day and +7 day reminders via BullMQ
✅ **Stop Reminders Command** - `/stop_reminders` to cancel scheduled notifications
✅ **Idempotency Keys** - Prevents duplicate reminder scheduling
✅ **Safe Retries** - Exponential backoff with UnrecoverableError handling
✅ **Worker Process** - Standalone BullMQ worker with graceful shutdown

## Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│   (Webhook)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Next.js Route Handler       │
│ /api/telegram/webhook       │
│ - Telegraf handleUpdate()   │
│ - First interaction check   │
│ - Schedule reminders        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│      BullMQ Queue           │
│      (Redis)                │
│ - Delayed jobs (+3d, +7d)   │
│ - Idempotency keys          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   BullMQ Worker Process     │
│ - Send reminder messages    │
│ - Handle retries/failures   │
│ - Graceful shutdown         │
└─────────────────────────────┘
```

## Setup

### 1. Prerequisites

- Redis server running (for BullMQ)
- Telegram Bot Token (from @BotFather)
- Public URL for webhook (ngrok/production domain)

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Telegram Bot Token from @BotFather
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# Public URL where webhook will receive updates
NEXT_PUBLIC_MINIAPP_URL=https://your-domain.com

# Redis connection for BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=development
```

### 3. Install Dependencies

```bash
pnpm install
```

Dependencies added:
- `telegraf` - Telegram Bot Framework
- `bullmq` - Redis-based queue for delayed jobs
- `ioredis` - Redis client
- `dotenv` - Environment variables
- `tsx` - TypeScript executor for worker

### 4. Set Telegram Webhook

Use Telegram API to set webhook URL:

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

Or for local development with ngrok:

```bash
# Start ngrok
ngrok http 3000

# Set webhook
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"}'
```

## Running

### Development

Start both the Next.js server and BullMQ worker:

```bash
# Terminal 1: Next.js dev server
pnpm dev

# Terminal 2: BullMQ worker
pnpm dev:worker
```

### Production

```bash
# Build Next.js app
pnpm build

# Terminal 1: Next.js production server
pnpm start

# Terminal 2: BullMQ worker
pnpm start:worker
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Initializes bot and schedules reminders |
| `/help` | Shows available commands |
| `/catalog` | Opens mini app catalog |
| `/stop_reminders` | Cancels all scheduled reminders |

## Implementation Details

### Webhook Route Handler

**File:** `app/api/telegram/webhook/route.ts`

- Receives POST requests from Telegram
- Uses `bot.handleUpdate()` to process updates
- Tracks first interactions in-memory (use Redis/DB in production)
- Schedules +3d and +7d reminders via BullMQ
- Returns health check on GET requests

### BullMQ Worker

**File:** `worker.ts`

- Processes delayed reminder jobs
- Exponential backoff retry (1s, 2s, 4s)
- Handles UnrecoverableError for blocked users (403)
- Graceful shutdown on SIGINT/SIGTERM
- 30-second job lock duration

### Idempotency

Jobs use userId-based IDs:
- `reminder-${userId}-3d`
- `reminder-${userId}-7d`

Prevents duplicate scheduling if user interacts multiple times.

### Retry Strategy

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s
  }
}
```

**UnrecoverableError** thrown for:
- User blocked bot (403)
- Invalid user_id (400)

## Testing

### 1. Local Testing with ngrok

```bash
# Start ngrok
ngrok http 3000

# Update bot webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok.io/api/telegram/webhook"}'

# Start services
pnpm dev          # Terminal 1
pnpm dev:worker   # Terminal 2
```

### 2. Test Flow

1. **Send `/start` to bot**
   - Bot responds with welcome message
   - Check logs: "First interaction for user X, reminders scheduled"

2. **Verify Redis queue**
   ```bash
   redis-cli
   KEYS reminder-*
   ```

3. **Test `/stop_reminders`**
   - Send command to bot
   - Bot confirms cancellation
   - Check logs: "Cancelled reminder X"

4. **Test worker**
   - Manually add short-delay job for testing:
   ```typescript
   await reminderQueue.add('send-reminder', {
     userId: 123456,
     days: 3,
   }, { delay: 5000 }); // 5 seconds
   ```
   - Watch worker logs for job processing

### 3. Verify Webhook Health

```bash
curl https://your-domain.com/api/telegram/webhook

# Response:
{
  "status": "ok",
  "message": "Telegram webhook endpoint is ready"
}
```

## Success Criteria

✅ **Webhook receives Telegram updates**
✅ **First `/start` schedules 2 reminders (+3d, +7d)**
✅ **Worker processes jobs and sends messages**
✅ **`/stop_reminders` cancels pending jobs**
✅ **Idempotency prevents duplicate scheduling**
✅ **Retries work with exponential backoff**
✅ **UnrecoverableError handles blocked users**

## Monitoring

### Worker Logs

```
🔄 Reminder worker started
📡 Connected to Redis at localhost:6379
⏳ Waiting for jobs...

▶️ Job reminder-123456-3d is now active (attempt 1)
🔄 Processing reminder job reminder-123456-3d for user 123456 (3-day)
✅ Sent 3-day reminder to user 123456
✅ Reminder job reminder-123456-3d completed successfully
```

### Webhook Logs

```
📅 Scheduled 3-day reminder for user 123456
📅 Scheduled 7-day reminder for user 123456
✅ First interaction for user 123456, reminders scheduled
```

## Troubleshooting

### Webhook not receiving updates

1. Check webhook status:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```

2. Verify URL is publicly accessible
3. Check Next.js logs for errors

### Worker not processing jobs

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```

2. Check worker logs for connection errors
3. Verify environment variables are set

### Reminders not sent

1. Check worker is running
2. Verify BOT_TOKEN is correct
3. Check Redis for pending jobs:
   ```bash
   redis-cli
   KEYS *reminder*
   ```

## Production Considerations

### In-Memory First Interaction Map

Current implementation uses `Map<userId, boolean>` which resets on server restart.

**For production, use:**
- Redis Set: `SADD first_interactions <userId>`
- PostgreSQL table with `user_id` column
- DynamoDB/MongoDB document store

### Scaling Workers

Run multiple worker instances for high throughput:

```bash
# Instance 1
pnpm start:worker

# Instance 2
pnpm start:worker
```

BullMQ handles job distribution automatically.

### Monitoring & Alerts

Add monitoring for:
- Failed jobs count
- Queue length
- Worker health
- Telegram API errors

Use BullMQ Board for web UI:

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(reminderQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

## Files Created/Modified

### New Files
- `apps/miniapp/app/api/telegram/webhook/route.ts` - Webhook route handler
- `apps/miniapp/worker.ts` - BullMQ worker process
- `apps/miniapp/.env.example` - Environment template
- `apps/miniapp/WEBHOOK_README.md` - This documentation

### Modified Files
- `apps/miniapp/package.json` - Added dependencies and scripts
- `packages/shared/types/telegram.ts` - ReminderJob type already existed

### Shared Types
- `ReminderJob` interface in `@vapc/shared`

## Next Steps

1. **Migrate first interaction tracking** to Redis/Database
2. **Add monitoring dashboard** (Bull Board)
3. **Implement rate limiting** for user commands
4. **Add custom reminder messages** per user preference
5. **Track reminder effectiveness** (open rates, interactions)
6. **Add /schedule_custom** command for user-defined reminders

---

**Implementation Date:** 2025-11-01
**Telegraf Version:** 4.16.3
**BullMQ Version:** 5.63.0
