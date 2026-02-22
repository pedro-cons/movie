'use client';

import { ReactNode } from 'react';
import QueryProvider from './QueryProvider';
import { AuthProvider } from '@/features/auth/context/AuthContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
