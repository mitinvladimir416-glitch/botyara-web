import { categoryFor } from "./shopCategories.js";
import { collectionFor } from "./shopCollections.js";

export default function ShopCollectionCard({ collectionKey, items, onTryOn, index = 0 }) {
  const meta = collectionFor(collectionKey);

  return (
    <article className="shop-collection-card" style={{ "--card-index": index }}>
      <div className="shop-collection-card__head">
        <span className="shop-collection-card__icon">
          <meta.icon size={20} strokeWidth={1.7} />
        </span>
        <div>
          <strong>{meta.label}</strong>
          <span>{items.length} {items.length === 1 ? "предмет" : "предметов"}</span>
        </div>
      </div>

      <ul className="shop-collection-card__items">
        {items.slice(0, 4).map((item) => (
          <li key={item.id}>
            {categoryFor(item.category).label}: {item.name}
          </li>
        ))}
      </ul>

      <button type="button" className="shop-collection-card__tryon" onClick={() => onTryOn(items[0])}>
        Примерить коллекцию
      </button>
    </article>
  );
}
