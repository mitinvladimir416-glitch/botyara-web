import { ArrowUpRight, Sparkles } from "lucide-react";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import HomeAICore from "./HomeAICore.jsx";

function getPersonalMessage({ level, streak, status }) {
  const profileStatus = typeof status === "string" ? status.trim() : "";
  if (profileStatus) return profileStatus;
  if (Number(streak) >= 7) return `Серия ${streak} дней. Продолжим создавать`;
  if (Number(level) >= 5) return "Твоя AI-вселенная готова к новой идее";
  if (Number(level) > 0) return `Уровень ${level}. Следующая идея уже близко`;
  return "Начни собирать свою AI-вселенную";
}

export default function HomeHero({ displayName, level, levelTitle, streak, status, onStart }) {
  const personalMessage = getPersonalMessage({ level, streak, status });
  const aiStatus = levelTitle || (Number(level) > 0 ? `Уровень ${level}` : "Готов к работе");

  return (
    <header className="premium-home-hero">
      <div className="premium-home-hero__shade" aria-hidden="true" />
      <div className="premium-home-hero__copy">
        <h1>Привет, {displayName}</h1>
        <p className="premium-home-hero__personal">Твоя персональная AI-вселенная</p>
        <p className="premium-home-hero__description">Создавай идеи, общайся и превращай мысли в проекты</p>
        <small className="premium-home-hero__note">{personalMessage}</small>
        <PremiumButton
          className="premium-home-hero__cta"
          size="lg"
          leadingIcon={<Sparkles size={18} strokeWidth={1.5} />}
          trailingIcon={<ArrowUpRight size={17} strokeWidth={1.5} />}
          onClick={onStart}
        >
          Начать создание
        </PremiumButton>
      </div>
      <HomeAICore status={aiStatus} />
    </header>
  );
}
