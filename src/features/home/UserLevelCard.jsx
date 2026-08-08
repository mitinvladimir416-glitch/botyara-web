import { Flame, Trophy } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";

export default function UserLevelCard({ user, displayName, achievementCount, onOpenProfile }) {
  const hasLevel = typeof user.level === "number";
  const xp = Number(user.xp || 0);
  const xpTarget = Number(user.xp_for_next_level || 0);
  const progress = hasLevel
    ? Math.min(100, (xp / Math.max(xpTarget, 1)) * 100)
    : 0;

  return (
    <GlassCard className="premium-home-level" tone="elevated" padding="none">
      <button className="premium-home-level__identity" type="button" onClick={onOpenProfile}>
        <span className="premium-home-level__avatar">
          <AvatarFrame frame={user.avatar_frame} label="Открыть профиль">
            <Avatar
              src={user.avatar_base64 || ""}
              alt={displayName}
              name={displayName}
              size="xl"
              shape="circle"
            />
          </AvatarFrame>
          {hasLevel && <span className="premium-home-level__rank">{user.level}</span>}
        </span>
        <span className="premium-home-level__copy">
          <strong>{displayName}</strong>
          <small>{hasLevel ? `Уровень ${user.level}` : "Твой профиль"}</small>
          <span className="premium-home-level__title">
            {user.level_title || "Исследователь идей"}
          </span>
        </span>
      </button>

      <div className="premium-home-level__progress">
        <div className="premium-home-level__progress-label">
          <span>До следующего уровня</span>
          <strong>
            <span>{Math.round(progress)}%</span>
            {xp.toLocaleString("ru-RU")} / {xpTarget.toLocaleString("ru-RU")} XP
          </strong>
        </div>
        <div
          className="premium-home-xp"
          role="progressbar"
          aria-label="Прогресс уровня"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <span style={{ "--home-xp-progress": `${progress}%` }} />
        </div>
      </div>

      <div className="premium-home-level__facts">
        <div>
          <Flame size={19} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>{user.current_streak || 0}</strong><small>дней серия</small></span>
        </div>
        <div>
          <Trophy size={19} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>{achievementCount}</strong><small>достижения</small></span>
        </div>
      </div>
    </GlassCard>
  );
}
