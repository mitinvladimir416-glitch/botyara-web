// Лёгкий in-memory кэш userId -> avatar_frame, без сети и без localStorage.
// Наполняется попутно, когда где-то в приложении приходит ПОЛНЫЙ объект
// пользователя (свой /api/me, PublicProfileModal, списки в админке). Читается
// как fallback там, где backend отдаёт только облегчённый author-срез
// (Gallery/Chat/Rooms) и может ещё не включать author_avatar_frame. Реальное
// поле с бэкенда, если оно есть, всегда в приоритете — кэш только подстраховка.
const cache = new Map();

export function rememberAuthorFrame(userId, frame) {
  if (userId == null) return;
  if (frame) cache.set(userId, frame);
  else cache.delete(userId);
}

export function getKnownAuthorFrame(userId) {
  if (userId == null) return null;
  return cache.get(userId) || null;
}
