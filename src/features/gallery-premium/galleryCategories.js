import { Clapperboard, Disc3, Image as ImageIcon, Music4, Sparkles } from "lucide-react";

export const CATEGORY_META = {
  suno: { label: "Suno", icon: Music4 },
  image: { label: "Картинка", icon: ImageIcon },
  video: { label: "Видео", icon: Clapperboard },
  cover: { label: "Обложка трека", icon: Disc3 },
  other: { label: "Разное", icon: Sparkles },
};

export function categoryFor(key) {
  return CATEGORY_META[key] || CATEGORY_META.other;
}

export function totalReactions(post) {
  return Object.values(post?.reactions || {}).reduce((sum, count) => sum + count, 0);
}
