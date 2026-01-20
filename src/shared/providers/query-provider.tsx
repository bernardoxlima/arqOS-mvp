"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dados são considerados "fresh" por 1 minuto
            staleTime: 60 * 1000,
            // Cache mantido por 5 minutos após não ser usado
            gcTime: 5 * 60 * 1000,
            // Retry 1 vez em caso de erro
            retry: 1,
            // Não refetch ao focar a janela por padrão
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
