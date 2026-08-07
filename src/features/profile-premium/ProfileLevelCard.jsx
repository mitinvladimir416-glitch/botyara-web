import { Flame, Lock } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";

export default function ProfileLevelCard({ user }) {
  const hasLevel = typeof user.level === "number";
  const xp = Number(user.xp || 0);
  const xpNeeded = Math.max(Number(user.xp_for_next_level || 1), 1);
  const progress = hasLevel ? Math.min(100, (xp / xpNeeded) * 100) : 0;

  return (
    <GlassCard tone="elevated" padding="lg" className="profile-level-card">
      <div className="profile-level-card__head">
        <div>
          <span className="profile-level-card__kicker">Прогресс</span>
          <strong>{hasLevel ? `Уровень ${user.level}` : "Прогресс ещё не начат"}</strong>
        </div>
        {user.current_streak > 0 && (
          <span className="profile-level-card__streak">
            <Flame size={14} strokeWidth={1.8} />
            {user.current_streak} дней подряд
          </span>
        )}
      </div>

      {hasLevel ? (
        <>
          <p className="profile-level-card__title">{user.level_title || "Продолжай исследовать BOTYARA"}</p>
          <div className="profile-level-card__track" aria-label={`${xp} из ${xpNeeded} XP`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <small className="profile-level-card__xp">{xp} / {xpNeeded} XP до следующего уровня</small>
        </>
      ) : (
        <p className="profile-level-card__title">Общайся, создавай промпты и получай первый уровень.</p>
      )}

      <div className="profile-level-card__next">
        <span className="profile-level-card__next-icon">
          <Lock size={14} strokeWidth={1.8} />
        </span>
        <div>
          <strong>Следующая награда за прогресс</strong>
          <p>Скоро здесь появятся уровневые рамки и другие награды за твой рост в BOTYARA.</p>
        </div>
      </div>
    </GlassCard>
  );
}
