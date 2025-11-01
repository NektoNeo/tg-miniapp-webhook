import { Worker, UnrecoverableError } from 'bullmq';
import { Telegraf } from 'telegraf';
import type { ReminderJob } from '@vapc/shared';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local first, then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const MINIAPP_URL = process.env.NEXT_PUBLIC_MINIAPP_URL;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

if (!MINIAPP_URL) {
  throw new Error('NEXT_PUBLIC_MINIAPP_URL environment variable is required');
}

const bot = new Telegraf(BOT_TOKEN);

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

// Worker to process reminder jobs
const reminderWorker = new Worker<ReminderJob>(
  'reminders',
  async (job) => {
    const { userId, days, message } = job.data;

    console.log(
      `🔄 Processing reminder job ${job.id} for user ${userId} (${days}-day)`
    );

    const defaultMessage =
      days === 3
        ? '👋 Привет! Прошло 3 дня с вашего последнего визита в VA-PC.\n\n' +
          'Не забудьте проверить новые поступления игровых PC!'
        : '🎮 Прошла целая неделя!\n\n' +
          'В VA-PC появились новые конфигурации компьютеров. Загляните в каталог!';

    try {
      await bot.telegram.sendMessage(userId, message || defaultMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🖥️ Открыть каталог',
                web_app: { url: MINIAPP_URL },
              },
            ],
          ],
        },
      });

      console.log(`✅ Sent ${days}-day reminder to user ${userId}`);
    } catch (error: any) {
      console.error(`Failed to send reminder to ${userId}:`, error);

      // Check for unrecoverable Telegram API errors
      if (
        error?.response?.error_code === 403 || // User blocked the bot
        error?.response?.error_code === 400 // Bad request (invalid user_id)
      ) {
        console.log(
          `⚠️ Unrecoverable error for user ${userId}: ${error?.response?.description}`
        );
        throw new UnrecoverableError(
          `User ${userId} is unreachable: ${error?.response?.description}`
        );
      }

      // Throw error for retry on temporary failures
      throw error;
    }
  },
  {
    connection,
    lockDuration: 30000, // 30 seconds lock
    settings: {
      // Custom backoff strategy
      backoffStrategy: (attemptsMade: number) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.pow(2, attemptsMade - 1) * 1000;
      },
    },
  }
);

// Event handlers for monitoring
reminderWorker.on('completed', (job) => {
  console.log(`✅ Reminder job ${job.id} completed successfully`);
});

reminderWorker.on('failed', (job, err) => {
  if (job) {
    console.error(
      `❌ Reminder job ${job.id} failed after ${job.attemptsMade} attempts:`,
      err.message
    );
  } else {
    console.error('❌ Job failed with no job data:', err.message);
  }
});

reminderWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

reminderWorker.on('active', (job) => {
  console.log(`▶️ Job ${job.id} is now active (attempt ${job.attemptsMade})`);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n⚠️ Received ${signal}, shutting down gracefully...`);

  try {
    await reminderWorker.close();
    console.log('✅ Worker closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

console.log('🔄 Reminder worker started');
console.log(`📡 Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);
console.log('⏳ Waiting for jobs...\n');
