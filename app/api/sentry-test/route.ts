import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Отправляем ошибку через server SDK
    const eventId = Sentry.captureException(
      new Error("Server API Test Error - From API Route"),
      {
        level: "error",
        tags: {
          test: "server-api",
          source: "api-route",
        },
      }
    );

    console.log("✅ Server API: Error sent to Sentry, eventId:", eventId);

    return NextResponse.json({
      success: true,
      message: "Error sent from server",
      eventId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Server API: Failed to send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
