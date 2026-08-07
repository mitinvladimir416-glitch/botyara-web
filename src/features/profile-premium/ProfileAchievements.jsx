import { Trophy } from "lucide-react";

function splitLabel(label) {
  const spaceIndex = label.indexOf(" ");
  if (spaceIndex === -1) return { icon: "🏅", name: label };
  return { icon: label.slice(0, spaceIndex), name: label.slice(spaceIndex + 1) };
}

export default function ProfileAchievements({ achievements, loading, error }) {
  const earnedCount = achievements?.filter((a) => a.earned).length || 0;

  return (
    <section className="profile-premium-section" aria-labelledby="profile-achievements-title">
      <div className="profile-premium-section__heading">
        <h2 id="profile-achievements-title">Достижения</h2>
        <p>
          {achievements ? `Открыто ${earnedCount} из ${achievements.length}` : "Загружаю прогресс…"}
        </p>
      </div>

      {loading && (
        <div className="profile-achievements-grid profile-achievements-grid--loading" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      )}

      {error && <p className="profile-premium-error">{error}</p>}

      {achievements && achievements.length === 0 && (
        <div className="profile-premium-empty">
          <span>
            <Trophy size={22} strokeWidth={1.6} />
          </span>
          <strong>Достижений пока нет</strong>
          <p>Они появятся здесь по мере прогресса в BOTYARA.</p>
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div className="profile-achievements-grid">
          {achievements.map((achievement) => {
            const { icon, name } = splitLabel(achievement.label);
            return (
              <article
                key={achievement.key}
                className={achievement.earned ? "profile-achievement-card is-earned" : "profile-achievement-card"}
              >
                <span className="profile-achievement-card__icon">{icon}</span>
                <strong>{name}</strong>
                {achievement.desc && <p>{achievement.desc}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
