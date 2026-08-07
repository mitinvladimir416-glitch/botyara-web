import { Plus } from "lucide-react";

const REACTIONS = ["❤️", "🔥", "😂", "👍", "😮"];

export default function GalleryReactions({ reactions, myReaction, onReact, size = "md" }) {
  const entries = Object.entries(reactions || {}).filter(([, count]) => count > 0);

  return (
    <div className={`gallery-premium-reactions gallery-premium-reactions--${size}`}>
      {entries.map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          className={myReaction === emoji ? "is-active" : ""}
          onClick={() => onReact(emoji)}
        >
          <span>{emoji}</span>
          <strong>{count}</strong>
        </button>
      ))}

      <div className="gallery-premium-reactions__picker">
        <button type="button" className="gallery-premium-reactions__trigger" aria-label="Поставить реакцию">
          <Plus size={14} strokeWidth={2} />
        </button>
        <div className="gallery-premium-reactions__menu">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={myReaction === emoji ? "is-active" : ""}
              onClick={() => onReact(emoji)}
              aria-label={`Реакция ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
