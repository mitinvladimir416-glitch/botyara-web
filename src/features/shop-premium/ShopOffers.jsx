import { Gem, Package } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

function formatDays(days) {
  if (!days) return "";
  if (days % 365 === 0) return `${days / 365} ${days === 365 ? "год" : "года"}`;
  if (days % 30 === 0) return `${days / 30} мес.`;
  return `${days} дн.`;
}

export default function ShopOffers({ packages, plans, purchasesEnabled, statusFor, buyingId, onBuy }) {
  const planEntries = Object.entries(plans || {});
  const packageEntries = Object.entries(packages || {});

  if (!planEntries.length && !packageEntries.length) return null;

  return (
    <div className="shop-premium-offers">
      {planEntries.map(([planKey, plan]) => (
        <GlassCard key={planKey} tone="accent" padding="md" className="shop-offer-card">
          <span className="shop-offer-card__kicker">
            <Gem size={13} strokeWidth={1.8} />
            Подписка
          </span>
          <strong>{plan.name}</strong>
          <p>{formatDays(plan.days)} премиума BOTYARA</p>
          <div className="shop-offer-card__foot">
            <span className="shop-offer-card__price">{plan.price}₽</span>
            <PremiumButton
              size="sm"
              disabled={buyingId === planKey || purchasesEnabled === false}
              onClick={() => onBuy(planKey)}
            >
              {buyingId === planKey ? "…" : "Оформить"}
            </PremiumButton>
          </div>
        </GlassCard>
      ))}

      {packageEntries.map(([packageKey, pkg]) => {
        const purchaseId = `package:${packageKey}`;
        const status = statusFor(purchaseId);
        return (
          <GlassCard key={packageKey} tone="accent" padding="md" className="shop-offer-card">
            <span className="shop-offer-card__kicker">
              <Package size={13} strokeWidth={1.8} />
              Набор
            </span>
            <strong>{pkg.name}</strong>
            <p>{pkg.description}</p>
            <div className="shop-offer-card__foot">
              <span className="shop-offer-card__price">
                {pkg.price}₽
                {pkg.original_price ? <s>{pkg.original_price}₽</s> : null}
              </span>
              {status === "fulfilled" ? (
                <span className="shop-item-card__status is-owned">Куплено</span>
              ) : status === "pending" ? (
                <span className="shop-item-card__status is-pending">Ждём оплату</span>
              ) : (
                <PremiumButton
                  size="sm"
                  disabled={buyingId === purchaseId || purchasesEnabled === false}
                  onClick={() => onBuy(purchaseId)}
                >
                  {buyingId === purchaseId ? "…" : "Купить"}
                </PremiumButton>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
