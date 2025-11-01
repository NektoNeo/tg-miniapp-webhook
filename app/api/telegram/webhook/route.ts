import { Telegraf } from 'telegraf';
import { Queue } from 'bullmq';
import { NextRequest, NextResponse } from 'next/server';
import type { ReminderJob } from '@vapc/shared';

const BOT_TOKEN = process.env.BOT_TOKEN!;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const MINIAPP_URL = process.env.NEXT_PUBLIC_MINIAPP_URL!;

// Initialize Telegraf bot
const bot = new Telegraf(BOT_TOKEN);

// Initialize BullMQ queue for reminders
const reminderQueue = new Queue<ReminderJob>('reminders', {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

// Track first interactions (in-memory, in production use Redis/DB)
const firstInteractionMap = new Map<number, boolean>();

// Schedule reminder helper
async function scheduleReminder(
  userId: number,
  days: 3 | 7,
  message?: string
) {
  const jobId = `reminder-${userId}-${days}d`;

  await reminderQueue.add(
    'send-reminder',
    { userId, days, message },
    {
      jobId, // Idempotency key
      delay: days * 24 * 60 * 60 * 1000, // Convert days to milliseconds
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    }
  );

  console.log(`📅 Scheduled ${days}-day reminder for user ${userId}`);
}

// Cancel all reminders for user
async function cancelReminders(userId: number) {
  const jobIds = [`reminder-${userId}-3d`, `reminder-${userId}-7d`];

  for (const jobId of jobIds) {
    const job = await reminderQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`🗑️ Cancelled reminder ${jobId}`);
    }
  }
}

// Bot command handlers
bot.command('start', async (ctx) => {
  const userId = ctx.from.id;

  await ctx.reply(
    'Добро пожаловать в VA-PC! 🎮\n\n' +
      'Мы поможем вам собрать идеальный игровой компьютер.\n\n' +
      'Нажмите кнопку ниже, чтобы открыть каталог:',
    {
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
    }
  );

  // Schedule reminders on first interaction
  if (!firstInteractionMap.has(userId)) {
    firstInteractionMap.set(userId, true);

    await scheduleReminder(userId, 3);
    await scheduleReminder(userId, 7);

    console.log(`✅ First interaction for user ${userId}, reminders scheduled`);
  }
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Доступные команды:\n\n' +
      '/start - Запустить бота\n' +
      '/help - Показать помощь\n' +
      '/catalog - Открыть каталог PC\n' +
      '/stop_reminders - Отменить напоминания'
  );
});

bot.command('catalog', async (ctx) => {
  await ctx.reply('Открыть каталог игровых PC:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🖥️ Каталог VA-PC',
            web_app: { url: MINIAPP_URL },
          },
        ],
      ],
    },
  });
});

bot.command('stop_reminders', async (ctx) => {
  const userId = ctx.from.id;

  await cancelReminders(userId);

  await ctx.reply(
    '✅ Все запланированные напоминания отменены.\n\n' +
      'Если захотите получать уведомления снова, используйте команду /start'
  );
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// POST handler for Telegram webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Process update with Telegraf
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is ready',
  });
}
