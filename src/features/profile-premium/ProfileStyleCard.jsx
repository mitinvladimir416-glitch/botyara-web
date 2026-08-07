import { BadgeCheck, ExternalLink, Frame, Music2, Palette, Sparkles } from "lucide-react";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";

export default function ProfileStyleCard({ user }) {
  const frameClass = user.avatar_frame ? `avatar-frame avatar-frame-${user.avatar_frame}` : "avatar-frame";
  // Тема оформления (набор из категории "music_theme" в Shop Premium) пока не отдаётся
  // /api/me — поле user.music_theme предполагаемое, до подтверждения бэкендом.
  const themeName = user.music_theme || null;

  return (
    <GlassCard tone="elevated" padding="lg" className="profile-style-card">
      <div className="profile-style-card__head">
        <span className="profile-style-card__kicker">
          <Sparkles size={13} strokeWidth={1.8} />
          Твой стиль
        </span>
        <strong>Экипировка профиля</strong>
      </div>

      <ul className="profile-style-card__rows">
        <li>
          <span className="profile-style-card__row-icon">
            <Frame size={15} strokeWidth={1.8} />
          </span>
          <span className="profile-style-card__row-label">Рамка</span>
          <span className="profile-style-card__row-value">
            {user.avatar_frame ? (
              <span className={`profile-style-card__frame-dot ${frameClass}`} />
            ) : null}
            {user.avatar_frame || "не выбрана"}
          </span>
        </li>

        <li>
          <span className="profile-style-card__row-icon">
            <Palette size={15} strokeWidth={1.8} />
          </span>
          <span className="profile-style-card__row-label">Цвет ника</span>
          <span className="profile-style-card__row-value">
            {user.name_color ? (
              <>
                <span className="profile-style-card__color-dot" style={{ background: user.name_color }} />
                {user.name_color}
              </>
            ) : (
              "не выбран"
            )}
          </span>
        </li>

        <li>
          <span className="profile-style-card__row-icon">
            <BadgeCheck size={15} strokeWidth={1.8} />
          </span>
          <span className="profile-style-card__row-label">Бейдж</span>
          <span className="profile-style-card__row-value">
            {user.badge?.text ? (
              <Badge size="sm" style={{ color: user.badge.color }}>{user.badge.text}</Badge>
            ) : (
              "нет бейджа"
            )}
          </span>
        </li>

        <li>
          <span className="profile-style-card__row-icon">
            <Music2 size={15} strokeWidth={1.8} />
          </span>
          <span className="profile-style-card__row-label">Тема оформления</span>
          <span className="profile-style-card__row-value">{themeName || "не выбрана"}</span>
        </li>
      </ul>

      <a className="bt-button bt-button--primary bt-button--sm profile-style-card__cta" href="/?preview=shop-premium">
        <span className="bt-button__label">Открыть Shop Premium</span>
        <ExternalLink size={15} strokeWidth={1.8} />
      </a>
    </GlassCard>
  );
}
