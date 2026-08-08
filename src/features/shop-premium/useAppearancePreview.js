import { useCallback, useMemo, useState } from "react";
import { api } from "../../api.js";

// Единая модель "примерочной": preview state (только локально, без сети) +
// equipped state (источник истины — user с бэкенда) + apply (существующий
// shopEquip). Используется и в Shop Premium, и в ProfileStyleCard — второй
// независимый механизм экипировки не нужен.
//
// Ключи preview/equipped совпадают с полями user (avatar_frame, name_color,
// title...), а не с shop-категориями (frame, name_color, title...) — так при
// появлении новых бэкенд-категорий (avatar_glow, avatar_shine, avatar_effect)
// достаточно дописать одну строку в APPEARANCE_CATEGORY_CONFIG, не переписывая
// хук и компоненты примерочной.
export const APPEARANCE_CATEGORY_CONFIG = {
  frame: {
    field: "avatar_frame",
    label: "Рамка",
    valueFromItem: (item) => item.css_value,
    equals: (a, b) => (a || null) === (b || null),
  },
  name_color: {
    field: "name_color",
    label: "Цвет ника",
    valueFromItem: (item) => item.css_value,
    equals: (a, b) => (a || null) === (b || null),
  },
  title: {
    field: "title",
    label: "Титул",
    valueFromItem: (item) => ({ text: item.badge_text, color: item.badge_color }),
    equals: (a, b) => (a?.text || null) === (b?.text || null),
  },
};

export function useAppearancePreview(user, onUserUpdate) {
  const [overrides, setOverrides] = useState({}); // { [field]: value } — для рендера
  const [sources, setSources] = useState({}); // { [field]: item-like } — для Купить/Применить в панели
  const [pending, setPending] = useState({});
  const [errors, setErrors] = useState({});

  const equipped = useMemo(
    () => ({
      avatar_frame: user?.avatar_frame || null,
      name_color: user?.name_color || null,
      title: user?.badge?.text ? { text: user.badge.text, color: user.badge.color } : null,
    }),
    [user]
  );

  const preview = useMemo(() => ({ ...equipped, ...overrides }), [equipped, overrides]);

  const previewItem = useCallback((item) => {
    const config = APPEARANCE_CATEGORY_CONFIG[item.category];
    if (!config) return;
    setOverrides((prev) => ({ ...prev, [config.field]: config.valueFromItem(item) }));
    setSources((prev) => ({ ...prev, [config.field]: item }));
  }, []);

  // "Без рамки" и аналоги — примерка пустого значения без привязки к товару.
  const previewClear = useCallback((field, category) => {
    setOverrides((prev) => ({ ...prev, [field]: null }));
    setSources((prev) => ({ ...prev, [field]: { category, id: null, price: 0, name: "Без оформления", isClear: true } }));
  }, []);

  const resetField = useCallback((field) => {
    setOverrides((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSources((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOverrides({});
    setSources({});
  }, []);

  const isFieldPreviewing = useCallback((field) => field in overrides, [overrides]);
  const isPreviewingAny = Object.keys(overrides).length > 0;

  const isItemEquipped = useCallback(
    (item) => {
      const config = APPEARANCE_CATEGORY_CONFIG[item.category];
      if (!config) return false;
      return config.equals(equipped[config.field], config.valueFromItem(item));
    },
    [equipped]
  );

  const isItemPreviewing = useCallback(
    (item) => {
      const config = APPEARANCE_CATEGORY_CONFIG[item.category];
      if (!config || !(config.field in overrides)) return false;
      return config.equals(preview[config.field], config.valueFromItem(item));
    },
    [overrides, preview]
  );

  // Принимает "item-like" объект напрямую (а не читает sources из state),
  // чтобы previewItem(item) + apply(item) можно было вызвать подряд в один
  // тик без риска словить protokoл устаревшего замыкания над ещё не
  // обновившимся state.
  const apply = useCallback(
    async (item) => {
      const config = APPEARANCE_CATEGORY_CONFIG[item.category];
      const category = item.category;
      const shopItemId = item.isClear ? null : item.id;
      setPending((p) => ({ ...p, [category]: true }));
      setErrors((e) => ({ ...e, [category]: "" }));
      try {
        await api.shopEquip(category, shopItemId);
        const updated = await api.me();
        onUserUpdate?.(updated);
        if (config) resetField(config.field);
      } catch (error) {
        setErrors((e) => ({ ...e, [category]: error.message || "Не удалось применить" }));
      } finally {
        setPending((p) => ({ ...p, [category]: false }));
      }
    },
    [onUserUpdate, resetField]
  );

  return {
    equipped,
    preview,
    sources,
    previewItem,
    previewClear,
    resetField,
    resetAll,
    isFieldPreviewing,
    isPreviewingAny,
    isItemEquipped,
    isItemPreviewing,
    apply,
    pending,
    errors,
  };
}
