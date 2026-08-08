import { useEffect, useState } from "react";
import { BadgeCheck, Check, ExternalLink, Frame, Music2, Palette, Sparkles } from "lucide-react";
import { api } from "../../api.js";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";

export default function ProfileStyleCard({ user, onUserUpdate }) {
  const [ownedFrames, setOwnedFrames] = useState(null);
  const [equippingId, setEquippingId] = useState(undefined);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    api
      .shopInventory()
      .then((items) => {
        const list = Array.isArray(items) ? items : [];
        setOwnedFrames(list.filter((item) => item.category === "frame"));
      })
      .catch(() => setOwnedFrames([]));
  }, []);

  // Тема оформления (набор из категории "music_theme" в Shop Premium) пока не отдаётся
  // /api/me — поле user.music_theme предполагаемое, до подтверждения бэкендом.
  const themeName = user.music_theme || null;
  const busy = equippingId !== undefined;

  async function equipFrame(shopItemId) {
    setEquippingId(shopItemId);
    setActionError("");
    try {
      await api.shopEquip("frame", shopItemId ?? null);
      const updated = await api.me();
      onUserUpdate?.(updated);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setEquippingId(undefined);
    }
  }

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
              <AvatarFrame frame={user.avatar_frame}>
                <span className="profile-style-card__frame-dot" />
              </AvatarFrame>
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

      {ownedFrames && ownedFrames.length > 0 && (
        <div className="profile-style-card__frames">
          <span className="profile-style-card__frames-label">Твои рамки — выбери активную</span>
          <div className="profile-style-card__frames-grid">
            <button
              type="button"
              className={!user.avatar_frame ? "profile-frame-option is-active" : "profile-frame-option"}
              disabled={busy}
              onClick={() => equipFrame(null)}
              title="Без рамки"
            >
              <Avatar name={user.display_name || "Б"} size="xs" shape="circle" />
              <small>Без рамки</small>
              {!user.avatar_frame && <Check size={12} strokeWidth={3} className="profile-frame-option__check" aria-hidden="true" />}
              {equippingId === null && <span className="profile-frame-option__spinner" aria-hidden="true" />}
            </button>
            {ownedFrames.map((item) => {
              const active = user.avatar_frame === item.css_value;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={active ? "profile-frame-option is-active" : "profile-frame-option"}
                  disabled={busy}
                  onClick={() => equipFrame(item.id)}
                  title={item.name}
                >
                  <AvatarFrame frame={item.css_value}>
                    <Avatar name={user.display_name || "Б"} size="xs" shape="circle" />
                  </AvatarFrame>
                  <small>{item.name}</small>
                  {active && <Check size={12} strokeWidth={3} className="profile-frame-option__check" aria-hidden="true" />}
                  {equippingId === item.id && <span className="profile-frame-option__spinner" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {actionError && <p className="profile-style-card__frames-error">{actionError}</p>}
        </div>
      )}

      <a className="bt-button bt-button--primary bt-button--sm profile-style-card__cta" href="/?preview=shop-premium">
        <span className="bt-button__label">Открыть Shop Premium</span>
        <ExternalLink size={15} strokeWidth={1.8} />
      </a>
    </GlassCard>
  );
}
