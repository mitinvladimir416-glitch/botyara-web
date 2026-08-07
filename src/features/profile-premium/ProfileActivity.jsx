import { Images } from "lucide-react";

export default function ProfileActivity({ posts, loading, error }) {
  return (
    <section className="profile-premium-section" aria-labelledby="profile-activity-title">
      <div className="profile-premium-section__heading">
        <h2 id="profile-activity-title">Активность в галерее</h2>
        <p>Промпты, которыми ты поделился с сообществом.</p>
      </div>

      {loading && (
        <div className="profile-activity-list profile-activity-list--loading" aria-hidden="true">
          <span />
          <span />
        </div>
      )}

      {error && <p className="profile-premium-error">{error}</p>}

      {posts && posts.length === 0 && (
        <div className="profile-premium-empty">
          <span>
            <Images size={22} strokeWidth={1.6} />
          </span>
          <strong>Пока пусто</strong>
          <p>Опубликуй промпт из «Избранного», чтобы он появился здесь и в Gallery Premium.</p>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="profile-activity-list">
          {posts.map((post) => (
            <article key={post.id} className="profile-activity-item">
              <p>{post.content.length > 220 ? `${post.content.slice(0, 220)}…` : post.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
