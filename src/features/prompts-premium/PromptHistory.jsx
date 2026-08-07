import { Clock3, Copy, Star } from "lucide-react";

export default function PromptHistory({ items, loading, onCopy }) {
  return (
    <section className="prompt-history" aria-labelledby="prompt-history-title">
      <div className="prompt-studio-section-heading">
        <h2 id="prompt-history-title">История студии</h2>
        <p>Последние результаты, избранные идеи и уже сохранённые промпты.</p>
      </div>

      {loading ? (
        <div className="prompt-history__loading">
          <span />
          <span />
          <span />
        </div>
      ) : items.length ? (
        <div className="prompt-history__list">
          {items.slice(0, 6).map((item) => (
            <article key={item.id}>
              <span className="prompt-history__icon">
                {item.favorite ? <Star size={17} /> : <Clock3 size={17} />}
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.content}</p>
              </div>
              <button type="button" onClick={() => onCopy(item.content)} aria-label={`Копировать: ${item.title}`}>
                <Copy size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="prompt-history__empty">
          <span>
            <Clock3 size={23} />
          </span>
          <strong>Твоя история BOTYARA только начинается</strong>
          <p>Созданные и сохранённые промпты появятся здесь после первой идеи.</p>
        </div>
      )}
    </section>
  );
}
