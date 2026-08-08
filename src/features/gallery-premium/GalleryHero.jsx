import { Compass, MessageCircle, Search, Sparkles, Trophy } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import { categoryFor, totalReactions } from "./galleryCategories.js";

export default function GalleryHero({
  total,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  activeSearch,
  onClearSearch,
  spotlightPost,
  onOpenSpotlight,
}) {
  const spotlightMeta = spotlightPost ? categoryFor(spotlightPost.category) : null;
  const SpotlightIcon = spotlightMeta?.icon;
  const spotlightReactions = spotlightPost ? totalReactions(spotlightPost) : 0;
  const spotlightPreview =
    spotlightPost && spotlightPost.content.length > 140
      ? `${spotlightPost.content.slice(0, 140)}…`
      : spotlightPost?.content;

  return (
    <header className="gallery-premium-hero">
      <div className="gallery-premium-hero__copy">
        <span className="gallery-premium-hero__eyebrow">
          <Compass size={14} strokeWidth={2} />
          Галерея BOTYARA
        </span>

        <h1>Промпты, которыми делится сообщество</h1>

        <p>
          Смотри лучшие идеи других пользователей, реагируй, комментируй и сохраняй себе то, что
          вдохновляет.
        </p>

        <form
          className="gallery-premium-hero__search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <span className="gallery-premium-hero__search-field">
            <Search size={17} strokeWidth={1.7} aria-hidden="true" />
            <input
              type="text"
              placeholder="Поиск по промптам…"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </span>
          <span className="gallery-premium-hero__search-actions">
            <PremiumButton type="submit" size="sm">
              Найти
            </PremiumButton>
            {activeSearch && (
              <PremiumButton type="button" variant="ghost" size="sm" onClick={onClearSearch}>
                Сбросить
              </PremiumButton>
            )}
          </span>
        </form>

        <div className="gallery-premium-hero__stats" aria-label="Статистика галереи">
          <span>
            <Sparkles size={14} strokeWidth={1.8} />
            {total} публикаций
          </span>
          {activeSearch && <span>Поиск: «{activeSearch}»</span>}
        </div>
      </div>

      <GlassCard
        as={spotlightPost ? "button" : "div"}
        type={spotlightPost ? "button" : undefined}
        tone="accent"
        padding="lg"
        interactive={!!spotlightPost}
        className="gallery-premium-hero__spotlight"
        onClick={spotlightPost ? onOpenSpotlight : undefined}
        aria-label={spotlightPost ? "Открыть топ-публикацию галереи" : undefined}
      >
        <span className="gallery-premium-hero__spotlight-kicker">
          <Trophy size={14} strokeWidth={2} />
          Топ публикация
        </span>

        {spotlightPost ? (
          <>
            <div className="gallery-premium-hero__spotlight-author">
              <Avatar
                src={spotlightPost.author_avatar}
                name={spotlightPost.author}
                alt={`Аватар ${spotlightPost.author}`}
                size="sm"
                shape="circle"
              />
              <span>{spotlightPost.is_mine ? "Ты" : spotlightPost.author}</span>
            </div>

            <p>{spotlightPreview}</p>

            <div className="gallery-premium-hero__spotlight-meta">
              {spotlightMeta && (
                <span>
                  <SpotlightIcon size={13} strokeWidth={1.8} />
                  {spotlightMeta.label}
                </span>
              )}
              <span>
                <MessageCircle size={13} strokeWidth={1.8} />
                {spotlightPost.comment_count}
              </span>
              {spotlightReactions > 0 && <span>❤️ {spotlightReactions}</span>}
            </div>
          </>
        ) : (
          <p className="gallery-premium-hero__spotlight-empty">
            Здесь появится самая популярная публикация галереи.
          </p>
        )}
      </GlassCard>
    </header>
  );
}
