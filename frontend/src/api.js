// Local dev: empty → Vite proxies /ask to localhost:8000
// Production: Hugging Face Space (override with VITE_API_BASE at build time)
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? '' : 'https://viditi-viditi-portfolio-backend.hf.space');

export function askUrl() {
  return `${API_BASE}/ask`;
}
