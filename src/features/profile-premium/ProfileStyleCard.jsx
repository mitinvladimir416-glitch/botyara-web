import { useEffect, useState } from "react";
import { BadgeCheck, Check, ExternalLink, Eye, Frame, Music2, Palette, RotateCcw, Sparkles } from "lucide-react";
import { api } from "../../api.js";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

// Экипировка профиля живёт на общей модели примерки (useAppearancePreview,
// та же, что и в Shop Premium) — клик по рамке только примеряет её здесь и
// на аватаре в шапке профиля, реальный shopEquip уходит только по «Применить».
export default function ProfileStyleCard({ user, appearance }) {
  const [ownedFrames, setOwnedFrames] = useState(null);

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

  const { preview, isFieldPreviewing, previewItem, previewClear, resetField, apply, pending, errors, sources } = appearance;
  const previewingFrame = isFieldPreviewing("avatar_frame");
  const frameSource = sources.avatar_frame;
  const frameBusy = frameSource ? Boolean(pending[frameSource.category]) : false;
  const frameError = frameSource ? errors[frameSource.category] : "";

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
            {previewingFrame && <Eye size={13} strokeWidth={2} className="profile-style-card__preview-icon" aria-label="Примерка" />}
            {preview.avatar_frame ? (
              <AvatarFrame frame={preview.avatar_frame}>
                <span className="profile-style-card__frame-dot" />
              </AvatarFrame>
            ) : null}
            {preview.avatar_frame || "не выбрана"}
          </span>
        </li>

        <li>
          <span className="profile-style-card__row-icon">
            <Palette size={15} strokeWidth={1.8} />
          </span>
          <span className="profile-style-card__row-label">Цвет ника</span>
          <span className="profile-style-card__row-value">
            {preview.name_color ? (
              <>
                <span className="profile-style-card__color-dot" style={{ background: preview.name_color }} />
                {preview.name_color}
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
            {preview.title?.text ? (
              <Badge size="sm" style={{ color: preview.title.color }}>{preview.title.text}</Badge>
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
          <span className="profile-style-card__frames-label">Твои рамки — нажми, чтобы примерить</span>
          <div className="profile-style-card__frames-grid">
            <button
              type="button"
              className={!preview.avatar_frame ? "profile-frame-option is-active" : "profile-frame-option"}
              onClick={() => previewClear("avatar_frame", "frame")}
              title="Без рамки"
            >
              <Avatar name={user.display_name || "Б"} size="xs" shape="circle" />
              <small>Без рамки</small>
              {!preview.avatar_frame && <Check size={12} strokeWidth={3} className="profile-frame-option__check" aria-hidden="true" />}
            </button>
            {ownedFrames.map((item) => {
              const active = preview.avatar_frame === item.css_value;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={active ? "profile-frame-option is-active" : "profile-frame-option"}
                  onClick={() => previewItem(item)}
                  title={item.name}
                >
                  <AvatarFrame frame={item.css_value}>
                    <Avatar name={user.display_name || "Б"} size="xs" shape="circle" />
                  </AvatarFrame>
                  <small>{item.name}</small>
                  {active && <Check size={12} strokeWidth={3} className="profile-frame-option__check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {previewingFrame && (
            <div className="profile-style-card__apply-bar">
              <span>Примерка: {frameSource?.name}</span>
              <div className="profile-style-card__apply-actions">
                <PremiumButton size="sm" disabled={frameBusy} onClick={() => apply(frameSource)}>
                  {frameBusy ? "…" : frameSource?.isClear ? "Применить без рамки" : "Применить"}
                </PremiumButton>
                <button
                  type="button"
                  className="profile-style-card__cancel"
                  onClick={() => resetField("avatar_frame")}
                  title="Вернуть текущее оформление"
                  aria-label="Вернуть текущее оформление"
                >
                  <RotateCcw size={14} strokeWidth={1.8} />
                </button>
              </div>
              {frameError && <p className="profile-style-card__frames-error">{frameError}</p>}
            </div>
          )}
        </div>
      )}

      <a className="bt-button bt-button--primary bt-button--sm profile-style-card__cta" href="/?preview=shop-premium">
        <span className="bt-button__label">Открыть Shop Premium</span>
        <ExternalLink size={15} strokeWidth={1.8} />
      </a>
    </GlassCard>
  );
}
