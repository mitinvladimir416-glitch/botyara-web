import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  CornerUpLeft,
  Mic,
  MoreHorizontal,
  Pin,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { api, getToken, WS_BASE } from "../../api.js";
import Avatar from "../../components/ui/Avatar.jsx";
import AvatarFrame from "../../components/ui/AvatarFrame.jsx";
import { getKnownAuthorFrame } from "../../lib/authorFrameCache.js";
import Badge from "../../components/ui/Badge.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import "./chat-premium.css";

const REACTIONS = ["❤️", "🔥", "😂", "👍", "😮"];

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function openProfile(userId) {
  if (!userId) return;
  window.dispatchEvent(new CustomEvent("botyara-open-profile", { detail: userId }));
}

function MessageReactions({ message, onReact }) {
  const entries = Object.entries(message.reactions || {}).filter(([, count]) => count > 0);
  return (
    <div className="chat-premium-reactions">
      {entries.map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          className={message.my_reaction === emoji ? "is-active" : ""}
          onClick={() => onReact(emoji)}
          title={(message.reactors?.[emoji] || []).join(", ")}
        >
          <span>{emoji}</span>
          <strong>{count}</strong>
        </button>
      ))}
      <div className="chat-premium-reactions__picker">
        <button type="button" className="chat-premium-icon-button" aria-label="Добавить реакцию">
          <span>＋</span>
        </button>
        <div className="chat-premium-reactions__menu">
          {REACTIONS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => onReact(emoji)}>{emoji}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message, isAdmin, highlighted, onReply, onReact, onPin, onDelete, onJump }) {
  return (
    <article
      id={`premium-chat-msg-${message.id}`}
      className={`chat-premium-message ${message.is_mine ? "is-mine" : ""} ${highlighted ? "is-highlighted" : ""}`}
    >
      <button type="button" className="chat-premium-message__avatar" onClick={() => openProfile(message.author_id)}>
        <AvatarFrame frame={message.author_avatar_frame ?? getKnownAuthorFrame(message.author_id)}>
          <Avatar
            src={message.author_avatar}
            name={message.author || "Пользователь"}
            alt={`Аватар ${message.author || "пользователя"}`}
            size="md"
            shape="circle"
          />
        </AvatarFrame>
      </button>

      <div className="chat-premium-message__body">
        <div className="chat-premium-message__meta">
          <button type="button" className="chat-premium-message__author" onClick={() => openProfile(message.author_id)}>
            {message.author || "Пользователь"}
          </button>
          {message.author_level ? <Badge size="sm" tone="accent">LVL {message.author_level}</Badge> : null}
          {message.author_badge?.text ? <Badge size="sm">{message.author_badge.text}</Badge> : null}
          <time>{formatTime(message.created_at)}</time>
        </div>

        {message.reply_to && (
          <button type="button" className="chat-premium-message__reply-preview" onClick={() => onJump(message.reply_to.id)}>
            <CornerUpLeft size={14} />
            <span><strong>{message.reply_to.author}</strong>{message.reply_to.content}</span>
          </button>
        )}

        <div className="chat-premium-message__bubble">
          <p>{message.content}</p>
        </div>

        <div className="chat-premium-message__footer">
          <MessageReactions message={message} onReact={(emoji) => onReact(message.id, emoji)} />
          <div className="chat-premium-message__actions">
            <button type="button" className="chat-premium-icon-button" onClick={() => onReply(message)} title="Ответить">
              <CornerUpLeft size={15} />
            </button>
            {isAdmin && (
              <button type="button" className="chat-premium-icon-button" onClick={() => onPin(message.id)} title={message.is_pinned ? "Открепить" : "Закрепить"}>
                <Pin size={15} />
              </button>
            )}
            {(message.is_mine || isAdmin) && (
              <button type="button" className="chat-premium-icon-button is-danger" onClick={() => onDelete(message.id)} title="Удалить">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ChatPremiumView({ user }) {
  const isAdmin = Boolean(user?.is_moderator);
  const currentUserId = user?.id;
  const [messages, setMessages] = useState([]);
  const [pinned, setPinned] = useState(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [contextMode, setContextMode] = useState(false);
  const [contextTargetId, setContextTargetId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsReconnectTimerRef = useRef(null);
  const wsPingTimerRef = useRef(null);

  const onlineEstimate = useMemo(() => {
    const authors = new Set(messages.map((message) => message.author_id).filter(Boolean));
    return Math.max(authors.size, messages.length ? 1 : 0);
  }, [messages]);

  const load = useCallback(async () => {
    if (contextMode) return;
    try {
      const data = await api.listPublicChat();
      setMessages(data.messages || []);
      setPinned(data.pinned || null);
      setError("");
    } catch (requestError) {
      setError(requestError?.message || "Не удалось загрузить общий чат.");
    } finally {
      setLoading(false);
    }
  }, [contextMode]);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      const token = getToken();
      if (!token) return;
      const ws = new WebSocket(`${WS_BASE}/ws/public-chat?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        clearInterval(wsPingTimerRef.current);
        wsPingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 20000);
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (data.type === "new_message") {
          const msg = data.message;
          const isMine = msg.author_id === currentUserId;
          if (isMine) return;
          setMessages((current) => current.some((item) => item.id === msg.id)
            ? current
            : [...current, { ...msg, is_mine: false, my_reaction: null }]);
        } else if (data.type === "message_updated") {
          const msg = data.message;
          setMessages((current) => current.map((item) => item.id === msg.id ? { ...item, ...msg, is_mine: item.is_mine, my_reaction: item.my_reaction } : item));
          setPinned((current) => {
            if (msg.is_pinned) return { ...msg, is_mine: msg.author_id === currentUserId };
            return current?.id === msg.id ? null : current;
          });
        } else if (data.type === "message_deleted") {
          setMessages((current) => current.filter((item) => item.id !== data.id));
          setPinned((current) => current?.id === data.id ? null : current);
        } else if (data.type === "cleared") {
          setMessages([]);
          setPinned(null);
        } else if (data.type === "refresh") {
          load();
        }
      };

      ws.onclose = () => {
        clearInterval(wsPingTimerRef.current);
        if (!cancelled) wsReconnectTimerRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      cancelled = true;
      clearTimeout(wsReconnectTimerRef.current);
      clearInterval(wsPingTimerRef.current);
      wsRef.current?.close();
    };
  }, [currentUserId, load]);

  useEffect(() => {
    if (!contextMode) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, contextMode]);

  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    setSending(true);
    setSendError("");
    setInput("");
    const reply = replyingTo;
    setReplyingTo(null);

    const tempId = `temp-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: tempId,
        content: text,
        author: user?.display_name || user?.telegram_first_name || "Ты",
        author_id: currentUserId,
        author_avatar: user?.avatar_base64 || null,
        author_avatar_frame: user?.avatar_frame || null,
        author_level: user?.level,
        is_mine: true,
        created_at: new Date().toISOString(),
        reply_to: reply ? { id: reply.id, author: reply.author, content: reply.content } : null,
        reactions: {},
        reactors: {},
        my_reaction: null,
      },
    ]);

    try {
      const response = await api.sendPublicChat(text, reply?.id || null);
      if (response.status === "approved" && response.message) {
        setMessages((current) => current.map((message) => message.id === tempId ? response.message : message));
      } else if (response.status === "approved") {
        load();
      } else {
        setMessages((current) => current.filter((message) => message.id !== tempId));
        setSendError(response.reject_reason || "Сообщение отклонено модерацией.");
      }
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== tempId));
      setSendError(requestError?.message || "Не удалось отправить сообщение.");
    } finally {
      setSending(false);
    }
  }

  async function react(messageId, emoji) {
    try {
      const updated = await api.reactToPublicChatMessage(messageId, emoji);
      setMessages((current) => current.map((message) => message.id === updated.id ? { ...message, ...updated } : message));
      setPinned((current) => current?.id === updated.id ? { ...current, ...updated } : current);
    } catch (requestError) {
      setSendError(requestError?.message || "Не удалось поставить реакцию.");
    }
  }

  async function togglePin(messageId) {
    try {
      const updated = await api.pinPublicChatMessage(messageId);
      if (updated.is_pinned) setPinned(updated);
      else setPinned(null);
      await load();
    } catch (requestError) {
      setSendError(requestError?.message || "Не удалось изменить закреплённое сообщение.");
    }
  }

  async function removeMessage(messageId) {
    try {
      await api.deletePublicChatMessage(messageId);
      setMessages((current) => current.filter((message) => message.id !== messageId));
      setPinned((current) => current?.id === messageId ? null : current);
    } catch (requestError) {
      setSendError(requestError?.message || "Не удалось удалить сообщение.");
    }
  }

  async function clearAll() {
    if (!window.confirm("Очистить весь общий чат для всех пользователей?")) return;
    try {
      await api.clearPublicChat();
      setMessages([]);
      setPinned(null);
    } catch (requestError) {
      setSendError(requestError?.message || "Не удалось очистить чат.");
    }
  }

  async function runSearch() {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }
    try {
      setSearchResults(await api.searchPublicChat(query));
    } catch (requestError) {
      setError(requestError?.message || "Не удалось выполнить поиск.");
    }
  }

  async function jumpToMessage(messageId) {
    try {
      const data = await api.getPublicChatContext(messageId);
      setMessages(data.messages || []);
      setContextTargetId(data.target_id || messageId);
      setContextMode(true);
      setSearchOpen(false);
      setSearchResults(null);
      setTimeout(() => {
        document.getElementById(`premium-chat-msg-${messageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    } catch (requestError) {
      setError(requestError?.message || "Не удалось открыть сообщение.");
    }
  }

  function backToLive() {
    setContextMode(false);
    setContextTargetId(null);
    setLoading(true);
    setTimeout(load, 0);
  }

  async function toggleVoiceInput() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const { text } = await api.transcribeVoice(blob);
          if (text?.trim()) await send(text.trim());
        } catch (requestError) {
          setSendError(requestError?.message || "Не удалось распознать голос.");
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (requestError) {
      setSendError(requestError?.message || "Не удалось получить доступ к микрофону.");
    }
  }

  return (
    <section className="chat-premium">
      <header className="chat-premium-hero">
        <div className="chat-premium-hero__copy">
          <span className="chat-premium-hero__eyebrow"><Sparkles size={15} /> Live Community</span>
          <h1>Общий чат BOTYARA</h1>
          <p>Живое пространство сообщества: общайся, отвечай, реагируй и оставайся в потоке без перезагрузки страницы.</p>
          <div className="chat-premium-hero__stats">
            <span><UsersRound size={16} /> {onlineEstimate} активных авторов</span>
            <span><ShieldCheck size={16} /> Модерация включена</span>
          </div>
        </div>

        <GlassCard tone="accent" className="chat-premium-hero__signal" padding="md">
          <div className="chat-premium-hero__signal-orb"><span /></div>
          <div>
            <strong>Realtime online</strong>
            <p>WebSocket + резервное обновление</p>
          </div>
        </GlassCard>
      </header>

      <div className="chat-premium-layout">
        <main className="chat-premium-panel">
          <div className="chat-premium-panel__header">
            <div>
              <span className="chat-premium-panel__kicker">Общий канал</span>
              <h2>Лента сообщества</h2>
            </div>
            <div className="chat-premium-panel__actions">
              <button type="button" className="chat-premium-icon-button" onClick={() => setSearchOpen((value) => !value)} title="Поиск">
                <Search size={18} />
              </button>
              {isAdmin && (
                <button type="button" className="chat-premium-icon-button is-danger" onClick={clearAll} title="Очистить чат">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {searchOpen && (
            <div className="chat-premium-search">
              <div className="chat-premium-search__bar">
                <Search size={17} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && runSearch()}
                  placeholder="Найти сообщение или автора..."
                  autoFocus
                />
                <PremiumButton size="sm" onClick={runSearch}>Найти</PremiumButton>
                <button type="button" className="chat-premium-icon-button" onClick={() => setSearchOpen(false)}><X size={17} /></button>
              </div>
              {searchResults && (
                <div className="chat-premium-search__results">
                  {searchResults.length === 0 ? <p>Ничего не найдено.</p> : searchResults.slice(0, 8).map((result) => (
                    <button key={result.id} type="button" onClick={() => jumpToMessage(result.id)}>
                      <strong>{result.author}</strong>
                      <span>{result.content}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {pinned && !contextMode && (
            <button type="button" className="chat-premium-pinned" onClick={() => jumpToMessage(pinned.id)}>
              <Pin size={16} />
              <span><strong>{pinned.author}</strong>{pinned.content}</span>
              <ArrowDown size={16} />
            </button>
          )}

          {contextMode && (
            <button type="button" className="chat-premium-context" onClick={backToLive}>
              Просмотр найденного сообщения — вернуться к живому чату
            </button>
          )}

          {error && <div className="chat-premium-error">{error}</div>}

          <div className="chat-premium-messages" ref={messagesRef}>
            {loading ? (
              <div className="chat-premium-loading"><span /><span /><span /></div>
            ) : messages.length === 0 ? (
              <div className="chat-premium-empty">
                <span><UsersRound size={24} /></span>
                <strong>Здесь пока тихо</strong>
                <p>Напиши первое сообщение и запусти разговор.</p>
              </div>
            ) : messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isAdmin={isAdmin}
                highlighted={contextMode && message.id === contextTargetId}
                onReply={(item) => setReplyingTo({ id: item.id, author: item.author, content: item.content.slice(0, 100) })}
                onReact={react}
                onPin={togglePin}
                onDelete={removeMessage}
                onJump={jumpToMessage}
              />
            ))}
            <div ref={endRef} />
          </div>

          {replyingTo && (
            <div className="chat-premium-replybar">
              <CornerUpLeft size={16} />
              <span><strong>Ответ для {replyingTo.author}</strong>{replyingTo.content}</span>
              <button type="button" className="chat-premium-icon-button" onClick={() => setReplyingTo(null)}><X size={16} /></button>
            </div>
          )}

          <div className="chat-premium-composer">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder={isRecording ? "Идёт запись..." : transcribing ? "Распознаю голос..." : "Напиши сообщение..."}
              disabled={isRecording || transcribing}
            />
            <button
              type="button"
              className={`chat-premium-icon-button chat-premium-composer__voice ${isRecording ? "is-recording" : ""}`}
              onClick={toggleVoiceInput}
              disabled={transcribing}
              title="Голосовой ввод"
            >
              {isRecording ? <X size={18} /> : <Mic size={18} />}
            </button>
            <PremiumButton
              className="chat-premium-composer__send"
              leadingIcon={<Send size={17} />}
              loading={sending}
              disabled={!input.trim() || isRecording || transcribing}
              onClick={() => send()}
            >
              Отправить
            </PremiumButton>
          </div>
          {sendError && <div className="chat-premium-error chat-premium-error--composer">{sendError}</div>}
        </main>

        <aside className="chat-premium-side">
          <GlassCard className="chat-premium-side__card" padding="md">
            <span className="chat-premium-side__icon"><UsersRound size={20} /></span>
            <h3>Сообщество BOTYARA</h3>
            <p>Общий чат работает в реальном времени и использует ту же серверную логику, что и существующий виджет.</p>
          </GlassCard>

          <GlassCard className="chat-premium-side__card" padding="md">
            <span className="chat-premium-side__icon"><ShieldCheck size={20} /></span>
            <h3>Безопасный канал</h3>
            <p>Сообщения проходят существующую модерацию. Права удаления и закрепления остаются у модераторов.</p>
          </GlassCard>

          <GlassCard className="chat-premium-side__card" padding="md">
            <span className="chat-premium-side__icon"><MoreHorizontal size={20} /></span>
            <h3>Горячие действия</h3>
            <div className="chat-premium-side__actions">
              <button type="button" onClick={() => setSearchOpen(true)}><Search size={16} /> Поиск по чату</button>
              {pinned && <button type="button" onClick={() => jumpToMessage(pinned.id)}><Pin size={16} /> Закреплённое</button>}
            </div>
          </GlassCard>
        </aside>
      </div>
    </section>
  );
}
