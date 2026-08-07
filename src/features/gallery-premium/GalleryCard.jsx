import { MessageCircle } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GalleryReactions from "./GalleryReactions.jsx";
import { categoryFor } from "./galleryCategories.js";

function openProfile(userId) {
  if (!userId) return;
  window.dispatchEvent(new CustomEvent("botyara-open-profile", { detail: userId }));
}

export default function GalleryCard({ post, onOpen, onReact, index = 0 }) {
  const meta = categoryFor(post.category);
  const CategoryIcon = meta.icon;
  const preview = post.content.length > 220 ? `${post.content.slice(0, 220)}…` : post.content;

  return (
    <article className="gallery-card" style={{ "--card-index": index }}>
      <div className="gallery-card__head">
        <span className="gallery-card__category">
          <CategoryIcon size={13} strokeWidth={1.8} />
          {meta.label}
        </span>
        {post.is_mine && <span className="gallery-card__mine">Твой пост</span>}
      </div>

      <button type="button" className="gallery-card__body" onClick={() => onOpen(post.id)}>
        <p>{preview}</p>
      </button>

      <div className="gallery-card__author">
        <button type="button" onClick={() => openProfile(post.author_id)}>
          <Avatar src={post.author_avatar} name={post.author} alt={`Аватар ${post.author}`} size="sm" shape="circle" />
          <span>{post.is_mine ? "Ты" : post.author}</span>
        </button>
        {post.author_level ? <Badge size="sm" tone="accent">LVL {post.author_level}</Badge> : null}
        {post.author_badge?.text ? (
          <Badge size="sm" style={{ color: post.author_badge.color }}>{post.author_badge.text}</Badge>
        ) : null}
      </div>

      <footer className="gallery-card__footer">
        <GalleryReactions
          reactions={post.reactions}
          myReaction={post.my_reaction}
          onReact={(emoji) => onReact(post.id, emoji)}
          size="sm"
        />
        <button type="button" className="gallery-card__comments" onClick={() => onOpen(post.id)}>
          <MessageCircle size={14} strokeWidth={1.8} />
          {post.comment_count}
        </button>
      </footer>
    </article>
  );
}
