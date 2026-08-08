import { CheckCircle2, Clock3, Eye, Zap } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import { categoryFor, isConsumable } from "./shopCategories.js";

function ItemPreview({ item }) {
  const meta = categoryFor(item.category);

  if (item.category === "frame") {
    return (
      <span className="shop-item-swatch shop-item-swatch--frame">
        <AvatarFrame frame={item.css_value}>
          <Avatar name={item.name} size="sm" shape="circle" />
        </AvatarFrame>
      </span>
    );
  }

  if (item.category === "name_color") {
    return (
      <span className="shop-item-swatch shop-item-swatch--text" style={{ color: item.css_value }}>
        Ботяра
      </span>
    );
  }

  if (item.category === "title" || item.category === "badge") {
    return (
      <span className="shop-item-swatch shop-item-swatch--badge" style={{ color: item.badge_color, borderColor: item.badge_color }}>
        {item.badge_text || item.name}
      </span>
    );
  }

  if (isConsumable(item)) {
    return (
      <span className="shop-item-swatch shop-item-swatch--xp">
        <Zap size={18} strokeWidth={1.8} />
        {item.xp_amount ? `+${item.xp_amount}` : null}
      </span>
    );
  }

  const Icon = meta.icon;
  return (
    <span className="shop-item-swatch shop-item-swatch--generic">
      <Icon size={20} strokeWidth={1.7} />
    </span>
  );
}

export default function ShopItemCard({
  item,
  mode = "showcase",
  status,
  isEquipped,
  purchasesEnabled,
  busy,
  onBuy,
  onEquip,
  onTryOn,
  index = 0,
}) {
  const meta = categoryFor(item.category);
  const consumable = isConsumable(item);

  return (
    <article className="shop-item-card" style={{ "--card-index": index }}>
      <div className="shop-item-card__head">
        <span className="shop-item-card__category">
          <meta.icon size={13} strokeWidth={1.8} />
          {meta.label}
        </span>
        {item.discount_percent > 0 && <span className="shop-item-card__discount">-{item.discount_percent}%</span>}
      </div>

      <ItemPreview item={item} />

      <div className="shop-item-card__info">
        <strong>{item.name}</strong>
        <div className="shop-item-card__price">
          <span>{item.price}₽</span>
          {item.original_price ? <s>{item.original_price}₽</s> : null}
        </div>
      </div>

      <footer className="shop-item-card__footer">
        {mode === "showcase" ? (
          <>
            {!consumable && (
              <button type="button" className="shop-item-card__tryon" onClick={() => onTryOn(item)} title="Примерить">
                <Eye size={15} strokeWidth={1.8} />
              </button>
            )}
            {status === "fulfilled" ? (
              <span className="shop-item-card__status is-owned">
                <CheckCircle2 size={14} strokeWidth={1.8} />
                Куплено
              </span>
            ) : status === "pending" ? (
              <span className="shop-item-card__status is-pending">
                <Clock3 size={14} strokeWidth={1.8} />
                Ждём оплату
              </span>
            ) : (
              <PremiumButton
                size="sm"
                variant="secondary"
                disabled={busy || purchasesEnabled === false}
                onClick={() => onBuy(item.id)}
              >
                {busy ? "…" : "Купить"}
              </PremiumButton>
            )}
          </>
        ) : (
          <>
            <button type="button" className="shop-item-card__tryon" onClick={() => onTryOn(item)} title="Примерить">
              <Eye size={15} strokeWidth={1.8} />
            </button>
            {isEquipped ? (
              <span className="shop-item-card__status is-equipped">
                <CheckCircle2 size={14} strokeWidth={1.8} />
                Экипировано
              </span>
            ) : (
              <PremiumButton size="sm" disabled={busy} onClick={() => onEquip(item)}>
                {busy ? "…" : "Экипировать"}
              </PremiumButton>
            )}
          </>
        )}
      </footer>
    </article>
  );
}
