// ---------------------------------------------------------------------------
// Configuração do evento — centraliza slug e API base.
// Configurável via env vars para multi-evento no futuro.
// ---------------------------------------------------------------------------

export const EVENT_SLUG =
  (import.meta.env.VITE_EVENT_SLUG as string | undefined) ?? "1o-constelaco-dos-amigos";

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://api.eventovivo.com.br/api/v1";

/** Monta a URL base do evento para os endpoints da galeria */
export function eventApiUrl(path: string): string {
  return `${API_BASE}/public/events/${EVENT_SLUG}/gallery${path}`;
}
