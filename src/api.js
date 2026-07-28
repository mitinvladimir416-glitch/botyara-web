// Адрес бэкенда — тот самый API на Timeweb (регион Амстердам).
// Когда появится собственный поддомен для API (например api.botyara.ru),
// достаточно будет поменять только эту строку.
const API_BASE = "https://mitinvladimir416-glitch-botyara-api-e748.twc1.net";

const TOKEN_KEY = "botyara_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // тело может быть пустым — это нормально для некоторых ответов
  }

  if (!response.ok) {
    const detail =
      (data && (data.detail || data.message)) || `Ошибка запроса (код ${response.status})`;
    const message = typeof detail === "string" ? detail : JSON.stringify(detail);
    throw new Error(message);
  }

  return data;
}

export const api = {
  // ---- AI ----
  chat: (history) => request("/api/chat", { method: "POST", auth: true, body: { history } }),
  history: () => request("/api/history", { auth: true }),
  translate: (text, target_lang) =>
    request("/api/translate", { method: "POST", body: { text, target_lang } }),
  promptTopics: () => request("/api/prompt/topics"),
  prompt: (topic, target, history) =>
    request("/api/prompt", { method: "POST", body: { topic, target, history } }),
  promptImageFromPhoto: (file, desiredChange) => {
    const form = new FormData();
    form.append("photo", file);
    form.append("desired_change", desiredChange);
    return request("/api/prompt/image-from-photo", { method: "POST", body: form, isForm: true });
  },
  coverFormats: () => request("/api/cover/formats"),
  cover: (payload) => request("/api/cover", { method: "POST", body: payload }),

  // ---- Авторизация ----
  register: (email, password) =>
    request("/api/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  telegramLogin: (telegramData) =>
    request("/api/auth/telegram", { method: "POST", body: telegramData }),
  me: () => request("/api/me", { auth: true }),

  // ---- Избранное ----
  listFavorites: () => request("/api/favorites", { auth: true }),
  addFavorite: (content) =>
    request("/api/favorites", { method: "POST", auth: true, body: { content } }),
  deleteFavorite: (id) => request(`/api/favorites/${id}`, { method: "DELETE", auth: true }),
  clearFavorites: () => request("/api/favorites", { method: "DELETE", auth: true }),
};
