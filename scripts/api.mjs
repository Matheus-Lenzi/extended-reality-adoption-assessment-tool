import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const host = JSON.parse(readFileSync(join(root, 'configuration/instance.json'), 'utf8')).host;

export async function apiRequest(method, route, body) {
  const key = process.env.N8N_API_KEY || '';
  if (!key) return { empty: true, reason: 'N8N_API_KEY missing — run with: node --env-file=.env …' };
  try {
    const response = await fetch(host + '/api/v1' + route, {
      method,
      headers: { 'X-N8N-API-KEY': key, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) return { empty: true, reason: method + ' ' + route + ' → ' + response.status + ' ' + (payload.message || text.slice(0, 200)) };
    return { empty: false, payload };
  } catch (error) {
    return { empty: true, reason: method + ' ' + route + ' failed: ' + (error.cause?.code || error.message) };
  }
}

export async function webhookRequest(path, query) {
  const search = query ? '?' + new URLSearchParams(query).toString() : '';
  try {
    const response = await fetch(host + '/webhook/' + path + search, { signal: AbortSignal.timeout(30000) });
    return { empty: !response.ok, status: response.status, text: await response.text() };
  } catch (error) {
    return { empty: true, status: 0, text: error.cause?.code || error.message };
  }
}
