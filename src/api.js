// Адрес бэкенда — тот самый API на Timeweb (регион Амстердам).
// Когда появится собственный поддомен для API (например api.botyara.ru),
// достаточно будет поменять только эту строку.
const DEFAULT_API_BASE = "https://mitinvladimir416-glitch-botyara-api-e748.twc1.net";
const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).trim();
const parsedApiBase = new URL(configuredApiBase);
if (!/^https?:$/.test(parsedApiBase.protocol)) {
  throw new Error("VITE_API_BASE_URL must use http or https");
}
const REMOTE_API_BASE = parsedApiBase.href.replace(/\/$/, "");

// Browser development uses the Vite same-origin proxy because the production
// backend does not allow localhost in its CORS policy. Production calls the
// backend directly.
const API_BASE = import.meta.env.DEV ? "" : REMOTE_API_BASE;

export const WS_BASE = REMOTE_API_BASE.replace(/^http/, "ws");
export const SHARE_BASE = REMOTE_API_BASE;

const TOKEN_KEY = "botyara_token";

function sanitizeForDevLog(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeForDevLog);

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => {
      if (/token|password|secret/i.test(key)) return [key, "[redacted]"];
      return [key, sanitizeForDevLog(nestedValue)];
    })
  );
}

function logDevResponse({ method, url, backendUrl, status, data }) {
  if (!import.meta.env.DEV) return;
  console.groupCollapsed(`[API] ${method} ${url} -> ${status}`);
  console.info("Request URL:", url);
  console.info("Backend URL:", backendUrl);
  console.info("Status:", status);
  console.info("Response:", sanitizeForDevLog(data));
  console.groupEnd();
}

function logDevFetchError({ method, url, backendUrl, error }) {
  if (!import.meta.env.DEV) return;
  console.error(`[API] ${method} ${url} fetch failed`, {
    backendUrl,
    error,
  });
}

export function getToken() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) return token;
  const legacyToken = localStorage.getItem(TOKEN_KEY);
  if (legacyToken) {
    sessionStorage.setItem(TOKEN_KEY, legacyToken);
    localStorage.removeItem(TOKEN_KEY);
  }
  return legacyToken;
}

export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const url = `${API_BASE}${path}`;
  const backendUrl = `${REMOTE_API_BASE}${path}`;
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (fetchError) {
    logDevFetchError({ method, url, backendUrl, error: fetchError });
    const error = new Error("Не удалось соединиться с сервером. Проверьте подключение и повторите попытку.");
    error.code = "NETWORK_ERROR";
    error.url = url;
    error.cause = fetchError;
    throw error;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // тело может быть пустым — это нормально для некоторых ответов
  }

  logDevResponse({ method, url, backendUrl, status: response.status, data });

  if (!response.ok) {
    const detail =
      (data && (data.detail || data.message)) || `Ошибка запроса (код ${response.status})`;
    const message = typeof detail === "string" ? detail : JSON.stringify(detail);
    const error = new Error(message);
    error.status = response.status;
    error.url = url;
    error.body = data;
    throw error;

  }

  return data;
}

export const api = {
  // ---- AI ----
  chat: (history, role) => request("/api/chat", { method: "POST", auth: true, body: { history, role } }),
  history: (persona) =>
    request(`/api/history${persona ? `?persona=${encodeURIComponent(persona)}` : ""}`, { auth: true }),
  clearHistory: (persona) =>
    request(`/api/history${persona ? `?persona=${encodeURIComponent(persona)}` : ""}`, {
      method: "DELETE",
      auth: true,
    }),
  chatRoles: () => request("/api/chat/roles"),
  translate: (text, target_lang) =>
    request("/api/translate", { method: "POST", body: { text, target_lang } }),
  promptTopics: () => request("/api/prompt/topics"),
  prompt: (topic, target, history) =>
    request("/api/prompt", { method: "POST", body: { topic, target, history } }),
  improvePrompt: (topic, target, draft) =>
    request("/api/prompt/improve", { method: "POST", body: { topic, target, draft } }),
  promptImageFromPhoto: (file, desiredChange) => {
    const form = new FormData();
    form.append("photo", file);
    form.append("desired_change", desiredChange);
    return request("/api/prompt/image-from-photo", { method: "POST", body: form, isForm: true });
  },
  promptVideoFrames: (target, description, firstFrameFile, lastFrameFile) => {
    const form = new FormData();
    form.append("target", target || "");
    form.append("description", description || "");
    if (firstFrameFile) form.append("first_frame", firstFrameFile);
    if (lastFrameFile) form.append("last_frame", lastFrameFile);
    return request("/api/prompt/video-frames", { method: "POST", body: form, isForm: true });
  },
  transcribeVoice: (blob) => {
    const form = new FormData();
    form.append("audio", blob, "voice.webm");
    return request("/api/voice-transcribe", { method: "POST", auth: true, body: form, isForm: true });
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
  startBotLogin: () => request("/api/auth/telegram/start", { method: "POST" }),
  pollBotLogin: (token) => request(`/api/auth/telegram/poll?token=${encodeURIComponent(token)}`),
  restoreSession: () => request("/api/auth/session", { method: "POST" }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/me", { auth: true }),
  linkEmail: (email, password) =>
    request("/api/me/link-email", { method: "POST", auth: true, body: { email, password } }),
  changePassword: (currentPassword, newPassword) =>
    request("/api/me/change-password", {
      method: "POST",
      auth: true,
      body: { current_password: currentPassword, new_password: newPassword },
    }),

  // ---- Избранное ----
  listFavorites: () => request("/api/favorites", { auth: true }),
  addFavorite: (content, category = "other") =>
    request("/api/favorites", { method: "POST", auth: true, body: { content, category } }),
  deleteFavorite: (id) => request(`/api/favorites/${id}`, { method: "DELETE", auth: true }),
  clearFavorites: () => request("/api/favorites", { method: "DELETE", auth: true }),

  // ---- Оповещения об обновлениях ----
  listAnnouncements: () => request("/api/announcements", { auth: true }),
  postAnnouncement: (content, aiPolish) =>
    request("/api/admin/announcements", { method: "POST", auth: true, body: { content, ai_polish: aiPolish } }),

  // ---- Галерея промптов ----
  publishToGallery: (favoriteId) =>
    request("/api/gallery/publish", { method: "POST", auth: true, body: { favorite_id: favoriteId } }),
  listGallery: (q) => request(`/api/gallery${q ? `?q=${encodeURIComponent(q)}` : ""}`, { auth: true }),
  getGalleryPost: (id) => request(`/api/gallery/${id}`, { auth: true }),
  addGalleryComment: (id, content) =>
    request(`/api/gallery/${id}/comments`, { method: "POST", auth: true, body: { content } }),
  deleteGalleryPost: (id) => request(`/api/gallery/${id}`, { method: "DELETE", auth: true }),
  deleteGalleryComment: (postId, commentId) =>
    request(`/api/gallery/${postId}/comments/${commentId}`, { method: "DELETE", auth: true }),

  // ---- Профиль ----
  updateProfile: (displayName, avatarFile) => {
    const form = new FormData();
    form.append("display_name", displayName || "");
    if (avatarFile) form.append("avatar", avatarFile);
    return request("/api/me/profile", { method: "POST", auth: true, body: form, isForm: true });
  },

  // ---- Общий чат ----
  listPublicChat: () => request("/api/public-chat", { auth: true }),
  sendPublicChat: (content, replyToId) =>
    request("/api/public-chat", { method: "POST", auth: true, body: { content, reply_to_id: replyToId || null } }),
  deletePublicChatMessage: (id) => request(`/api/public-chat/${id}`, { method: "DELETE", auth: true }),
  clearPublicChat: () => request("/api/public-chat", { method: "DELETE", auth: true }),
  reactToPublicChatMessage: (id, emoji) =>
    request(`/api/public-chat/${id}/react`, { method: "POST", auth: true, body: { emoji } }),
  pinPublicChatMessage: (id) => request(`/api/public-chat/${id}/pin`, { method: "POST", auth: true }),
  searchPublicChat: (q) => request(`/api/public-chat/search?q=${encodeURIComponent(q)}`, { auth: true }),
  getPublicChatContext: (id) => request(`/api/public-chat/context/${id}`, { auth: true }),

  // ---- Геймификация ----
  reactToGalleryPost: (postId, emoji) =>
    request(`/api/gallery/${postId}/react`, { method: "POST", auth: true, body: { emoji } }),
  getPublicGalleryPost: (postId) => request(`/api/public/gallery/${postId}`),
  listAchievements: () => request("/api/achievements", { auth: true }),
  listNotifications: () => request("/api/notifications", { auth: true }),
  clearNotifications: () => request("/api/notifications", { method: "DELETE", auth: true }),

  // ---- Shop ----
  shopCatalog: () => request("/api/shop/catalog"),
  shopInventory: () => request("/api/shop/inventory", { auth: true }),
  shopMyPurchases: () => request("/api/shop/my-purchases", { auth: true }),
  shopPurchase: (key) =>
    request("/api/shop/purchase", {
      method: "POST",
      auth: true,
      body: key.startsWith("premium_") ? { plan: key } : { item_key: key },
    }),
  shopEquip: (category, shopItemId) =>
    request("/api/shop/equip", { method: "POST", auth: true, body: { category, shop_item_id: shopItemId } }),

  // ---- Админ-панель ----
  adminStats: () => request("/api/admin/stats", { auth: true }),
  adminUsers: () => request("/api/admin/users", { auth: true }),
  adminLeaderboard: () => request("/api/admin/leaderboard", { auth: true }),
  adminActivity: () => request("/api/admin/activity", { auth: true }),
  adminSearchUsers: (q) => request(`/api/admin/users/search?q=${encodeURIComponent(q || "")}`, { auth: true }),
  adminUpdateUser: (userId, patch) =>
    request(`/api/admin/users/${userId}`, { method: "PATCH", auth: true, body: patch }),
  adminShopPurchases: (status = "pending") =>
    request(`/api/admin/shop/purchases?status=${encodeURIComponent(status)}`, { auth: true }),
  adminFulfillPurchase: (id) =>
    request(`/api/admin/shop/purchases/${id}/fulfill`, { method: "POST", auth: true }),
  adminCancelPurchase: (id) =>
    request(`/api/admin/shop/purchases/${id}/cancel`, { method: "POST", auth: true }),

  // ---- Совместные комнаты ----
  createRoom: (category) => request("/api/rooms", { method: "POST", auth: true, body: { category } }),
  joinRoom: (code) => request("/api/rooms/join", { method: "POST", auth: true, body: { code } }),
  getRoom: (code) => request(`/api/rooms/${code}`, { auth: true }),
  sendRoomMessage: (code, content, channel = "ai") =>
    request(`/api/rooms/${code}/messages`, { method: "POST", auth: true, body: { content, channel } }),
  finishRoom: (code) => request(`/api/rooms/${code}/finish`, { method: "POST", auth: true }),
  pingRoomTyping: (code) => request(`/api/rooms/${code}/typing`, { method: "POST", auth: true }),
  getPublicProfile: (userId) => request(`/api/users/${userId}/public`, { auth: true }),
  listMyRooms: () => request("/api/rooms", { auth: true }),
  deleteRoom: (code) => request(`/api/rooms/${code}`, { method: "DELETE", auth: true }),
};
