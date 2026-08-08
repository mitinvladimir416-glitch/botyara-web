import { Store } from "lucide-react";
import ShopItemCard from "./ShopItemCard.jsx";

export default function ShopCatalogGrid({ items, loading, error, purchasesEnabled, statusFor, appearance }) {
  if (loading) {
    return (
      <div className="shop-premium-grid shop-premium-grid--loading" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="shop-premium-error">{error}</p>;
  }

  if (!items.length) {
    return (
      <div className="shop-premium-empty">
        <span>
          <Store size={23} strokeWidth={1.6} />
        </span>
        <strong>В этой категории пока пусто</strong>
        <p>Попробуй выбрать другую категорию — новые украшения появляются регулярно.</p>
      </div>
    );
  }

  return (
    <div className="shop-premium-grid">
      {items.map((item, index) => (
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
  );
}
