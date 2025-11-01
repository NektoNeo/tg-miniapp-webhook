import { validate } from '@telegram-apps/init-data-node';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    const token = process.env.BOT_TOKEN;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'BOT_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Validate the init data
    validate(initData, token);

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Init data validation failed:', error);
    return NextResponse.json(
      { valid: false, error: 'Invalid init data' },
      { status: 401 }
    );
  }
}
