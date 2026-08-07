import { Images } from "lucide-react";
import GalleryCard from "./GalleryCard.jsx";

export default function GalleryGrid({ posts, loading, error, onOpenPost, onReact, hasSearch }) {
  if (loading) {
    return (
      <div className="gallery-premium-grid gallery-premium-grid--loading" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="gallery-premium-error">{error}</p>;
  }

  if (!posts.length) {
    return (
      <div className="gallery-premium-empty">
        <span>
          <Images size={23} strokeWidth={1.6} />
        </span>
        <strong>{hasSearch ? "Ничего не нашлось" : "В галерее пока пусто"}</strong>
        <p>
          {hasSearch
            ? "Попробуй изменить запрос поиска или сбросить фильтр категории."
            : 'Опубликуй промпт из раздела "Избранное" — и он появится здесь первым.'}
        </p>
      </div>
    );
  }

  return (
    <div className="gallery-premium-grid">
      {posts.map((post, index) => (
        <GalleryCard key={post.id} post={post} index={index} onOpen={onOpenPost} onReact={onReact} />
      ))}
    </div>
  );
}
