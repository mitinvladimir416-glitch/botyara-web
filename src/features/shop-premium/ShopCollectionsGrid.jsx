import { Layers3 } from "lucide-react";
import ShopCollectionCard from "./ShopCollectionCard.jsx";

export default function ShopCollectionsGrid({ groups, onTryOn }) {
  if (!groups || groups.size === 0) {
    return (
      <div className="shop-premium-empty">
        <span>
          <Layers3 size={23} strokeWidth={1.6} />
        </span>
        <strong>Коллекции скоро появятся</strong>
        <p>Сюда добавятся тематические сеты вроде Rock, Jazz, Pop и Cyber — рамка, ник, титул и фон в едином стиле.</p>
      </div>
    );
  }

  return (
    <div className="shop-premium-grid shop-premium-grid--collections">
      {[...groups.entries()].map(([collectionKey, items], index) => (
        <ShopCollectionCard key={collectionKey} collectionKey={collectionKey} items={items} index={index} onTryOn={onTryOn} />
      ))}
    </div>
  );
}
