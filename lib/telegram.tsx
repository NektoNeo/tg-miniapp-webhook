'use client';

import { SDKProvider } from '@telegram-apps/sdk-react';
import { type PropsWithChildren } from 'react';

export function TelegramProvider({ children }: PropsWithChildren) {
  const debug = process.env.NODE_ENV === 'development';

  return (
    <SDKProvider acceptCustomStyles debug={debug}>
      {children}
    </SDKProvider>
  );
}
