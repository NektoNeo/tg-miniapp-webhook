const { BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_WEBHOOK_URL } = process.env;
if (!BOT_TOKEN || !/^[A-Za-z0-9_-]{1,256}$/.test(TELEGRAM_WEBHOOK_SECRET ?? '')) {
  throw new Error('Set BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in the server environment.');
}
const url = new URL(TELEGRAM_WEBHOOK_URL);
if (url.protocol !== 'https:' || url.username || url.password) {
  throw new Error('TELEGRAM_WEBHOOK_URL must be the public HTTPS webhook URL.');
}
try {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.href, secret_token: TELEGRAM_WEBHOOK_SECRET }),
  });
  if (!response.ok || !(await response.json()).ok) throw new Error();
  console.log('Telegram webhook registered.');
} catch {
  console.error('Registration failed. Verify the bot token, webhook URL and server connectivity.');
  process.exitCode = 1;
}
