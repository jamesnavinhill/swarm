/**
 * Browser client for the Agency gateway (OpenAI-compatible, free models).
 * BYOK: the key lives in localStorage (pasted in the UI) or an optional
 * VITE_YRKA_GATEWAY_TOKEN env — it is never bundled by default and no
 * server-side credential exists in this static SPA.
 */

const GATEWAY_BASE_URL =
  (import.meta.env?.VITE_YRKA_GATEWAY_BASE_URL as string | undefined) ||
  'https://gateway.yrka.io/v1';

const KEY_STORAGE_KEY = 'YRKA_GATEWAY_TOKEN';
const ENABLED_STORAGE_KEY = 'swarmworld_llm_agents_enabled';

const trimOrUndefined = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const getGatewayToken = (): string | undefined => {
  if (typeof localStorage !== 'undefined') {
    const stored = trimOrUndefined(localStorage.getItem(KEY_STORAGE_KEY));
    if (stored) return stored;
  }
  return trimOrUndefined(import.meta.env?.VITE_YRKA_GATEWAY_TOKEN as string | undefined);
};

export const setGatewayToken = (raw: string): boolean => {
  const token = raw.trim();
  if (!token || typeof localStorage === 'undefined') return false;
  localStorage.setItem(KEY_STORAGE_KEY, token);
  return getGatewayToken() === token;
};

export const clearGatewayToken = (): void => {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY_STORAGE_KEY);
};

export const isLlmAgentsEnabled = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(ENABLED_STORAGE_KEY) === 'true' && !!getGatewayToken();
};

export const setLlmAgentsEnabled = (enabled: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
  }
};

export interface ChatOptions {
  system: string;
  user: string;
  maxTokens?: number;
}

/** Chat completion against the gateway. Throws on transport or HTTP errors. */
export const gatewayChat = async (options: ChatOptions): Promise<string> => {
  const token = getGatewayToken();
  if (!token) throw new Error('No gateway token configured');

  const res = await fetch(`${GATEWAY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nv-z-ai-glm-5-3-flash',
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
      max_tokens: options.maxTokens ?? 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway error ${res.status}${detail ? `: ${detail.slice(0, 160)}` : ''}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Gateway returned no content');
  }
  return content;
};
