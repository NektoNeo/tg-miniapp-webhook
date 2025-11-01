"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function TestSentryPage() {
  const [, setError] = useState<Error | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const throwClientError = () => {
    try {
      throw new Error("Test Client Error - This is intentional!");
    } catch (error) {
      addResult("🔵 Вызов Sentry.captureException()...");

      try {
        const eventId = Sentry.captureException(error, {
          level: 'error',
          tags: {
            test: 'manual-test',
            source: 'test-page'
          }
        });

        addResult(`✅ captureException вызван, eventId: ${eventId}`);
        setError(error as Error);
        console.error("Client error captured:", error);
      } catch (sentryError) {
        addResult(`❌ ОШИБКА при вызове captureException: ${sentryError}`);
      }
    }
  };

  const throwUnhandledError = () => {
    // This will be caught by global-error.tsx
    throw new Error("Test Unhandled Error - This should appear in Sentry!");
  };

  const sendTestMessage = () => {
    addResult("🔵 Вызов Sentry.captureMessage()...");

    try {
      const eventId = Sentry.captureMessage("Test ERROR message from VA-PC Telegram Mini App", "error");
      addResult(`✅ captureMessage вызван, eventId: ${eventId}`);
    } catch (error) {
      addResult(`❌ ОШИБКА при вызове captureMessage: ${error}`);
    }
  };

  const testServerAPI = async () => {
    addResult("🔵 Вызов server API /api/sentry-test...");

    try {
      const response = await fetch('/api/sentry-test', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        addResult(`✅ Server API: ошибка отправлена, eventId: ${data.eventId}`);
      } else {
        addResult(`❌ Server API failed: ${data.error}`);
      }
    } catch (error) {
      addResult(`❌ Ошибка при вызове API: ${error}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Sentry Test Page</h1>

        <div className="space-y-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Test Sentry Integration</h2>
            <p className="mb-4 text-gray-600">
              Нажмите на кнопки ниже, чтобы протестировать различные сценарии отправки ошибок в Sentry:
            </p>

            <div className="space-y-3">
              <button
                onClick={throwClientError}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                📤 CLIENT: Отправить обработанную ошибку
              </button>

              <button
                onClick={throwUnhandledError}
                className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                💥 CLIENT: Вызвать необработанную ошибку
              </button>

              <button
                onClick={sendTestMessage}
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                ✉️ CLIENT: Отправить тестовое сообщение
              </button>

              <button
                onClick={testServerAPI}
                className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                🖥️ SERVER: Отправить ошибку через API
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="p-6 border rounded-lg bg-yellow-50">
              <h3 className="text-lg font-semibold mb-2">📊 Результаты тестов:</h3>
              <div className="space-y-1 text-sm font-mono max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="border-b border-yellow-200 pb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Инструкции:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Убедитесь что NEXT_PUBLIC_SENTRY_DSN настроен в .env.local</li>
              <li>Откройте консоль браузера для просмотра логов</li>
              <li>Нажмите на любую кнопку выше</li>
              <li>Проверьте Sentry Dashboard для новых событий</li>
              <li>События появятся в разделе Issues вашего проекта</li>
            </ol>
          </div>

          <div className="p-6 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">Проверка настройки:</h3>
            <div className="space-y-1 text-sm">
              <p>✅ @sentry/nextjs установлен</p>
              <p>✅ Конфигурационные файлы созданы</p>
              <p>✅ Next.js интегрирован через withSentryConfig</p>
              <p>✅ Global error handler настроен</p>
              <p className={process.env.NEXT_PUBLIC_SENTRY_DSN ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_SENTRY_DSN ? "✅" : "⚠️"} DSN {process.env.NEXT_PUBLIC_SENTRY_DSN ? "настроен" : "не настроен"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </main>
  );
}
