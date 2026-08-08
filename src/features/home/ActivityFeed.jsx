import { Bell, CircleAlert, Flame, RefreshCw, Sparkles, Trophy } from "lucide-react";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

function formatActivityTime(value) {
  if (!value) return "";
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  return `${Math.round(hours / 24)} дн. назад`;
}

function UniverseEmpty({ icon: Icon, title, children }) {
  return (
    <div className="premium-home-universe__empty">
      <span><Icon size={21} strokeWidth={1.5} /></span>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function getEventMeta(content = "") {
  if (/достижен|награ/i.test(content)) return { label: "Достижение", icon: Trophy };
  if (/галере|публикац|работ/i.test(content)) return { label: "Публикация", icon: Sparkles };
  if (/серия|дней подряд/i.test(content)) return { label: "Серия", icon: Flame };
  if (/уров/i.test(content)) return { label: "Новый уровень", icon: Sparkles };
  return { label: "Событие", icon: Bell };
}

export default function ActivityFeed({
  items,
  achievements,
  level,
  levelTitle,
  streak,
  loading,
  error,
  onRetry,
  onOpenNotifications,
}) {
  const recentActivity = items.slice(0, 3);
  const hasProgress = Number(level) > 0 || Number(streak) > 0;

  return (
    <section className="premium-home-section premium-home-universe" aria-labelledby="premium-home-universe-title">
      <div className="premium-home-section__heading">
        <div>
          <h2 id="premium-home-universe-title">Вселенная BOTYARA</h2>
          <p>Твои события, прогресс и новые достижения.</p>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={onOpenNotifications}>Смотреть всё</button>
        )}
      </div>

      <div className="premium-home-universe__grid">
        <article className="premium-home-universe__activity">
          <h3>Активность</h3>
          {loading ? (
            <div className="premium-home-activity__loading" aria-label="Загрузка вселенной BOTYARA">
              {[0, 1, 2].map((item) => <span key={item} />)}
            </div>
          ) : error ? (
            <div className="premium-home-empty" role="status">
              <span><CircleAlert size={23} strokeWidth={1.5} /></span>
              <div>
                <strong>Не удалось загрузить события</strong>
                <p>{error}</p>
              </div>
              <PremiumButton variant="ghost" size="sm" leadingIcon={<RefreshCw size={16} strokeWidth={1.5} />} onClick={onRetry}>
                Повторить
              </PremiumButton>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="premium-home-activity__list">
              {recentActivity.map((item) => (
                <UniverseActivityItem key={item.id} item={item} onOpen={onOpenNotifications} />
              ))}
            </div>
          ) : (
            <UniverseEmpty icon={Sparkles} title="Твоя история BOTYARA только начинается">
              Создай первую идею, и здесь появятся события твоей вселенной.
            </UniverseEmpty>
          )}
        </article>

        <div className="premium-home-universe__side">
          <article>
            <h3>Достижения</h3>
            {loading ? (
              <div className="premium-home-activity__loading" aria-label="Загрузка достижений">
                <span />
              </div>
            ) : achievements.length > 0 ? (
              <div className="premium-home-achievements">
                {achievements.slice(0, 2).map((achievement) => (
                  <div key={achievement.key}>
                    <span><Trophy size={18} strokeWidth={1.5} /></span>
                    <p><strong>{achievement.label}</strong><small>{achievement.desc}</small></p>
                  </div>
                ))}
              </div>
            ) : (
              <UniverseEmpty icon={Trophy} title="Всё впереди">
                Исследуй BOTYARA и открывай награды.
              </UniverseEmpty>
            )}
          </article>

          <article>
            <h3>Твой ритм</h3>
            {hasProgress ? (
              <div className="premium-home-progress-pulse">
                {Number(streak) > 0 && (
                  <div>
                    <span><Flame size={18} strokeWidth={1.5} /></span>
                    <p><strong>{streak} дней подряд</strong><small>Текущая серия активности</small></p>
                  </div>
                )}
                {Number(level) > 0 && (
                  <div>
                    <span><Sparkles size={18} strokeWidth={1.5} /></span>
                    <p><strong>Уровень {level}</strong><small>{levelTitle || "Исследователь идей"}</small></p>
                  </div>
                )}
              </div>
            ) : (
              <UniverseEmpty icon={Flame} title="Набирай свой ритм">
                Серия активности и новые уровни появятся здесь.
              </UniverseEmpty>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

function UniverseActivityItem({ item, onOpen }) {
  const meta = getEventMeta(item.content);
  const Icon = meta.icon;
  return (
    <button type="button" onClick={onOpen}>
      <span className="premium-home-activity__icon"><Icon size={17} strokeWidth={1.5} /></span>
      <span className="premium-home-activity__content">
        <small className="premium-home-activity__type">{meta.label}</small>
        <strong>{item.content}</strong>
        <small>{formatActivityTime(item.created_at)}</small>
      </span>
      <span className="premium-home-activity__arrow" aria-hidden="true">›</span>
    </button>
  );
}
