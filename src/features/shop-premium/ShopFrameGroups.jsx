import { useState } from "react";
import { ChevronDown, Crown, LayoutGrid, Sparkles, Wand2, Zap } from "lucide-react";
import ShopItemCard from "./ShopItemCard.jsx";

// Рамки — самая большая категория каталога (47+ штук), поэтому внутри неё
// нужна структура, а не единая стена карточек. Тир считается на фронте по
// уже существующим полям (price, css_value) — ничего не меняет в каталоге,
// item_id и цены не трогает, ничего не переименовывает.
const TIER_META = {
  basic: { label: "Базовые", icon: Sparkles, hint: "Стартовые рамки на любой вкус" },
  premium: { label: "Premium", icon: Zap, hint: "Ярче и заметнее" },
  animated: { label: "Анимированные", icon: Wand2, hint: "Рамка в движении" },
  exclusive: { label: "Exclusive", icon: Crown, hint: "Самые редкие и дорогие" },
};
const TIER_ORDER = ["basic", "premium", "animated", "exclusive"];
const PREVIEW_COUNT = 6;

// Значения css_value, у которых есть animation в App.css (frameShift / frameNeonPulse).
const ANIMATED_FRAMES = new Set([
  "rainbow", "stardust", "crystal", "music-electronic",
  "level-creator", "level-ai-explorer", "level-pioneer", "level-master", "level-visionary", "level-legend", "level-ai-lord",
  "neon-magenta-square", "neon-magenta-round", "neon-cyan-square", "neon-danger", "neon-cyan-round",
  "neon-violet-square", "neon-pink-square", "neon-orange-round", "neon-toxic", "neon-blue-square",
  "neon", "ice", "galaxy", "legend",
]);

export function frameTier(item) {
  const price = item.price || 0;
  if (price >= 90) return "exclusive";
  if (ANIMATED_FRAMES.has(item.css_value)) return "animated";
  if (price >= 45) return "premium";
  return "basic";
}

function FrameCards({ items, forceShowAll, statusFor, appearance, purchasesEnabled }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = !forceShowAll && items.length > PREVIEW_COUNT;
  const visible = forceShowAll || expanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="shop-premium-grid">
        {visible.map((item, index) => (
          <ShopItemCard
            key={item.id}
            item={item}
            index={index}
            mode="showcase"
            status={statusFor(item.id)}
            isEquipped={appearance.isItemEquipped(item)}
            isPreviewing={appearance.isItemPreviewing(item)}
            purchasesEnabled={purchasesEnabled}
            onPreview={appearance.previewItem}
          />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          className={expanded ? "shop-frame-group__toggle is-open" : "shop-frame-group__toggle"}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Свернуть" : `Показать все (${items.length})`}
          <ChevronDown size={14} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
    </>
  );
}

function FrameGroup({ tierKey, items, ...rest }) {
  const meta = TIER_META[tierKey];
  return (
    <section className="shop-frame-group">
      <header className="shop-frame-group__head">
        <span className="shop-frame-group__title">
          <meta.icon size={15} strokeWidth={1.8} aria-hidden="true" />
          {meta.label}
          <span className="shop-frame-group__count">{items.length}</span>
        </span>
        <span className="shop-frame-group__hint">{meta.hint}</span>
      </header>
      <FrameCards items={items} {...rest} />
    </section>
  );
}

export default function ShopFrameGroups({ items, activeTier, onTierChange, statusFor, appearance, purchasesEnabled }) {
  const groups = new Map();
  for (const item of items) {
    const tier = frameTier(item);
    if (!groups.has(tier)) groups.set(tier, []);
    groups.get(tier).push(item);
  }

  const populatedTiers = TIER_ORDER.filter((tier) => groups.has(tier));

  if (populatedTiers.length === 0) {
    return null;
  }

  const tiersToRender = activeTier ? [activeTier].filter((tier) => groups.has(tier)) : populatedTiers;

  return (
    <div className="shop-frame-groups">
      <div className="shop-premium-filters shop-tier-nav" role="tablist" aria-label="Категории рамок">
        <button
          type="button"
          role="tab"
          aria-selected={!activeTier}
          className={!activeTier ? "is-active" : ""}
          onClick={() => onTierChange(null)}
        >
          <LayoutGrid size={14} strokeWidth={1.8} aria-hidden="true" />
          Все <span>{items.length}</span>
        </button>
        {populatedTiers.map((tierKey) => {
          const meta = TIER_META[tierKey];
          return (
            <button
              key={tierKey}
              type="button"
              role="tab"
              aria-selected={activeTier === tierKey}
              className={activeTier === tierKey ? "is-active" : ""}
              onClick={() => onTierChange(tierKey)}
            >
              <meta.icon size={14} strokeWidth={1.8} aria-hidden="true" />
              {meta.label} <span>{groups.get(tierKey).length}</span>
            </button>
          );
        })}
      </div>

      {tiersToRender.map((tierKey) => (
        <FrameGroup
          key={tierKey}
          tierKey={tierKey}
          items={groups.get(tierKey)}
          forceShowAll={Boolean(activeTier)}
          statusFor={statusFor}
          appearance={appearance}
          purchasesEnabled={purchasesEnabled}
        />
      ))}
    </div>
  );
}
