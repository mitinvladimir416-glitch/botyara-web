import { Gem, TriangleAlert } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";

export default function ShopHero({ purchasesEnabled, itemCount }) {
  return (
    <header className="shop-premium-hero">
      <div className="shop-premium-hero__copy">
        <span className="shop-premium-hero__eyebrow">
          <Gem size={14} strokeWidth={2} />
          Магазин BOTYARA
        </span>

        <h1>Центр кастомизации профиля</h1>

        <p>
          Рамки, стили ника, титулы и будущие эффекты, фоны и музыкальные темы — собери свой
          образ и примерь его перед покупкой.
        </p>

        <div className="shop-premium-hero__stats" aria-label="Статистика магазина">
          <span>{itemCount} украшений в каталоге</span>
        </div>

        {purchasesEnabled === false && (
          <div className="shop-premium-hero__banner">
            <TriangleAlert size={16} strokeWidth={1.8} />
            Покупки временно приостановлены — витрину и примерку уже можно смотреть.
          </div>
        )}
      </div>

      <GlassCard tone="accent" padding="none" className="shop-premium-hero__mascot" aria-label="Маскот BOTYARA">
        <img src="/bot-left.jpg" alt="Маскот BOTYARA" />
        <div className="shop-premium-hero__mascot-status">
          <strong>BOTYARA Style</strong>
          <small>Экипируй свой образ</small>
        </div>
      </GlassCard>
    </header>
  );
}
