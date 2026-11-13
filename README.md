# Telegram Mini App with Webhook & Reminders

Next.js-based Telegram Mini App with integrated webhook support using Telegraf v4 and automated reminder scheduling with BullMQ.

## 🚀 Features

- ✅ **Telegram Bot Webhook** - Next.js Route Handler integration
- ✅ **Automated Reminders** - BullMQ-based delayed notifications (+3 days, +7 days)
- ✅ **Command Handlers** - `/start`, `/help`, `/catalog`, `/stop_reminders`
- ✅ **Idempotency** - Prevents duplicate reminder scheduling
- ✅ **Safe Retries** - Exponential backoff (1s, 2s, 4s) with UnrecoverableError handling
- ✅ **Worker Process** - Standalone BullMQ worker with graceful shutdown

## 📋 Tech Stack

- **Next.js 15** - App Router with Route Handlers
- **Telegraf v4** - Modern Telegram Bot Framework
- **BullMQ** - Redis-based message queue for delayed jobs
- **TypeScript** - Full type safety
- **Redis** - Queue backend
- **React 19** - UI components
- **Tailwind CSS 4** - Styling

## 🛠 Setup

### Prerequisites

- Node.js 18+
- Redis server
- Telegram Bot Token (from @BotFather)
- Public URL for webhook (ngrok/production domain)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Configure .env.local with your credentials
```

### Environment Variables

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

### Set Telegram Webhook

```bash
# From the app directory, export BOT_TOKEN, TELEGRAM_WEBHOOK_URL and TELEGRAM_WEBHOOK_SECRET.
node scripts/register-webhook.mjs
```

## 🏃 Running

### Development

```bash
# Terminal 1: Next.js dev server
pnpm dev

# Terminal 2: BullMQ worker
pnpm dev:worker
```

### Production

```bash
# Build
pnpm build

# Terminal 1: Next.js production server
pnpm start

# Terminal 2: BullMQ worker
pnpm start:worker
```

## 📚 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Initializes bot and schedules reminders |
| `/help` | Shows available commands |
| `/catalog` | Opens mini app catalog |
| `/stop_reminders` | Cancels all scheduled reminders |

## 📖 Documentation

See [WEBHOOK_README.md](WEBHOOK_README.md) for:
- Detailed architecture
- Testing guide
- Troubleshooting
- Production deployment

## 🎯 Implementation Details

### Webhook Route Handler

- **File**: `app/api/telegram/webhook/route.ts`
- Uses Telegraf's `bot.handleUpdate()` for processing Telegram updates
- Tracks first interactions in-memory (migrate to Redis/DB for production)
- Schedules reminders via BullMQ with idempotency keys

### BullMQ Worker

- **File**: `worker.ts`
- Processes delayed reminder jobs
- Exponential backoff retry strategy (1s, 2s, 4s)
- Handles UnrecoverableError for blocked users (403) and invalid IDs (400)
- Graceful shutdown on SIGINT/SIGTERM

### Idempotency

Jobs use userId-based IDs to prevent duplicates:
- `reminder-${userId}-3d`
- `reminder-${userId}-7d`

## 🧪 Testing

Comprehensive testing plan included:
- **Tier 1**: Basic functionality (webhook health, file structure)
- **Tier 2**: Redis integration (queue, worker, idempotency)
- **Tier 3**: E2E flow (real bot token, message delivery)

See testing section in `WEBHOOK_README.md` for details.

## 📦 Scripts

```json
{
  "dev": "next dev --turbopack",
  "dev:worker": "tsx watch worker.ts",
  "build": "next build",
  "start": "next start",
  "start:worker": "tsx worker.ts"
}
```

## 🔐 Security

- `.env.local` is gitignored (contains BOT_TOKEN)
- Use environment variables for all secrets
- Implement rate limiting for production
- Validate Telegram init data on user endpoints

## 📝 License

MIT

## 🤝 Contributing

Issues and PRs are welcome!

---

**Built with ❤️ using Next.js, Telegraf, and BullMQ**

Before switching an existing deployment, generate a random webhook secret (for example 32 random bytes encoded as hex). Put it in the server secret store as `TELEGRAM_WEBHOOK_SECRET`. Set `TELEGRAM_WEBHOOK_URL` to the existing full HTTPS callback. Register the same secret with Telegram using the script while the old handler is still running, then deploy the new handler and check bot delivery. Keep the queue of pending updates.
