import { Flame, UserRound } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";

export default function ProfileHero({ user }) {
  const displayName =
    user.display_name || user.telegram_first_name || user.email?.split("@")[0] || "Ботяра";
  const frameClass = user.avatar_frame ? `avatar-frame avatar-frame-${user.avatar_frame}` : "avatar-frame";

  return (
    <header className="profile-premium-hero">
      <div className="profile-premium-hero__copy">
        <span className="profile-premium-hero__eyebrow">
          <UserRound size={14} strokeWidth={2} />
          Профиль BOTYARA
        </span>

        <div className="profile-premium-hero__identity">
          <span className={frameClass}>
            <Avatar
              src={user.avatar_base64}
              name={displayName}
              alt={`Аватар ${displayName}`}
              size="xl"
              shape="squircle"
            />
          </span>

          <div className="profile-premium-hero__identity-copy">
            <strong style={user.name_color ? { color: user.name_color } : undefined}>{displayName}</strong>
            {user.badge?.text ? (
              <Badge size="sm" style={{ color: user.badge.color }}>{user.badge.text}</Badge>
            ) : null}
            {typeof user.level === "number" && (
              <p>
                Уровень {user.level} · {user.level_title || "Продолжай исследовать BOTYARA"}
                {user.current_streak > 0 && (
                  <span className="profile-premium-hero__streak">
                    <Flame size={13} strokeWidth={1.8} />
                    {user.current_streak}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <GlassCard tone="accent" padding="none" className="profile-premium-hero__mascot" aria-label="Маскот BOTYARA">
        <img src="/bot-right.jpg" alt="Маскот BOTYARA" />
        <div className="profile-premium-hero__mascot-status">
          <strong>Твоё пространство</strong>
          <small>Личность, прогресс и стиль в одном месте</small>
        </div>
      </GlassCard>
    </header>
  );
}
