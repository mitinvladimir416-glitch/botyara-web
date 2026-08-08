import { useState } from "react";
import { ChevronDown, Crown, Sparkles, Wand2, Zap } from "lucide-react";
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

function FrameGroup({ tierKey, items, statusFor, purchasesEnabled, buyingId, onBuy, onTryOn }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TIER_META[tierKey];
  const hasMore = items.length > PREVIEW_COUNT;
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);

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

      <div className="shop-premium-grid">
        {visible.map((item, index) => (
          <ShopItemCard
            key={item.id}
            item={item}
            index={index}
            mode="showcase"
            status={statusFor(item.id)}
            purchasesEnabled={purchasesEnabled}
            busy={buyingId === item.id}
            onBuy={onBuy}
            onTryOn={onTryOn}
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
    </section>
  );
}

export default function ShopFrameGroups({ items, statusFor, purchasesEnabled, buyingId, onBuy, onTryOn }) {
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

  return (
    <div className="shop-frame-groups">
      {populatedTiers.map((tierKey) => (
        <FrameGroup
          key={tierKey}
          tierKey={tierKey}
          items={groups.get(tierKey)}
          statusFor={statusFor}
          purchasesEnabled={purchasesEnabled}
          buyingId={buyingId}
          onBuy={onBuy}
          onTryOn={onTryOn}
        />
      ))}
    </div>
  );
}
