import { KEYS } from './data.js';

const DEFAULTS = {
  provider: 'groq',
  apiBase: 'https://api.groq.com/openai/v1',
  openaiKey: '',
  openaiModel: 'llama-3.3-70b-versatile',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:3b',
  ollamaModels: [],
  useVision: false
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEYS.dsSettings);
    if (raw) {
      const saved = JSON.parse(raw);
      const merged = Object.assign({}, DEFAULTS, saved);
      if (!saved.provider && saved.apiBase && saved.apiBase.includes('11434')) {
        merged.provider = 'ollama';
        merged.ollamaUrl = saved.apiBase;
      }
      return merged;
    }
  } catch (e) {}
  return Object.assign({}, DEFAULTS);
}

export function saveSettings(settings) {
  try { localStorage.setItem(KEYS.dsSettings, JSON.stringify(settings)); } catch (e) {}
}

export function hasApi(settings) {
  return !!(settings.openaiKey || (settings.provider === 'ollama' && settings.ollamaUrl));
}

export function hasApiKey(settings) {
  return !!(settings.openaiKey);
}

export function isRateLimitError(err) {
  if (!err || !err.message) return false;
  const m = err.message.toLowerCase();
  return m.includes('429') || m.includes('rate') || m.includes('limit') || m.includes('quota') || m.includes('exceeded') || m.includes('tokens per');
}

async function callGroq(messages, settings, opts) {
  const base = (settings.apiBase || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opts.timeout || 60000);
  try {
    const resp = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + settings.openaiKey },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: settings.openaiModel || 'llama-3.3-70b-versatile',
        messages,
        max_tokens: opts.maxTokens || 4096,
        temperature: opts.temperature ?? 0.3
      })
    });
    if (!resp.ok) { const e = await resp.text().catch(() => ''); throw new Error('API error ' + resp.status + ': ' + e.slice(0, 200)); }
    const j = await resp.json();
    return j.choices?.[0]?.message?.content || '';
  } finally { clearTimeout(timeout); }
}

async function callOllama(messages, settings, opts) {
  const url = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/+$/, '');
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opts.timeout || 120000);
  try {
    const resp = await fetch(url + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: settings.ollamaModel || 'qwen2.5:3b',
        messages,
        stream: false,
        options: { num_predict: opts.maxTokens || 4096, temperature: opts.temperature ?? 0.3 }
      })
    });
    if (!resp.ok) throw new Error('Ollama error ' + resp.status);
    const j = await resp.json();
    return j.message?.content || '';
  } finally { clearTimeout(timeout); }
}

export async function callAI(messages, settings, opts) {
  opts = opts || {};
  if (settings.provider === 'ollama') {
    return callOllama(messages, settings, opts);
  }
  try {
    return await callGroq(messages, settings, opts);
  } catch (groqErr) {
    if (isRateLimitError(groqErr)) {
      return callOllama(messages, settings, opts);
    }
    throw groqErr;
  }
}

window.aiService = { loadSettings, saveSettings, hasApi, hasApiKey, callAI, isRateLimitError };
