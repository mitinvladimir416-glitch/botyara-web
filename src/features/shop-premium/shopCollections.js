import { Cpu, Disc3, Guitar, Mic2, Piano } from "lucide-react";

export const COLLECTION_META = {
  rock: { label: "Rock", icon: Guitar },
  jazz: { label: "Jazz", icon: Piano },
  pop: { label: "Pop", icon: Mic2 },
  cyber: { label: "Cyber", icon: Cpu },
};

const FALLBACK_COLLECTION = { label: "Коллекция", icon: Disc3 };

export function collectionFor(key) {
  return COLLECTION_META[key] || FALLBACK_COLLECTION;
}

// Каталог сегодня не отдаёт поле item.collection — группы будут пустой Map,
// пока бэкенд не начнёт помечать предметы тематическими коллекциями.
export function groupByCollection(items) {
  const groups = new Map();
  for (const item of items || []) {
    if (!item.collection) continue;
    if (!groups.has(item.collection)) groups.set(item.collection, []);
    groups.get(item.collection).push(item);
  }
  return groups;
}
