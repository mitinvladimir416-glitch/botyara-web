import { Trash2 } from "lucide-react";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { getKnownAuthorFrame } from "../../lib/authorFrameCache.js";

function openProfile(userId) {
  if (!userId) return;
  window.dispatchEvent(new CustomEvent("botyara-open-profile", { detail: userId }));
}

export default function GalleryComment({ comment, isAdmin, onDelete }) {
  return (
    <article className="gallery-premium-comment">
      <button type="button" className="gallery-premium-comment__avatar" onClick={() => openProfile(comment.author_id)}>
        <AvatarFrame frame={comment.author_avatar_frame ?? getKnownAuthorFrame(comment.author_id)}>
          <Avatar src={comment.author_avatar} name={comment.author} alt={`Аватар ${comment.author}`} size="sm" shape="circle" />
        </AvatarFrame>
      </button>

      <div className="gallery-premium-comment__body">
        <div className="gallery-premium-comment__meta">
          <button type="button" onClick={() => openProfile(comment.author_id)}>{comment.author}</button>
          {comment.author_level ? <Badge size="sm" tone="accent">LVL {comment.author_level}</Badge> : null}
          {comment.author_badge?.text ? (
            <Badge size="sm" style={{ color: comment.author_badge.color }}>{comment.author_badge.text}</Badge>
          ) : null}
        </div>
        <p>{comment.content}</p>
      </div>

      {isAdmin && (
        <button
          type="button"
          className="gallery-premium-comment__delete"
          onClick={onDelete}
          title="Удалить (модерация)"
          aria-label="Удалить комментарий"
        >
          <Trash2 size={15} strokeWidth={1.7} />
        </button>
      )}
    </article>
  );
}
