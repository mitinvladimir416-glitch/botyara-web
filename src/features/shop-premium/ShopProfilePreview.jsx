import { ArrowRight, RotateCcw, Sparkles, XCircle } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import { APPEARANCE_CATEGORY_CONFIG } from "./useAppearancePreview.js";

// "Примерочная" — единственное место в Shop Premium, где реально вызываются
// shopPurchase/shopEquip. Карточки каталога только выставляют preview
// (appearance.previewItem) — сюда же сходится Buy/Apply для рамки, цвета
// ника и титула одновременно, каждое поле независимо.
export default function ShopProfilePreview({ user, appearance, statusFor, buyingId, onBuy }) {
  const { preview, equipped, sources, isPreviewingAny, resetField, apply, pending, errors, previewClear } = appearance;
  const displayName = user.display_name || user.telegram_first_name || user.email?.split("@")[0] || "Ботяра";

  return (
    <GlassCard tone="elevated" padding="lg" className="shop-premium-preview">
      <span className="shop-premium-preview__kicker">
        <Sparkles size={13} strokeWidth={1.8} />
        Примерочная
      </span>

      {isPreviewingAny && (
        <div className="shop-premium-preview__compare">
          <div className="shop-premium-preview__compare-before">
            <AvatarFrame frame={equipped.avatar_frame}>
              <Avatar src={user.avatar_base64} name={displayName} alt="Текущий образ" size="sm" shape="squircle" />
            </AvatarFrame>
            <small>Сейчас</small>
          </div>
          <ArrowRight size={16} className="shop-premium-preview__compare-arrow" aria-hidden="true" />
          <span className="shop-premium-preview__compare-label">Примерка</span>
        </div>
      )}

      <div className="shop-premium-preview__avatar">
        <AvatarFrame frame={preview.avatar_frame}>
          <Avatar src={user.avatar_base64} name={displayName} alt={`Аватар ${displayName}`} size="xl" shape="squircle" />
        </AvatarFrame>
      </div>

      <strong className="shop-premium-preview__name" style={preview.name_color ? { color: preview.name_color } : undefined}>
        {displayName}
      </strong>

      {typeof user.level === "number" && <span className="shop-premium-preview__level">Уровень {user.level}</span>}

      {preview.title?.text ? (
        <Badge size="sm" style={{ color: preview.title.color }}>{preview.title.text}</Badge>
      ) : null}

      {preview.avatar_frame && (
        <button
          type="button"
          className="shop-premium-preview__no-frame"
          onClick={() => previewClear("avatar_frame", "frame")}
        >
          <XCircle size={13} strokeWidth={1.8} />
          Без рамки
        </button>
      )}

      {isPreviewingAny ? (
        <div className="shop-premium-preview__actions">
          {Object.entries(sources).map(([field, source]) => {
            const config = Object.values(APPEARANCE_CATEGORY_CONFIG).find((c) => c.field === field);
            const busy = Boolean(pending[source.category]);
            const error = errors[source.category];
            const purchaseStatus = source.id != null ? statusFor(source.id) : "fulfilled";

            return (
              <div className="shop-premium-preview__action-row" key={field}>
                <span className="shop-premium-preview__action-label">
                  {config?.label}: <b>{source.name}</b>
                </span>
                <div className="shop-premium-preview__action-buttons">
                  {purchaseStatus === "fulfilled" ? (
                    <PremiumButton size="sm" disabled={busy} onClick={() => apply(source)}>
                      {busy ? "…" : source.isClear ? "Применить без рамки" : "Применить"}
                    </PremiumButton>
                  ) : purchaseStatus === "pending" ? (
                    <span className="shop-item-card__status is-pending">Ждём оплату</span>
                  ) : (
                    <PremiumButton size="sm" variant="secondary" disabled={buyingId === source.id} onClick={() => onBuy(source.id)}>
                      {buyingId === source.id ? "…" : `Купить за ${source.price}₽`}
                    </PremiumButton>
                  )}
                  <button
                    type="button"
                    className="shop-premium-preview__reset"
                    onClick={() => resetField(field)}
                    title="Вернуть текущее оформление"
                    aria-label="Вернуть текущее оформление"
                  >
                    <RotateCcw size={14} strokeWidth={1.8} />
                  </button>
                </div>
                {error && <p className="shop-premium-preview__error">{error}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="shop-premium-preview__hint">
          Нажми на любую карточку витрины — здесь появится примерка, прежде чем покупать или применять.
        </p>
      )}
    </GlassCard>
  );
}
