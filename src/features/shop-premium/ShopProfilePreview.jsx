import { RotateCcw, Sparkles } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import { isItemEquipped } from "./shopCategories.js";

export default function ShopProfilePreview({ user, tryOnItem, onClearTryOn, onBuy, onEquip, buyingId, equippingId, statusFor, equippedKeys }) {
  const displayName = user.display_name || user.telegram_first_name || user.email?.split("@")[0] || "Ботяра";

  const isFrameTryOn = tryOnItem?.category === "frame";
  const isColorTryOn = tryOnItem?.category === "name_color";
  const isBadgeTryOn = tryOnItem?.category === "title" || tryOnItem?.category === "badge";

  const frameValue = isFrameTryOn ? tryOnItem.css_value : user.avatar_frame;
  const colorValue = isColorTryOn ? tryOnItem.css_value : user.name_color;
  const badge = isBadgeTryOn ? { text: tryOnItem.badge_text, color: tryOnItem.badge_color } : user.badge;

  const tryOnStatus = tryOnItem ? statusFor(tryOnItem.id) : null;
  const tryOnEquipped = tryOnItem ? isItemEquipped(tryOnItem, equippedKeys) : false;

  return (
    <GlassCard tone="elevated" padding="lg" className="shop-premium-preview">
      <span className="shop-premium-preview__kicker">
        <Sparkles size={13} strokeWidth={1.8} />
        {tryOnItem ? "Примерка" : "Твой образ"}
      </span>

      <div className={frameValue ? `shop-premium-preview__avatar avatar-frame avatar-frame-${frameValue}` : "shop-premium-preview__avatar"}>
        <Avatar src={user.avatar_base64} name={displayName} alt={`Аватар ${displayName}`} size="xl" shape="squircle" />
      </div>

      <strong className="shop-premium-preview__name" style={colorValue ? { color: colorValue } : undefined}>
        {displayName}
      </strong>

      {badge?.text ? (
        <Badge size="sm" style={{ color: badge.color }}>{badge.text}</Badge>
      ) : null}

      {tryOnItem ? (
        <div className="shop-premium-preview__tryon">
          <p>{tryOnItem.name}</p>
          <div className="shop-premium-preview__tryon-actions">
            {tryOnEquipped ? (
              <span className="shop-item-card__status is-equipped">Уже экипировано</span>
            ) : tryOnStatus === "fulfilled" ? (
              <PremiumButton size="sm" disabled={equippingId === tryOnItem.id} onClick={() => onEquip(tryOnItem)}>
                {equippingId === tryOnItem.id ? "…" : "Экипировать"}
              </PremiumButton>
            ) : tryOnStatus === "pending" ? (
              <span className="shop-item-card__status is-pending">Ждём оплату</span>
            ) : (
              <PremiumButton size="sm" disabled={buyingId === tryOnItem.id} onClick={() => onBuy(tryOnItem.id)}>
                {buyingId === tryOnItem.id ? "…" : `Купить за ${tryOnItem.price}₽`}
              </PremiumButton>
            )}
            <button type="button" className="shop-premium-preview__reset" onClick={onClearTryOn} title="Сбросить примерку" aria-label="Сбросить примерку">
              <RotateCcw size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      ) : (
        <p className="shop-premium-preview__hint">
          Нажми «Примерить» на любом предмете витрины — здесь появится превью, прежде чем покупать.
        </p>
      )}
    </GlassCard>
  );
}
