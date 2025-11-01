/**
 * Health Check Endpoint
 *
 * Простой endpoint для проверки работоспособности API
 */

export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: Date.now(),
    service: "VA-PC Mini App API",
    version: "1.0.0",
  });
}
