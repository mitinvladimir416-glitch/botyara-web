import { ArrowDown, Layers3, Sparkles } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

export default function PromptHero({ meta, topicLabel, target, onStart, onBrowseModes }) {
  return (
    <header className="prompt-studio-hero">
      <div className="prompt-studio-hero__copy">
        <span className="prompt-studio-hero__eyebrow">{meta?.badge || "Prompt Studio"}</span>
        <h1>{meta?.title || "Создавай идеи вместе с AI"}</h1>
        <p>{meta?.description || "BOTYARA помогает превращать мысли в готовые промпты"}</p>

        <div className="prompt-studio-hero__chips" aria-label="Статус студии">
          <span>{topicLabel}</span>
          <span>{target || "BOTYARA AI"}</span>
          <span>AI готов к работе</span>
        </div>

        <div className="prompt-studio-hero__actions">
          <PremiumButton
            size="lg"
            leadingIcon={<Sparkles size={18} strokeWidth={1.5} />}
            trailingIcon={<ArrowDown size={17} strokeWidth={1.5} />}
            onClick={onStart}
          >
            Создать новый промпт
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            size="lg"
            leadingIcon={<Layers3 size={18} strokeWidth={1.5} />}
            onClick={onBrowseModes}
          >
            Выбрать режим
          </PremiumButton>
        </div>
      </div>

      <GlassCard className="prompt-studio-hero__core" tone="accent" padding="none" aria-label="AI-ядро Prompt Studio">
        <img src="/prompts/ai-prompt-core.png" alt="Стеклянное AI-ядро BOTYARA" />
        <div className="prompt-studio-hero__core-status">
          <strong>BOTYARA Core</strong>
          <small>Prompt synthesis online</small>
          <span>Готов усилить твою идею</span>
        </div>
      </GlassCard>
    </header>
  );
}
