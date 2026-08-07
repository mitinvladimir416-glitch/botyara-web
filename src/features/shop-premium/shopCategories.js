import { BadgeCheck, Crown, Frame, Image as ImageIcon, Music2, Palette, Sparkle, Wand2, Zap } from "lucide-react";

// "cosmetic" = equippable, one active per slot (frame/name_color/title/badge/effect/background/music_theme).
// "consumable" = one-time effect on purchase, nothing to equip (xp).
export const CATEGORY_META = {
  frame: { label: "Рамки аватара", icon: Frame, kind: "cosmetic" },
  name_color: { label: "Стили ника", icon: Palette, kind: "cosmetic" },
  title: { label: "Титулы", icon: Crown, kind: "cosmetic" },
  badge: { label: "Бейджи", icon: BadgeCheck, kind: "cosmetic" },
  effect: { label: "Эффекты аватара", icon: Wand2, kind: "cosmetic" },
  background: { label: "Фоны профиля", icon: ImageIcon, kind: "cosmetic" },
  music_theme: { label: "Музыкальные темы", icon: Music2, kind: "cosmetic" },
  xp: { label: "Усиления XP", icon: Zap, kind: "consumable" },
};

const FALLBACK_CATEGORY = { label: "Разное", icon: Sparkle, kind: "cosmetic" };

export function categoryFor(key) {
  return CATEGORY_META[key] || FALLBACK_CATEGORY;
}

export function isConsumable(item) {
  return categoryFor(item?.category).kind === "consumable" || item?.xp_amount != null;
}

// Сверяет предмет каталога/инвентаря с текущей экипировкой пользователя
// ({ frame, name_color, title } из user.avatar_frame/name_color/badge.text).
export function isItemEquipped(item, equippedKeys) {
  if (!item || !equippedKeys) return false;
  if (item.category === "frame") return equippedKeys.frame === item.css_value;
  if (item.category === "name_color") return equippedKeys.name_color === item.css_value;
  if (item.category === "title" || item.category === "badge") return equippedKeys.title === item.badge_text;
  return false;
}
