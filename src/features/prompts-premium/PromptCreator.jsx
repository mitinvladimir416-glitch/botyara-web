import { Sparkles } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

export default function PromptCreator({
  creatorRef,
  draft,
  onDraftChange,
  target,
  targets,
  onTargetChange,
  style,
  onStyleChange,
  format,
  onFormatChange,
  detail,
  onDetailChange,
  loading,
  onSubmit,
  modeMeta,
  onQuickInsert,
}) {
  return (
    <section ref={creatorRef} className="prompt-creator" aria-labelledby="prompt-creator-title">
      <div className="prompt-studio-section-heading">
        <h2 id="prompt-creator-title">Рабочая область</h2>
        <p>Опиши задачу своими словами, а BOTYARA превратит её в более сильный и структурированный промпт.</p>
      </div>

      <div className="prompt-creator__helper-bar">
        <span>{modeMeta?.badge || "AI режим"}</span>
        <span>{draft.trim().length} символов</span>
      </div>

      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="Опиши идею, настроение, желаемый результат и важные детали..."
        rows={8}
      />

      <div className="prompt-creator__quick-start" aria-label="Быстрые идеи">
        {(modeMeta?.chips || []).map((chip) => (
          <button key={chip} type="button" onClick={() => onQuickInsert(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <div className="prompt-creator__controls">
        <label>
          <span>Модель</span>
          <select value={target} onChange={(event) => onTargetChange(event.target.value)}>
            {targets.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Стиль</span>
          <select value={style} onChange={(event) => onStyleChange(event.target.value)}>
            <option value="Выразительный">Выразительный</option>
            <option value="Минималистичный">Минималистичный</option>
            <option value="Кинематографичный">Кинематографичный</option>
          </select>
        </label>
        <label>
          <span>Формат</span>
          <select value={format} onChange={(event) => onFormatChange(event.target.value)}>
            <option value="Структурированный">Структурированный</option>
            <option value="Краткий">Краткий</option>
            <option value="Пошаговый">Пошаговый</option>
          </select>
        </label>
        <label>
          <span>Детализация</span>
          <select value={detail} onChange={(event) => onDetailChange(event.target.value)}>
            <option value="Высокая">Высокая</option>
            <option value="Средняя">Средняя</option>
            <option value="Базовая">Базовая</option>
          </select>
        </label>
      </div>

      <GlassCard className="prompt-creator__insight" padding="sm">
        <strong>Совет BOTYARA</strong>
        <p>Лучше всего работают идеи, где есть цель, атмосфера, визуальные или музыкальные ориентиры и ожидаемый результат.</p>
      </GlassCard>

      <PremiumButton
        className="prompt-creator__submit"
        size="lg"
        leadingIcon={<Sparkles size={18} strokeWidth={1.5} />}
        loading={loading}
        disabled={!draft.trim()}
        onClick={onSubmit}
      >
        Улучшить с AI
      </PremiumButton>
    </section>
  );
}
