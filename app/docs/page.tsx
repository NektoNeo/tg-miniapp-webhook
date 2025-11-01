"use client";

import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@vapc/ui/components";
import { FileText, ExternalLink } from "lucide-react";

const DOCS_LINKS = [
  {
    id: "guarantee",
    title: "Гарантия и возврат",
    description: "Условия гарантии и возврата товара",
    url: "https://telegra.ph/Garantiya-i-vozvrat-01-01",
  },
  {
    id: "delivery",
    title: "Доставка и оплата",
    description: "Способы доставки и оплаты заказа",
    url: "https://telegra.ph/Dostavka-i-oplata-01-01",
  },
  {
    id: "assembly",
    title: "Сборка компьютера",
    description: "Процесс сборки и тестирования",
    url: "https://telegra.ph/Sborka-kompyutera-01-01",
  },
  {
    id: "support",
    title: "Техническая поддержка",
    description: "Как связаться с поддержкой",
    url: "https://telegra.ph/Tekhnicheskaya-podderzhka-01-01",
  },
];

export default function DocsPage() {
  useTelegramBackButton();

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Документация</h1>
          <p className="text-muted-foreground">
            Полезная информация о наших услугах
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCS_LINKS.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {doc.title}
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Additional Info */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Документы открываются в Telegraph
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
