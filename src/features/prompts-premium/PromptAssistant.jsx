import { Copy, Sparkles, Star } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

export default function PromptAssistant({ result, error, loading, saved, onCopy, onSave, modeMeta }) {
  return (
    <aside className="prompt-assistant" aria-live="polite">
      <div className="prompt-assistant__head">
        <span className="prompt-assistant__mark">Б</span>
        <div>
          <strong>BOTYARA Assistant</strong>
          <small>{loading ? "Собирает идею" : "Готов усилить твой запрос"}</small>
        </div>
      </div>

      <GlassCard className="prompt-assistant__meta" padding="sm">
        <strong>{modeMeta?.badge || "AI режим"}</strong>
        <p>{modeMeta?.description || "Сейчас студия поможет собрать более сильный промпт."}</p>
      </GlassCard>

      {error ? (
        <p className="prompt-assistant__error">{error}</p>
      ) : result ? (
        <>
          <div className="prompt-assistant__result-wrap">
            <p className="prompt-assistant__result">{result}</p>
          </div>
          <div className="prompt-assistant__actions">
            <PremiumButton variant="ghost" size="sm" leadingIcon={<Copy size={15} />} onClick={onCopy}>
              Копировать
            </PremiumButton>
            <PremiumButton variant="ghost" size="sm" leadingIcon={<Star size={15} />} onClick={onSave} disabled={saved}>
              {saved ? "Сохранено" : "В избранное"}
            </PremiumButton>
          </div>
        </>
      ) : (
        <div className="prompt-assistant__empty">
          <span>
            <Sparkles size={20} />
          </span>
          <strong>Здесь появится усиленный результат</strong>
          <p>После генерации BOTYARA покажет улучшенный промпт, который можно сразу скопировать или сохранить.</p>
        </div>
      )}
    </aside>
  );
}
