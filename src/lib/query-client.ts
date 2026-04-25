import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 30s — evita refetch excessivo em navegação rápida
        staleTime: 30_000,
        // 10min — mantém dados em memória para back/forward
        gcTime: 10 * 60_000,
        // 2 retries — resiliência em mobile com rede instável
        retry: 2,
        // Não refetch ao voltar à aba — galeria não é real-time crítico
        refetchOnWindowFocus: false,
        // Tenta cache primeiro, depois rede
        networkMode: "offlineFirst" as const,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // SSR: sempre cria novo para evitar compartilhar entre requests
    return makeQueryClient();
  }
  // Browser: singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
