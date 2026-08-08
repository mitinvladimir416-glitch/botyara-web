import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Share2, Trash2 } from "lucide-react";
import { api, SHARE_BASE } from "../../api.js";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import GalleryComment from "./GalleryComment.jsx";
import GalleryReactions from "./GalleryReactions.jsx";
import { categoryFor } from "./galleryCategories.js";
import { getKnownAuthorFrame } from "../../lib/authorFrameCache.js";

function openProfile(userId) {
  if (!userId) return;
  window.dispatchEvent(new CustomEvent("botyara-open-profile", { detail: userId }));
}

export default function GalleryPostDetail({ postId, isAdmin, onBack }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: "post" } | { type: "comment", id }

  const load = useCallback(() => {
    api
      .getGalleryPost(postId)
      .then(setPost)
      .catch((err) => setError(err.message));
  }, [postId]);

  useEffect(load, [load]);

  function copyShareLink() {
    navigator.clipboard?.writeText(`${SHARE_BASE}/share/gallery/${postId}`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1500);
  }

  async function sendComment() {
    const text = comment.trim();
    if (!text || sending) return;
    setSending(true);
    setCommentMsg("");
    try {
      const res = await api.addGalleryComment(postId, text);
      if (res.status === "approved") {
        setComment("");
        load();
      } else {
        setCommentMsg(`Комментарий отклонён модерацией: ${res.reject_reason || "нарушение правил"}`);
      }
    } catch (err) {
      setCommentMsg(err.message);
    } finally {
      setSending(false);
    }
  }

  async function react(emoji) {
    try {
      const res = await api.reactToGalleryPost(postId, emoji);
      setPost((prev) => ({ ...prev, reactions: res.reactions, my_reaction: res.my_reaction }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === "post") {
        await api.deleteGalleryPost(postId);
        setPendingDelete(null);
        onBack();
        return;
      }
      await api.deleteGalleryComment(postId, pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err.message);
      setPendingDelete(null);
    }
  }

  const categoryMeta = post ? categoryFor(post.category) : null;
  const CategoryIcon = categoryMeta?.icon;

  return (
    <div className="gallery-premium-detail">
      <PremiumButton variant="ghost" size="sm" leadingIcon={<ArrowLeft size={16} strokeWidth={1.7} />} onClick={onBack}>
        Назад к галерее
      </PremiumButton>

      {error && <p className="gallery-premium-error">{error}</p>}

      {!post && !error && (
        <div className="gallery-premium-detail__loading">
          <span />
          <span />
        </div>
      )}

      {post && (
        <>
          <GlassCard tone="elevated" padding="lg" className="gallery-premium-detail__card">
            <header className="gallery-premium-detail__author">
              <button type="button" onClick={() => openProfile(post.author_id)}>
                <AvatarFrame frame={post.author_avatar_frame ?? getKnownAuthorFrame(post.author_id)} label="Открыть профиль">
                  <Avatar src={post.author_avatar} name={post.author} alt={`Аватар ${post.author}`} size="md" shape="squircle" />
                </AvatarFrame>
                <span>{post.is_mine ? "Ты" : post.author}</span>
              </button>
              {post.author_level ? <Badge size="sm" tone="accent">LVL {post.author_level}</Badge> : null}
              {post.author_badge?.text ? (
                <Badge size="sm" style={{ color: post.author_badge.color }}>{post.author_badge.text}</Badge>
              ) : null}
              {categoryMeta && (
                <span className="gallery-premium-detail__category">
                  <CategoryIcon size={13} strokeWidth={1.8} />
                  {categoryMeta.label}
                </span>
              )}
            </header>

            <p className="gallery-premium-detail__content">{post.content}</p>

            <div className="gallery-premium-detail__actions">
              <GalleryReactions reactions={post.reactions} myReaction={post.my_reaction} onReact={react} />
              <PremiumButton
                variant="secondary"
                size="sm"
                leadingIcon={<Share2 size={15} strokeWidth={1.7} />}
                onClick={copyShareLink}
              >
                {shareCopied ? "Скопировано" : "Поделиться"}
              </PremiumButton>
              {(post.is_mine || isAdmin) && (
                <PremiumButton
                  variant="danger"
                  size="sm"
                  leadingIcon={<Trash2 size={15} strokeWidth={1.7} />}
                  onClick={() => setPendingDelete({ type: "post" })}
                >
                  {isAdmin && !post.is_mine ? "Удалить (модерация)" : "Удалить пост"}
                </PremiumButton>
              )}
            </div>
          </GlassCard>

          <section className="gallery-premium-comments" aria-labelledby="gallery-premium-comments-title">
            <div className="gallery-premium-section-heading">
              <h2 id="gallery-premium-comments-title">Комментарии ({post.comments.length})</h2>
            </div>

            {post.comments.length === 0 ? (
              <div className="gallery-premium-comments__empty">
                <p>Пока нет комментариев — стань первым.</p>
              </div>
            ) : (
              <div className="gallery-premium-comments__list">
                {post.comments.map((c) => (
                  <GalleryComment
                    key={c.id}
                    comment={c}
                    isAdmin={isAdmin}
                    onDelete={() => setPendingDelete({ type: "comment", id: c.id })}
                  />
                ))}
              </div>
            )}

            <form
              className="gallery-premium-composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendComment();
              }}
            >
              <textarea
                placeholder="Написать комментарий…"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendComment();
                  }
                }}
                rows={2}
              />
              <PremiumButton type="submit" disabled={sending || !comment.trim()}>
                {sending ? "Отправляю…" : "Отправить"}
              </PremiumButton>
            </form>
            {commentMsg && <p className="gallery-premium-error">{commentMsg}</p>}
          </section>
        </>
      )}

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={pendingDelete?.type === "post" ? "Удалить пост?" : "Удалить комментарий?"}
        description="Это действие нельзя отменить."
        footer={
          <>
            <PremiumButton variant="ghost" onClick={() => setPendingDelete(null)}>
              Отмена
            </PremiumButton>
            <PremiumButton variant="danger" onClick={confirmDelete}>
              Удалить
            </PremiumButton>
          </>
        }
      />
    </div>
  );
}
