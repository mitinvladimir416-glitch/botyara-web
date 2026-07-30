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

  // ---- Галерея промптов ----
  publishToGallery: (favoriteId) =>
    request("/api/gallery/publish", { method: "POST", auth: true, body: { favorite_id: favoriteId } }),
  listGallery: () => request("/api/gallery", { auth: true }),
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
  sendPublicChat: (content) =>
    request("/api/public-chat", { method: "POST", auth: true, body: { content } }),
  deletePublicChatMessage: (id) => request(`/api/public-chat/${id}`, { method: "DELETE", auth: true }),
  clearPublicChat: () => request("/api/public-chat", { method: "DELETE", auth: true }),

  // ---- Геймификация ----
  toggleGalleryLike: (postId) => request(`/api/gallery/${postId}/like`, { method: "POST", auth: true }),
  listAchievements: () => request("/api/achievements", { auth: true }),
  listNotifications: () => request("/api/notifications", { auth: true }),

  // ---- Админ-панель ----
  adminStats: () => request("/api/admin/stats", { auth: true }),
  adminUsers: () => request("/api/admin/users", { auth: true }),
  adminLeaderboard: () => request("/api/admin/leaderboard", { auth: true }),
  adminActivity: () => request("/api/admin/activity", { auth: true }),
};
