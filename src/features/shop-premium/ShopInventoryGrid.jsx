import { Backpack } from "lucide-react";
import ShopItemCard from "./ShopItemCard.jsx";
import { categoryFor, isItemEquipped } from "./shopCategories.js";

// Форма записи инвентаря не задокументирована бэкендом (api.shopInventory ещё
// нигде не вызывался во фронтенде) — предполагаем те же поля, что и в
// catalog.items (id, category, css_value, badge_text, ...).

export default function ShopInventoryGrid({ items, loading, error, equippedKeys, equippingId, onEquip, onTryOn }) {
  if (loading) {
    return (
      <div className="shop-premium-grid shop-premium-grid--loading" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="shop-premium-error">{error}</p>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="shop-premium-empty">
        <span>
          <Backpack size={23} strokeWidth={1.6} />
        </span>
        <strong>Пока нет украшений</strong>
        <p>Загляни в «Витрину» — первая покупка появится здесь и станет доступна для экипировки.</p>
      </div>
    );
  }

  const sections = new Map();
  for (const item of items) {
    const key = item.category || "other";
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key).push(item);
  }

  return (
    <div className="shop-premium-inventory">
      {[...sections.entries()].map(([categoryKey, categoryItems]) => {
        const meta = categoryFor(categoryKey);
        return (
          <section key={categoryKey} className="shop-premium-inventory__section">
            <h3>
              <meta.icon size={14} strokeWidth={1.8} />
              {meta.label}
            </h3>
            <div className="shop-premium-grid">
              {categoryItems.map((item, index) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  mode="collection"
                  isEquipped={isItemEquipped(item, equippedKeys)}
                  busy={equippingId === item.id}
                  onEquip={onEquip}
                  onTryOn={onTryOn}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
