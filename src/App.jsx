import { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken } from "./api.js";

const BOT_USERNAME = "halpervovan_bot"; // имя бота без @, для кнопки "Войти через Telegram"

const NAV_ITEMS = [
  { id: "chat", label: "Общение", icon: "💬" },
  { id: "translate", label: "Переводчик", icon: "🌐" },
  { id: "prompts", label: "Промпты", icon: "🎨" },
  { id: "cover", label: "Обложка трека", icon: "🖼" },
  { id: "favorites", label: "Избранное", icon: "⭐" },
  { id: "gallery", label: "Галерея", icon: "🖼️" },
  { id: "rooms", label: "Комнаты", icon: "🤝" },
  { id: "whatsnew", label: "Что нового", icon: "📰" },
  { id: "account", label: "Аккаунт", icon: "👤" },
];

const CATEGORY_LABELS = {
  suno: "🎵 Suno",
  image: "🖼 Картинка",
  video: "🎬 Видео",
  cover: "🖼️ Обложка трека",
  other: "💬 Разное",
};

// Заполни своими ссылками — они используются в кнопках "Уведомления/Связь" и "Поддержать автора"
const AUTHOR_TELEGRAM_URL = "https://t.me/Tipo4ek31";
const AUTHOR_EMAIL = "mitinvladimir416@gmail.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState(() =>
    new URLSearchParams(window.location.search).get("room") ? "rooms" : "chat"
  );
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("botyara_view_mode");
    if (saved === "mobile" || saved === "desktop") return saved;
    return window.innerWidth <= 780 ? "mobile" : "desktop";
  });
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    function handler(e) {
      setProfileUserId(e.detail);
    }
    window.addEventListener("botyara-open-profile", handler);
    return () => window.removeEventListener("botyara-open-profile", handler);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("botyara_view_mode", viewMode);
    document.documentElement.classList.remove("force-mobile", "force-desktop");
    document.documentElement.classList.add(viewMode === "mobile" ? "force-mobile" : "force-desktop");

    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      if (viewMode === "desktop") {
        const desktopWidth = 1024;
        const scale = Math.min(1, window.innerWidth / desktopWidth);
        meta.setAttribute(
          "content",
          `width=${desktopWidth}, initial-scale=${scale}, minimum-scale=0.25, maximum-scale=2`
        );
      } else {
        meta.setAttribute("content", "width=device-width, initial-scale=1");
      }
    }
  }, [viewMode]);

  function toggleViewMode() {
    setViewMode((m) => (m === "mobile" ? "desktop" : "mobile"));
  }

  const handleAuthed = (data) => {
    setToken(data.access_token);
    setUser(data.user);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="splash">
        <div className="logo-mark">Б</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />;
  }

  return (
    <div className="app-shell">
      <ParticlesBG />
      <TopBar />
      <Sidebar
        active={activeTab}
        onChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
      />
      <main className="content">
        {activeTab === "chat" && <ChatView />}
        {activeTab === "translate" && <TranslateView />}
        {activeTab === "prompts" && <PromptsView />}
        {activeTab === "cover" && <CoverView />}
        {activeTab === "favorites" && <FavoritesView />}
        {activeTab === "gallery" && <GalleryView isAdmin={user.is_moderator} />}
        {activeTab === "rooms" && <RoomsView />}
        {activeTab === "admin" && user.is_moderator && <AdminView isAdmin={user.is_admin} />}
        {activeTab === "whatsnew" && <WhatsNewView isAdmin={user.is_admin} />}
        {activeTab === "account" && (
          <AccountView
            user={user}
            onUserUpdate={setUser}
            onLogout={handleLogout}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />
        )}
      </main>
      <ChatWidget isAdmin={user.is_moderator} isMobile={viewMode === "mobile"} />
      {profileUserId && <PublicProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />}
    </div>
  );
}

// Вызывается кликом по имени автора где угодно на сайте — открывает публичный профиль
function openProfile(userId) {
  if (!userId) return;
  window.dispatchEvent(new CustomEvent("botyara-open-profile", { detail: userId }));
}

// ==================== Плавающие частицы (фоновая атмосфера) ==================== 

function ParticlesBG() {
  return (
    <div className="particles-bg" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="particle" />
      ))}
    </div>
  );
}

// ==================== Экран входа ====================

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [botLoginOpen, setBotLoginOpen] = useState(false);
  const [botLoginToken, setBotLoginToken] = useState(null);
  const [botUsername, setBotUsername] = useState(BOT_USERNAME);
  const [botLoginError, setBotLoginError] = useState("");
  const [botLoginStarting, setBotLoginStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAuth(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Пока открыто окно входа через бота — опрашиваем сайт, подтвердил ли пользователь вход
  useEffect(() => {
    if (!botLoginOpen || !botLoginToken) return;
    const interval = setInterval(async () => {
      try {
        const data = await api.pollBotLogin(botLoginToken);
        if (data.status === "confirmed") {
          clearInterval(interval);
          setBotLoginOpen(false);
          onAuthed(data);
        }
      } catch (e) {
        clearInterval(interval);
        setBotLoginError(e.message || "Время ожидания истекло — попробуй ещё раз");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [botLoginOpen, botLoginToken, onAuthed]);

  async function startBotLogin() {
    setBotLoginStarting(true);
    setBotLoginError("");
    try {
      const data = await api.startBotLogin();
      setBotLoginToken(data.token);
      setBotUsername(data.bot_username || BOT_USERNAME);
      setBotLoginOpen(true);
      setCopied(false);
    } catch (e) {
      setError("Не удалось запустить вход через бота: " + e.message);
    } finally {
      setBotLoginStarting(false);
    }
  }

  function retryBotLogin() {
    setBotLoginToken(null);
    setBotLoginError("");
    startBotLogin();
  }

  function copyBotCommand() {
    const command = `/start web_auth_${botLoginToken}`;
    navigator.clipboard?.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login" ? await api.login(email, password) : await api.register(email, password);
      onAuthed(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <style>{`
        .auth-screen { position: relative; }
        @keyframes botyaraTitleIn {
          from { opacity: 0; transform: scale(0.6) translateY(-24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes botyaraSlideRight {
          from { opacity: 0; transform: translateX(130%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes botyaraSlideLeft {
          from { opacity: 0; transform: translateX(-130%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .botyara-hero-title {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          text-align: center;
          font-size: clamp(2rem, 6vw, 3.2rem);
          font-weight: 900;
          letter-spacing: 0.12em;
          color: #fff;
          text-shadow: 0 0 24px rgba(168, 85, 247, 0.85), 0 0 48px rgba(168, 85, 247, 0.5);
          margin: 0;
          animation: botyaraTitleIn 0.7s ease-out both;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .botyara-hero-title.hide {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.85);
        }
        .botyara-hero-title:not(.hide) {
          transform: translate(-50%, -50%);
        }
        .botyara-side-image {
          position: fixed;
          top: 50%;
          width: min(24vw, 340px);
          transform: translateY(-50%);
          opacity: 0;
          pointer-events: none;
          z-index: 0;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.6));
        }
        .botyara-side-image.right {
          right: -10px;
          animation: botyaraSlideRight 0.7s ease-out 1.0s forwards;
        }
        .botyara-side-image.left {
          left: -10px;
          animation: botyaraSlideLeft 0.7s ease-out 1.7s forwards;
        }
        @media (max-width: 900px) {
          .botyara-side-image { display: none; }
        }
        .auth-card {
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .auth-card.entering {
          opacity: 0;
          transform: translateY(24px);
          pointer-events: none;
        }
      `}</style>

      <ParticlesBG />

      <img src="/bot-right.jpg" alt="" className="botyara-side-image right" />
      <img src="/bot-left.jpg" alt="" className="botyara-side-image left" />

      <h1 className={showAuth ? "botyara-hero-title hide" : "botyara-hero-title"}>БОТЯРА</h1>

      <div
        className={showAuth ? "auth-card" : "auth-card entering"}
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="brand">
          <span className="brand-mark">Б</span>
          <div>
            <h1 className="brand-title">ботяра</h1>
            <p className="brand-sub">жми, общайся, отрывайся</p>
          </div>
        </div>

        <button className="btn-secondary bot-login-btn" onClick={startBotLogin} disabled={botLoginStarting} type="button">
          {botLoginStarting ? "Секунду…" : "🚀 Войти через бота"}
        </button>

        {botLoginOpen && (
          <div className="bot-login-overlay" onClick={() => setBotLoginOpen(false)}>
            <div className="bot-login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bot-login-icon">✈️</div>
              <h3 style={{ margin: "0 0 6px" }}>Авторизация через Telegram</h3>
              {!botLoginError ? (
                <>
                  <p className="empty-hint" style={{ marginBottom: 16 }}>
                    Откройте Telegram и нажмите «Запустить» у бота — вы автоматически войдёте.
                  </p>
                  <a
                    className="btn-primary"
                    style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 14 }}
                    href={`https://t.me/${botUsername}?start=web_auth_${botLoginToken}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🚀 Открыть Telegram
                  </a>
                  <p className="empty-hint" style={{ marginBottom: 6 }}>
                    Или скопируйте команду и отправьте её боту @{botUsername}:
                  </p>
                  <div className="bot-login-command" onClick={copyBotCommand} title="Нажми, чтобы скопировать">
                    /start web_auth_{botLoginToken}
                    {copied && <span className="saved-msg" style={{ marginLeft: 8 }}>Скопировано!</span>}
                  </div>
                  <div className="inline-actions" style={{ justifyContent: "center", marginTop: 16 }}>
                    <span className="empty-hint">⏳ Ожидание авторизации…</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="form-error" style={{ marginBottom: 16 }}>{botLoginError}</p>
                  <button className="btn-primary" onClick={retryBotLogin} style={{ marginBottom: 10 }}>
                    Попробовать ещё раз
                  </button>
                </>
              )}
              <button className="btn-ghost" onClick={() => setBotLoginOpen(false)} style={{ marginTop: 4 }}>
                Закрыть
              </button>
            </div>
          </div>
        )}

        <div className="divider"><span>или</span></div>

        <div className="mode-switch">
          <button
            className={mode === "login" ? "mode-btn active" : "mode-btn"}
            onClick={() => setMode("login")}
            type="button"
          >
            Вход
          </button>
          <button
            className={mode === "register" ? "mode-btn active" : "mode-btn"}
            onClick={() => setMode("register")}
            type="button"
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Секунду…" : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== Каркас приложения ====================

function Sidebar({ active, onChange, user, onLogout, viewMode, onToggleViewMode }) {
  const displayName = user.display_name || user.telegram_first_name || user.email || "Пользователь";
  const navItems = user.is_moderator
    ? [...NAV_ITEMS, { id: "admin", label: "Админка", icon: "🛠" }]
    : NAV_ITEMS;
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark small">Б</span>
        <span className="sidebar-brand-text">ботяра</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "nav-item active" : "nav-item"}
            onClick={() => onChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="device-toggle-btn" onClick={onToggleViewMode} title="Переключить вид сайта">
          {viewMode === "mobile" ? "🖥 Версия для ПК" : "📱 Мобильная версия"}
        </button>
        <ContactButton
          className="btn-ghost"
          intro="Как удобнее написать — выбирай:"
          panelStyle={{ bottom: 40, left: 0 }}
        >
          ✉️ Связь со мной
        </ContactButton>
        <ContactButton
          className="btn-ghost"
          intro="Спасибо, что хочешь поддержать проект! Просто напиши — подскажу, как это лучше сделать 💜"
          panelStyle={{ bottom: 40, left: 0 }}
        >
          💜 Поддержать проект
        </ContactButton>
        <div className="user-chip">
          {user.avatar_base64 ? (
            <img
              src={user.avatar_base64}
              alt=""
              className="user-avatar"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span className="user-avatar">{displayName[0]?.toUpperCase()}</span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="user-name">{displayName}</span> <CustomBadge badge={user.badge} />
            {typeof user.level === "number" && (
              <div className="level-block">
                <div className="level-row">
                  <span className="level-badge">Ур. {user.level}</span>
                  {user.current_streak > 0 && <span className="streak-badge">🔥 {user.current_streak}</span>}
                </div>
                <div className="xp-bar-track" title={`${user.xp} / ${user.xp_for_next_level} XP`}>
                  <div
                    className="xp-bar-fill"
                    style={{ width: `${Math.min(100, (user.xp / Math.max(user.xp_for_next_level, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {user.level_title && <p className="empty-hint" style={{ margin: "0 0 8px", fontSize: 12 }}>{user.level_title}</p>}
        <button className="btn-ghost" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </aside>
  );
}

function LevelBadge({ level }) {
  if (!level) return null;
  return <span className="level-badge-mini">Ур.{level}</span>;
}

function CustomBadge({ badge }) {
  if (!badge || !badge.text) return null;
  return (
    <span className="custom-badge" style={{ borderColor: badge.color, color: badge.color }}>
      {badge.text}
    </span>
  );
}

const REACTION_EMOJIS = ["❤️", "🔥", "😂", "👀", "💯"];

function ReactionPicker({ reactions, myReaction, onReact }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(reactions || {}).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <span className="reaction-picker" onClick={(e) => e.stopPropagation()}>
      <span className="reaction-summary" onClick={() => setOpen((v) => !v)} role="button">
        {entries.length > 0 ? entries.map(([emoji]) => emoji).join("") : "🤍"} {total > 0 ? total : ""}
      </span>
      {open && (
        <div className="reaction-menu">
          {REACTION_EMOJIS.map((emoji) => (
            <span
              key={emoji}
              className={myReaction === emoji ? "reaction-option active" : "reaction-option"}
              onClick={(e) => {
                e.stopPropagation();
                onReact(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </span>
  );
}

function ScreenHeader({ title, subtitle }) {
  return (
    <div className="screen-header">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function Bubble({ role, children }) {
  return <div className={role === "user" ? "bubble bubble-user" : "bubble bubble-bot"}>{children}</div>;
}

// ==================== Общение ====================

function ChatView() {
  const [roles, setRoles] = useState(null);
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem("botyara_chat_role") || "default");
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const endRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    api
      .chatRoles()
      .then(setRoles)
      .catch(() => setRoles({}));
  }, []);

  useEffect(() => {
    setLoadingHistory(true);
    api
      .history(activeRole)
      .then((data) => setHistory(data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [activeRole]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  function switchTab(id) {
    if (id === activeRole) return;
    setActiveRole(id);
    localStorage.setItem("botyara_chat_role", id);
  }

  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    const nextHistory = [...history, { role: "user", content: text }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.chat(nextHistory, activeRole);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "assistant", content: "Ошибка: " + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const { text } = await api.transcribeVoice(blob);
          if (text && text.trim()) {
            await send(text.trim());
          }
        } catch (e) {
          setHistory((h) => [...h, { role: "assistant", content: "Не удалось распознать голос: " + e.message }]);
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Не удалось получить доступ к микрофону: " + e.message);
    }
  }

  async function resetChat() {
    const sure = window.confirm(
      activeRole === "default"
        ? "Очистить историю обычного общения? Она общая с ботом в Telegram — там она тоже пропадёт."
        : `Очистить историю разговора с ролью «${currentRole?.label || ""}»? Эта вкладка не связана с ботом, пропадёт только здесь.`
    );
    if (!sure) return;
    try {
      await api.clearHistory(activeRole);
      setHistory([]);
    } catch (e) {
      alert("Не удалось очистить историю: " + e.message);
    }
  }

  function exportHistory() {
    const roleLabel = currentRole?.label || "Общение";
    const lines = history.map((m) => `${m.role === "user" ? "Ты" : "Ботяра"}: ${m.content}`);
    const text = `Переписка — ${roleLabel}\n${new Date().toLocaleString("ru-RU")}\n\n${lines.join("\n\n")}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `botyara-${roleLabel}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentRole = roles?.[activeRole];

  return (
    <div className="view bt-wide">
      <style>{`
        .bt-tabs-wrap {
          position: relative;
        }
        .view.bt-wide {
          max-width: 1100px;
          width: 100%;
        }
        .bt-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: thin;
          padding: 4px 2px 12px;
        }
        .bt-tabs::-webkit-scrollbar {
          height: 6px;
        }
        .bt-tabs::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 999px;
        }
        .bt-tabs::-webkit-scrollbar-track {
          background: transparent;
        }
        .bt-tabs-wrap::before,
        .bt-tabs-wrap::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 10px;
          width: 28px;
          pointer-events: none;
          z-index: 1;
        }
        .bt-tabs-wrap::before {
          left: 0;
          background: linear-gradient(90deg, rgba(13,8,28,0.96), rgba(13,8,28,0));
        }
        .bt-tabs-wrap::after {
          right: 0;
          background: linear-gradient(270deg, rgba(13,8,28,0.96), rgba(13,8,28,0));
        }
        .bt-tab {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .bt-tab:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.16);
          color: #fff;
        }
        .bt-tab.active {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(168, 85, 247, 0.45);
        }
        .bt-tab-emoji {
          font-size: 16px;
        }
        .bt-toolbar {
          display: flex;
          justify-content: flex-end;
          margin-top: -2px;
        }
        .bt-reset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .bt-reset-btn:hover {
          color: #fca5a5;
          border-color: rgba(252,165,165,0.35);
          background: rgba(252,165,165,0.08);
        }
      `}</style>

      <ScreenHeader
        title="Общение"
        subtitle="Каждая вкладка — отдельный разговор со своей историей"
      />

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(13, 8, 28, 0.96)",
          backdropFilter: "blur(6px)",
          paddingBottom: 4,
          marginBottom: 12,
        }}
      >
        <div className="bt-tabs-wrap">
          <div
            className="bt-tabs"
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {!roles && <p className="empty-hint">Загружаю вкладки…</p>}
            {roles &&
              Object.entries(roles).map(([id, cfg]) => (
                <button
                  key={id}
                  className={id === activeRole ? "bt-tab active" : "bt-tab"}
                  onClick={() => switchTab(id)}
                  title={cfg.description}
                >
                  <span className="bt-tab-emoji">{cfg.emoji}</span>
                  {cfg.label}
                </button>
              ))}
          </div>
        </div>

        <div className="bt-toolbar">
          {history.length > 0 && (
            <button className="bt-reset-btn" onClick={exportHistory} style={{ marginRight: 8 }}>
              ⬇️ Скачать историю
            </button>
          )}
          <button className="bt-reset-btn" onClick={resetChat}>
            🗑 Начать заново
          </button>
        </div>
      </div>

      <div className="chat-log">
        {loadingHistory && <p className="empty-hint">Загружаю переписку…</p>}
        {!loadingHistory && history.length === 0 && (
          <p className="empty-hint">
            {activeRole === "default"
              ? "Пока пусто — начни обычный разговор ниже 👇"
              : `Пока пусто — начни общение с ролью «${currentRole?.label || ""}» ниже 👇`}
          </p>
        )}
        {history.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content}
          </Bubble>
        ))}
        {loading && <Bubble role="assistant">печатает…</Bubble>}
        <div ref={endRef} style={{ height: 8 }} />
      </div>
      <div
        className="composer"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          background: "rgba(13, 8, 28, 0.96)",
          backdropFilter: "blur(6px)",
          paddingTop: 10,
        }}
      >
        <input
          placeholder={
            isRecording
              ? "🔴 Идёт запись — нажми на микрофон ещё раз, чтобы остановить"
              : transcribing
              ? "Распознаю голос…"
              : currentRole
              ? `Напиши сообщение (${currentRole.label})…`
              : "Напиши сообщение…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={isRecording || transcribing}
        />
        <button
          className={isRecording ? "btn-secondary" : "btn-ghost"}
          onClick={toggleRecording}
          disabled={transcribing || loading}
          title={isRecording ? "Остановить запись" : "Записать голосовое сообщение"}
          style={isRecording ? { color: "#f87171", borderColor: "#f87171" } : undefined}
        >
          {isRecording ? "⏹" : "🎤"}
        </button>
        <button className="btn-primary" onClick={() => send()} disabled={loading || isRecording || transcribing}>
          Отправить
        </button>
      </div>
    </div>
  );
}

// ==================== Переводчик ====================

const QUICK_LANGS = [
  { code: "en", label: "🇬🇧 Английский" },
  { code: "fr", label: "🇫🇷 Французский" },
  { code: "de", label: "🇩🇪 Немецкий" },
];

function TranslateView() {
  const [targetLang, setTargetLang] = useState(null); // null = автоопределение
  const [customLang, setCustomLang] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function doTranslate() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const { translation } = await api.translate(text, targetLang);
      setResult(translation);
    } catch (e) {
      setResult("Ошибка: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view">
      <ScreenHeader title="Переводчик" subtitle="Выбери язык и вставь текст" />

      <div className="chip-row">
        <button
          className={targetLang === null ? "chip active" : "chip"}
          onClick={() => setTargetLang(null)}
        >
          🔍 Определить язык
        </button>
        {QUICK_LANGS.map((l) => (
          <button
            key={l.code}
            className={targetLang === l.code ? "chip active" : "chip"}
            onClick={() => setTargetLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="field-row">
        <input
          placeholder="Или укажи язык сам (например: испанский)"
          value={customLang}
          onChange={(e) => {
            setCustomLang(e.target.value);
            setTargetLang(e.target.value || null);
          }}
        />
      </div>

      <textarea
        className="textarea"
        placeholder="Текст для перевода…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
      />

      <button className="btn-primary" onClick={doTranslate} disabled={loading}>
        {loading ? "Перевожу…" : "Перевести"}
      </button>

      {result && (
        <div className="result-card">
          <p className="result-label">Перевод</p>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

// ==================== Промпты ====================

function PromptsView() {
  const [topics, setTopics] = useState(null);
  const [topic, setTopic] = useState(null);
  const [target, setTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Шаг "кадры сцены" — только для темы "video"
  const [framesChoice, setFramesChoice] = useState(null); // null | "skip" | "done"
  const [firstFrameFile, setFirstFrameFile] = useState(null);
  const [lastFrameFile, setLastFrameFile] = useState(null);
  const [frameDescription, setFrameDescription] = useState("");
  const [framesLoading, setFramesLoading] = useState(false);

  // С чего начинаем — с чистого листа или прокачиваем уже готовый черновик
  const [startMode, setStartMode] = useState(null); // null | "fresh" | "improve"
  const [draftText, setDraftText] = useState("");
  const [improving, setImproving] = useState(false);

  useEffect(() => {
    api.promptTopics().then(setTopics).catch(() => setTopics({}));
  }, []);

  function resetToTopics() {
    setTopic(null);
    setTarget(null);
    setHistory([]);
    setFramesChoice(null);
    setFirstFrameFile(null);
    setLastFrameFile(null);
    setFrameDescription("");
    setStartMode(null);
    setDraftText("");
  }

  async function submitImprove() {
    if (improving || !draftText.trim()) return;
    setImproving(true);
    try {
      const { reply } = await api.improvePrompt(topic, target, draftText);
      setHistory([
        { role: "user", content: draftText },
        { role: "assistant", content: reply },
      ]);
    } catch (e) {
      setHistory([{ role: "assistant", content: "Ошибка: " + e.message }]);
    } finally {
      setImproving(false);
    }
  }

  async function submitFrames() {
    if (framesLoading) return;
    setFramesLoading(true);
    try {
      const { reply } = await api.promptVideoFrames(target, frameDescription, firstFrameFile, lastFrameFile);
      setHistory([
        { role: "user", content: frameDescription || "[Прислал кадры сцены]" },
        { role: "assistant", content: reply },
      ]);
      setFramesChoice("done");
    } catch (e) {
      setHistory([{ role: "assistant", content: "Ошибка: " + e.message }]);
      setFramesChoice("done");
    } finally {
      setFramesLoading(false);
    }
  }

  async function send(text) {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    const nextHistory = [...history, { role: "user", content: value }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.prompt(topic, target, nextHistory);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "assistant", content: "Ошибка: " + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function saveLast() {
    const lastBot = [...history].reverse().find((m) => m.role === "assistant");
    if (!lastBot) return;
    try {
      await api.addFavorite(lastBot.content, topic);
      setSavedMsg("Сохранено ⭐");
      setTimeout(() => setSavedMsg(""), 2000);
    } catch (e) {
      setSavedMsg("Ошибка сохранения");
    }
  }

  if (!topics) {
    return (
      <div className="view">
        <ScreenHeader title="Промпты" />
        <p className="empty-hint">Загрузка тем…</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="view">
        <ScreenHeader title="Промпты" subtitle="Выбери направление" />
        <div className="topic-grid">
          {Object.entries(topics).map(([key, cfg]) => (
            <button key={key} className="topic-card" onClick={() => setTopic(key)}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!target) {
    return (
      <div className="view">
        <ScreenHeader title={topics[topic].label} subtitle="Выбери версию / нейросеть" />
        <div className="chip-row">
          {topics[topic].targets.map((t) => (
            <button key={t} className="chip" onClick={() => setTarget(t)}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn-ghost" onClick={resetToTopics}>
          ◀️ К темам
        </button>
      </div>
    );
  }

  if (!startMode) {
    return (
      <div className="view">
        <ScreenHeader title={`${topics[topic].label} · ${target}`} subtitle="Как начнём?" />
        <div className="chip-row">
          <button className="chip" onClick={() => setStartMode("fresh")}>
            💬 Начать с чистого листа
          </button>
          <button className="chip" onClick={() => setStartMode("improve")}>
            ✨ Улучшить готовый черновик
          </button>
        </div>
        <button className="btn-ghost" onClick={resetToTopics}>
          ◀️ К темам
        </button>
      </div>
    );
  }

  if (startMode === "improve" && history.length === 0) {
    return (
      <div className="view">
        <ScreenHeader title={`${topics[topic].label} · ${target}`} subtitle="Вставь черновик — нейросеть его прокачает" />
        <textarea
          className="textarea"
          rows={6}
          placeholder="Вставь свой черновик промпта — даже сырой и неполный…"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
        />
        <button className="btn-primary" disabled={!draftText.trim() || improving} onClick={submitImprove}>
          {improving ? "Прокачиваю…" : "✨ Прокачать промпт"}
        </button>
        <button className="btn-ghost" onClick={() => setStartMode(null)}>
          ◀️ Назад
        </button>
      </div>
    );
  }

  if (topic === "video" && framesChoice === null && startMode === "fresh") {
    return (
      <div className="view">
        <ScreenHeader
          title={`${topics[topic].label} · ${target}`}
          subtitle="Есть у тебя референсные кадры сцены?"
        />
        <p className="step-question">
          Пришли картинками первый и/или последний кадр сцены — учту их визуально при составлении
          промпта. Можно указать только один кадр, оба, или пропустить и просто описать словами.
        </p>

        <div className="field-row">
          <label className="empty-hint" style={{ display: "block", marginBottom: 6 }}>
            Первый кадр (необязательно)
          </label>
          <input type="file" accept="image/*" onChange={(e) => setFirstFrameFile(e.target.files[0] || null)} />
        </div>
        <div className="field-row">
          <label className="empty-hint" style={{ display: "block", marginBottom: 6 }}>
            Последний кадр (необязательно)
          </label>
          <input type="file" accept="image/*" onChange={(e) => setLastFrameFile(e.target.files[0] || null)} />
        </div>

        <textarea
          className="textarea"
          placeholder="Опиши сцену словами (что происходит, движение камеры и т.д.)…"
          value={frameDescription}
          onChange={(e) => setFrameDescription(e.target.value)}
          rows={4}
        />

        <div className="inline-actions">
          <button
            className="btn-primary"
            onClick={submitFrames}
            disabled={framesLoading || (!firstFrameFile && !lastFrameFile && !frameDescription.trim())}
          >
            {framesLoading ? "Составляю…" : "Составить промпт"}
          </button>
          <button className="btn-ghost" onClick={() => setFramesChoice("skip")}>
            ✏️ Только словами, без кадров
          </button>
        </div>
        <button className="btn-ghost" onClick={resetToTopics}>
          ◀️ К темам
        </button>
      </div>
    );
  }

  const lastReply = [...history].reverse().find((m) => m.role === "assistant");
  const isFinal = lastReply?.content.includes("ГОТОВЫЙ ПРОМПТ:");

  return (
    <div className="view">
      <ScreenHeader title={`${topics[topic].label} · ${target}`} />
      <div className="chat-log">
        {history.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content}
          </Bubble>
        ))}
        {loading && <Bubble role="assistant">думаю…</Bubble>}
      </div>

      {isFinal && (
        <div className="inline-actions">
          <button className="btn-secondary" onClick={saveLast}>
            ⭐ Сохранить в избранное
          </button>
          {savedMsg && <span className="saved-msg">{savedMsg}</span>}
        </div>
      )}

      <div className="composer">
        <input
          placeholder="Ответь боту…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn-primary" onClick={() => send()} disabled={loading}>
          Отправить
        </button>
      </div>
      <button className="btn-ghost" onClick={resetToTopics}>
        🔄 Сменить тему
      </button>
    </div>
  );
}

// ==================== Обложка трека ====================

function CoverView() {
  const [step, setStep] = useState("lyrics");
  const [lyrics, setLyrics] = useState("");
  const [wantsPhoto, setWantsPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [wantsText, setWantsText] = useState(null);
  const [coverText, setCoverText] = useState("");
  const [formats, setFormats] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.coverFormats().then(setFormats).catch(() => setFormats({}));
  }, []);

  function reset() {
    setStep("lyrics");
    setLyrics("");
    setWantsPhoto(null);
    setPhotoFile(null);
    setPhotoBase64(null);
    setWantsText(null);
    setCoverText("");
    setResult("");
  }

  function onPhotoChosen(file) {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  }

  async function generate(ratio) {
    setLoading(true);
    try {
      const { reply } = await api.cover({
        lyrics,
        ratio,
        cover_text: wantsText ? coverText : null,
        photo_base64: wantsPhoto ? photoBase64 : null,
      });
      setResult(reply);
      setStep("result");
    } catch (e) {
      setResult("Ошибка: " + e.message);
      setStep("result");
    } finally {
      setLoading(false);
    }
  }

  async function saveResult() {
    try {
      await api.addFavorite(result, "cover");
    } catch {
      /* тихо игнорируем — не критично */
    }
  }

  return (
    <div className="view">
      <ScreenHeader title="Обложка трека" subtitle="Промпт для ChatGPT Image 2" />

      {step === "lyrics" && (
        <>
          <textarea
            className="textarea"
            rows={6}
            placeholder="Вставь текст песни (лирику)…"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
          />
          <button
            className="btn-primary"
            disabled={!lyrics.trim()}
            onClick={() => setStep("photo")}
          >
            Далее
          </button>
        </>
      )}

      {step === "photo" && (
        <>
          <p className="step-question">Хочешь добавить референсное фото?</p>
          <div className="chip-row">
            <button className="chip" onClick={() => setStep("photo-upload")}>
              📸 Да, добавлю фото
            </button>
            <button
              className="chip"
              onClick={() => {
                setWantsPhoto(false);
                setStep("text");
              }}
            >
              ⏭ Без фото
            </button>
          </div>
        </>
      )}

      {step === "photo-upload" && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && onPhotoChosen(e.target.files[0])}
          />
          <button
            className="btn-primary"
            disabled={!photoFile}
            onClick={() => {
              setWantsPhoto(true);
              setStep("text");
            }}
          >
            Далее
          </button>
        </>
      )}

      {step === "text" && (
        <>
          <p className="step-question">Нужен текст на самой обложке?</p>
          <div className="chip-row">
            <button className="chip" onClick={() => setStep("text-input")}>
              ✏️ Указать текст
            </button>
            <button
              className="chip"
              onClick={() => {
                setWantsText(false);
                setStep("format");
              }}
            >
              🚫 Без текста
            </button>
          </div>
        </>
      )}

      {step === "text-input" && (
        <>
          <input
            placeholder="Например: Полночь — Иван Соколов"
            value={coverText}
            onChange={(e) => setCoverText(e.target.value)}
          />
          <button
            className="btn-primary"
            disabled={!coverText.trim()}
            onClick={() => {
              setWantsText(true);
              setStep("format");
            }}
          >
            Далее
          </button>
        </>
      )}

      {step === "format" && formats && (
        <>
          <p className="step-question">Выбери формат обложки</p>
          <div className="chip-row">
            {Object.entries(formats).map(([ratio, label]) => (
              <button key={ratio} className="chip" disabled={loading} onClick={() => generate(ratio)}>
                {label}
              </button>
            ))}
          </div>
          {loading && <p className="empty-hint">Собираю промпт…</p>}
        </>
      )}

      {step === "result" && (
        <>
          <div className="result-card">
            <p>{result}</p>
          </div>
          <div className="inline-actions">
            <button className="btn-secondary" onClick={saveResult}>
              ⭐ Сохранить в избранное
            </button>
            <button className="btn-ghost" onClick={reset}>
              🔄 Новая обложка
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== Избранное ====================

function FavoritesView() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState(null);
  const [publishMsg, setPublishMsg] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  const load = useCallback(() => {
    api
      .listFavorites()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function remove(id) {
    await api.deleteFavorite(id);
    load();
  }

  async function clearAll() {
    await api.clearFavorites();
    load();
  }

  async function publish(id) {
    setPublishingId(id);
    setPublishMsg((m) => ({ ...m, [id]: "" }));
    try {
      const res = await api.publishToGallery(id);
      setPublishMsg((m) => ({
        ...m,
        [id]:
          res.status === "approved"
            ? "✅ Опубликовано в галерее!"
            : `🚫 Отклонено модерацией: ${res.reject_reason || "нарушение правил"}`,
      }));
    } catch (e) {
      setPublishMsg((m) => ({ ...m, [id]: "Ошибка: " + e.message }));
    } finally {
      setPublishingId(null);
    }
  }

  const presentCategories = [...new Set((items || []).map((i) => i.category || "other"))];
  const visibleItems = activeCategory ? (items || []).filter((i) => (i.category || "other") === activeCategory) : items;

  return (
    <div className="view">
      <ScreenHeader title="Избранное" subtitle="Сохранённые промпты, разложенные по папкам" />
      {error && <p className="form-error">{error}</p>}
      {items && items.length === 0 && (
        <p className="empty-hint">Пока пусто. Сохраняй промпты кнопкой ⭐ под готовым результатом.</p>
      )}

      {items && items.length > 0 && (
        <div className="chip-row">
          <button className={activeCategory === null ? "chip active" : "chip"} onClick={() => setActiveCategory(null)}>
            Все ({items.length})
          </button>
          {presentCategories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "chip active" : "chip"}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      <div className="fav-list">
        {visibleItems?.map((item) => (
          <div key={item.id} className="fav-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <p className="empty-hint" style={{ fontSize: 12, margin: "0 0 4px" }}>
              {CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other}
            </p>
            <p>{item.content}</p>
            <div className="inline-actions" style={{ marginTop: 8 }}>
              <button className="btn-ghost small" onClick={() => remove(item.id)}>
                Удалить
              </button>
              <button
                className="btn-secondary"
                disabled={publishingId === item.id}
                onClick={() => publish(item.id)}
                style={{ padding: "6px 14px", fontSize: 13 }}
              >
                {publishingId === item.id ? "Публикую…" : "📢 В галерею"}
              </button>
              {publishMsg[item.id] && <span className="saved-msg">{publishMsg[item.id]}</span>}
            </div>
          </div>
        ))}
      </div>
      {items && items.length > 0 && (
        <button className="btn-ghost" onClick={clearAll}>
          🗑 Очистить всё
        </button>
      )}
    </div>
  );
}

// ==================== Аккаунт ====================

function AccountView({ user, onUserUpdate, onLogout, viewMode, onToggleViewMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_base64 || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [achievements, setAchievements] = useState(null);

  useEffect(() => {
    api.listAchievements().then(setAchievements).catch(() => setAchievements([]));
  }, []);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileError("");
    setProfileMsg("");
    setProfileLoading(true);
    try {
      await api.updateProfile(displayName, avatarFile);
      const updated = await api.me();
      onUserUpdate(updated);
      setProfileMsg("Профиль сохранён!");
      setAvatarFile(null);
    } catch (e) {
      setProfileError(e.message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLinkEmail(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.linkEmail(email, password);
      const updated = await api.me();
      onUserUpdate(updated);
      setSuccess("Email привязан! Теперь можно входить и по нему.");
      setEmail("");
      setPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    setPwLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwSuccess("Пароль изменён.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="view">
      <ScreenHeader title="Аккаунт" subtitle="Способы входа в этот аккаунт" />

      {typeof user.level === "number" && (
        <div className="result-card">
          <div className="inline-actions" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <p className="result-label" style={{ margin: 0 }}>
              Уровень {user.level} · {user.level_title}
            </p>
            {user.current_streak > 0 && <span className="streak-badge">🔥 {user.current_streak} дней подряд</span>}
          </div>
          <div className="xp-bar-track" style={{ marginBottom: 4 }}>
            <div
              className="xp-bar-fill"
              style={{ width: `${Math.min(100, (user.xp / Math.max(user.xp_for_next_level, 1)) * 100)}%` }}
            />
          </div>
          <p className="empty-hint" style={{ margin: 0, fontSize: 12 }}>
            {user.xp} / {user.xp_for_next_level} XP до следующего уровня
          </p>
        </div>
      )}

      {achievements && (
        <>
          <p className="step-question">Достижения</p>
          <div className="achievements-grid">
            {achievements.map((a) => (
              <div key={a.key} className={a.earned ? "achievement-card earned" : "achievement-card"} title={a.desc}>
                <span className="achievement-icon">{a.label.split(" ")[0]}</span>
                <span className="achievement-name">{a.label.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="step-question">🎨 Магазин оформления</p>
      <div className="result-card shop-teaser">
        <p style={{ marginTop: 0 }}>Рамки для аватарки, значки и цветные ники — совсем скоро ✨</p>
        <div className="chip-row" style={{ marginBottom: 0 }}>
          <span className="chip shop-preview-item">🖼 Неоновая рамка</span>
          <span className="chip shop-preview-item">💎 Бейдж "VIP"</span>
          <span className="chip shop-preview-item">🌈 Цветной ник</span>
          <span className="chip shop-preview-item">✨ Анимированный аватар</span>
        </div>
      </div>

      <p className="step-question">Профиль</p>
      <form onSubmit={handleSaveProfile} className="auth-form" style={{ marginBottom: 20 }}>
        <div className="inline-actions">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt=""
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <span
              className="user-avatar"
              style={{ width: 64, height: 64, fontSize: 24 }}
            >
              {(displayName || user.email || "Б")[0]?.toUpperCase()}
            </span>
          )}
          <label className="btn-secondary" style={{ cursor: "pointer" }}>
            Выбрать фото
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </label>
        </div>
        <input
          placeholder="Как тебя называть?"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
        />
        {profileError && <p className="form-error">{profileError}</p>}
        {profileMsg && <p className="saved-msg">{profileMsg}</p>}
        <button type="submit" className="btn-primary" disabled={profileLoading}>
          {profileLoading ? "Сохраняю…" : "Сохранить профиль"}
        </button>
      </form>

      <div className="result-card">
        <p>
          <strong>Telegram:</strong>{" "}
          {user.telegram_username || user.telegram_first_name
            ? `подключён (${user.telegram_first_name || ""} ${
                user.telegram_username ? "@" + user.telegram_username : ""
              })`
            : "не подключён"}
        </p>
        <p>
          <strong>Email:</strong> {user.email || "не привязан"}
        </p>
      </div>

      {user.email ? (
        <>
          <p className="empty-hint">
            Email уже привязан — можешь входить на сайт как через Telegram, так и по email и паролю.
          </p>

          {!showChangePassword ? (
            <button className="btn-secondary" onClick={() => setShowChangePassword(true)}>
              🔑 Сменить пароль
            </button>
          ) : (
            <>
              <p className="step-question">Смена пароля</p>
              <form onSubmit={handleChangePassword} className="auth-form">
                <input
                  type="password"
                  placeholder="Текущий пароль"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
                {pwError && <p className="form-error">{pwError}</p>}
                {pwSuccess && <p className="saved-msg">{pwSuccess}</p>}
                <div className="inline-actions">
                  <button type="submit" className="btn-primary" disabled={pwLoading}>
                    {pwLoading ? "Секунду…" : "Сохранить новый пароль"}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPwError("");
                      setPwSuccess("");
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      ) : (
        <>
          <p className="step-question">
            Привяжи email и пароль к этому аккаунту — тогда сможешь зайти сюда же,
            даже если временно не будет доступа к Telegram.
          </p>
          <form onSubmit={handleLinkEmail} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Придумай пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && <p className="form-error">{error}</p>}
            {success && <p className="saved-msg">{success}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Секунду…" : "Привязать email"}
            </button>
          </form>
        </>
      )}

      <div className="inline-actions" style={{ marginTop: 24 }}>
        <button className="device-toggle-btn" onClick={onToggleViewMode}>
          {viewMode === "mobile" ? "🖥 Версия для ПК" : "📱 Мобильная версия"}
        </button>
        <button className="btn-ghost" onClick={onLogout}>
          🚪 Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

// ==================== Галерея промптов ====================

function GalleryView({ isAdmin }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    api
      .listGallery(search)
      .then(setPosts)
      .catch((e) => setError(e.message));
  }, [search]);

  useEffect(load, [load]);

  async function react(postId, emoji) {
    try {
      const res = await api.reactToGalleryPost(postId, emoji);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, reactions: res.reactions, my_reaction: res.my_reaction } : p))
      );
    } catch (err) {
      alert("Не удалось поставить реакцию: " + err.message);
    }
  }

  if (selectedId) {
    return (
      <GalleryPostDetail
        isAdmin={isAdmin}
        postId={selectedId}
        onBack={() => {
          setSelectedId(null);
          load();
        }}
      />
    );
  }

  const presentCategories = [...new Set((posts || []).map((p) => p.category || "other"))];
  const visiblePosts = activeCategory ? (posts || []).filter((p) => (p.category || "other") === activeCategory) : posts;

  return (
    <div className="view">
      <ScreenHeader title="Галерея" subtitle="Промпты, которыми поделились пользователи" />
      <div className="composer" style={{ marginBottom: 12 }}>
        <input
          placeholder="🔍 Поиск по промптам…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
        />
        <button className="btn-secondary" onClick={() => setSearch(searchInput)}>
          Найти
        </button>
        {search && (
          <button
            className="btn-ghost"
            onClick={() => {
              setSearchInput("");
              setSearch("");
            }}
          >
            ✕
          </button>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      {posts && posts.length === 0 && (
        <p className="empty-hint">
          {search
            ? `Ничего не нашлось по запросу «${search}».`
            : 'Пока пусто — опубликуй что-нибудь из "Избранного" кнопкой "📢 В галерею".'}
        </p>
      )}

      {posts && posts.length > 0 && (
        <div className="chip-row">
          <button className={activeCategory === null ? "chip active" : "chip"} onClick={() => setActiveCategory(null)}>
            Все ({posts.length})
          </button>
          {presentCategories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "chip active" : "chip"}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      <div className="fav-list">
        {visiblePosts?.map((post) => (
          <button
            key={post.id}
            className="fav-item"
            style={{ textAlign: "left", cursor: "pointer", flexDirection: "column", alignItems: "stretch" }}
            onClick={() => setSelectedId(post.id)}
          >
            <p className="empty-hint" style={{ fontSize: 12, margin: "0 0 4px" }}>
              {CATEGORY_LABELS[post.category] || CATEGORY_LABELS.other}
            </p>
            <p style={{ margin: 0 }}>
              {post.content.length > 220 ? post.content.slice(0, 220) + "…" : post.content}
            </p>
            <div className="inline-actions" style={{ marginTop: 8 }}>
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt=""
                  style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : null}
              <span
                className="empty-hint clickable-name"
                style={{ fontSize: 13 }}
                onClick={(e) => {
                  e.stopPropagation();
                  openProfile(post.author_id);
                }}
              >
                {post.is_mine ? "Ты" : post.author}
              </span>
              <LevelBadge level={post.author_level} />
              <CustomBadge badge={post.author_badge} />
              <ReactionPicker
                reactions={post.reactions}
                myReaction={post.my_reaction}
                onReact={(emoji) => react(post.id, emoji)}
              />
              <span className="empty-hint" style={{ fontSize: 13 }}>
                💬 {post.comment_count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryPostDetail({ postId, onBack, isAdmin }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");

  const load = useCallback(() => {
    api
      .getGalleryPost(postId)
      .then(setPost)
      .catch((e) => setError(e.message));
  }, [postId]);

  useEffect(load, [load]);

  async function sendComment() {
    const text = comment.trim();
    if (!text || sending) return;
    setSending(true);
    setCommentMsg("");
    try {
      const res = await api.addGalleryComment(postId, text);
      if (res.status === "approved") {
        setComment("");
        setCommentMsg("");
        load();
      } else {
        setCommentMsg(`🚫 Комментарий отклонён модерацией: ${res.reject_reason || "нарушение правил"}`);
      }
    } catch (e) {
      setCommentMsg("Ошибка: " + e.message);
    } finally {
      setSending(false);
    }
  }

  async function removePost() {
    if (!window.confirm("Удалить этот пост из галереи?")) return;
    try {
      await api.deleteGalleryPost(postId);
      onBack();
    } catch (e) {
      alert("Не удалось удалить: " + e.message);
    }
  }

  async function removeComment(commentId) {
    if (!window.confirm("Удалить этот комментарий?")) return;
    try {
      await api.deleteGalleryComment(postId, commentId);
      load();
    } catch (e) {
      alert("Не удалось удалить: " + e.message);
    }
  }

  async function react(emoji) {
    try {
      const res = await api.reactToGalleryPost(postId, emoji);
      setPost((p) => ({ ...p, reactions: res.reactions, my_reaction: res.my_reaction }));
    } catch (e) {
      alert("Не удалось поставить реакцию: " + e.message);
    }
  }

  return (
    <div className="view">
      <ScreenHeader title="Галерея" subtitle="Пост и комментарии" />
      {error && <p className="form-error">{error}</p>}
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 10 }}>
        ◀️ Назад к галерее
      </button>

      {post && (
        <>
          <div className="result-card">
            <div className="inline-actions" style={{ marginBottom: 6 }}>
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt=""
                  style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : null}
              <p
                className="result-label clickable-name"
                style={{ margin: 0 }}
                onClick={() => openProfile(post.author_id)}
              >
                {post.is_mine ? "Ты" : post.author}
              </p>
              <LevelBadge level={post.author_level} />
              <CustomBadge badge={post.author_badge} />
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
            <div className="inline-actions" style={{ marginTop: 10 }}>
              <ReactionPicker reactions={post.reactions} myReaction={post.my_reaction} onReact={react} />
            </div>
          </div>

          {(post.is_mine || isAdmin) && (
            <button className="btn-ghost" onClick={removePost}>
              {isAdmin && !post.is_mine ? "🛡 Удалить пост (модерация)" : "🗑 Удалить пост"}
            </button>
          )}

          <p className="step-question" style={{ marginTop: 16 }}>
            Комментарии ({post.comments.length})
          </p>
          <div className="fav-list">
            {post.comments.length === 0 && <p className="empty-hint">Пока нет комментариев.</p>}
            {post.comments.map((c) => (
              <div key={c.id} className="fav-item">
                {c.author_avatar ? (
                  <img
                    src={c.author_avatar}
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : null}
                <div style={{ flex: 1 }}>
                  <p className="result-label" style={{ marginBottom: 4 }}>
                    <span className="clickable-name" onClick={() => openProfile(c.author_id)}>
                      {c.author}
                    </span>{" "}
                    <LevelBadge level={c.author_level} /> <CustomBadge badge={c.author_badge} />
                  </p>
                  <p>{c.content}</p>
                </div>
                {isAdmin && (
                  <button className="btn-ghost small" onClick={() => removeComment(c.id)} title="Удалить (модерация)">
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="composer" style={{ marginTop: 12 }}>
            <input
              placeholder="Написать комментарий…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
            />
            <button className="btn-primary" onClick={sendComment} disabled={sending}>
              {sending ? "…" : "Отправить"}
            </button>
          </div>
          {commentMsg && <p className="form-error">{commentMsg}</p>}
        </>
      )}
    </div>
  );
}

// ==================== Общий публичный чат ====================

function ChatWidget({ isAdmin, isMobile }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [unseen, setUnseen] = useState(0);
  const [toast, setToast] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem("botyara_chat_widget_pos");
      if (!saved) return null;
      const p = JSON.parse(saved);
      return {
        x: Math.min(Math.max(0, p.x), window.innerWidth - 56),
        y: Math.min(Math.max(0, p.y), window.innerHeight - 56),
      };
    } catch {
      return null;
    }
  });
  const endRef = useRef(null);
  const lastCountRef = useRef(0);
  const openRef = useRef(false);
  const toastTimerRef = useRef(null);
  const bubbleRef = useRef(null);
  const dragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  openRef.current = open;

  function handleBubblePointerDown(e) {
    const rect = bubbleRef.current.getBoundingClientRect();
    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    window.addEventListener("pointermove", handleBubblePointerMove);
    window.addEventListener("pointerup", handleBubblePointerUp);
  }

  function handleBubblePointerMove(e) {
    const d = dragRef.current;
    if (!d.dragging) return;
    if (!d.moved && (Math.abs(e.clientX - d.startX) > 4 || Math.abs(e.clientY - d.startY) > 4)) {
      d.moved = true;
    }
    if (d.moved) {
      const size = 56;
      const x = Math.min(Math.max(0, e.clientX - d.offsetX), window.innerWidth - size);
      const y = Math.min(Math.max(0, e.clientY - d.offsetY), window.innerHeight - size);
      setPos({ x, y });
    }
  }

  function handleBubblePointerUp() {
    const d = dragRef.current;
    window.removeEventListener("pointermove", handleBubblePointerMove);
    window.removeEventListener("pointerup", handleBubblePointerUp);
    if (d.moved) {
      setPos((p) => {
        if (p) localStorage.setItem("botyara_chat_widget_pos", JSON.stringify(p));
        return p;
      });
    } else {
      // не двигали — значит это был обычный клик, открываем чат
      setOpen(true);
    }
    dragRef.current.dragging = false;
  }

  const load = useCallback(() => {
    api
      .listPublicChat()
      .then((data) => {
        setMessages((prev) => {
          // Если только что отправили сообщение оптимистично (temp-id) — не откатываем его
          // назад в "пусто", пока сервер не догонит, просто заменяем на настоящий список
          return data;
        });
        if (data.length > lastCountRef.current) {
          const freshOnes = data.slice(lastCountRef.current);
          const freshFromOthers = freshOnes.filter((m) => !m.is_mine);
          if (!openRef.current && freshFromOthers.length > 0) {
            setUnseen((u) => u + freshFromOthers.length);
          }
          if (freshFromOthers.length > 0) {
            const last = freshFromOthers[freshFromOthers.length - 1];
            showToast(last.author, last.content);
          }
        }
        lastCountRef.current = data.length;
      })
      .catch((e) => setError(e.message));
  }, []);

  function showToast(author, content) {
    clearTimeout(toastTimerRef.current);
    setToast({ author, content: content.length > 70 ? content.slice(0, 70) + "…" : content });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 2500); // быстрее, чем раньше (было 5с) — чат ощущается живее
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (open) {
      setUnseen(0);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    setSending(true);
    setSendError("");
    setInput("");

    // Оптимистичное сообщение — появляется в чате мгновенно, ещё до ответа сервера
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, content: text, author: "Ты", is_mine: true, author_avatar: null, created_at: new Date().toISOString() },
    ]);

    try {
      const res = await api.sendPublicChat(text);
      if (res.status === "approved") {
        load(); // подтягиваем настоящую версию с сервера (с реальным id и т.д.)
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setSendError(`🚫 ${res.reject_reason || "Отклонено модерацией"}`);
      }
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setSendError("Ошибка: " + e.message);
    } finally {
      setSending(false);
    }
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
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const { text } = await api.transcribeVoice(blob);
          if (text && text.trim()) await send(text.trim());
        } catch (e) {
          setSendError("Не удалось распознать голос: " + e.message);
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Не удалось получить доступ к микрофону: " + e.message);
    }
  }

  async function removeMessage(id) {
    try {
      await api.deletePublicChatMessage(id);
      load();
    } catch (e) {
      alert("Не удалось удалить: " + e.message);
    }
  }

  async function clearAll() {
    if (!window.confirm("Очистить весь общий чат для всех пользователей?")) return;
    try {
      await api.clearPublicChat();
      load();
    } catch (e) {
      alert("Не удалось очистить: " + e.message);
    }
  }

  return (
    <div className="chat-widget" style={!open && pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}>
      {toast && !open && (
        <div className="chat-widget-toast" onClick={() => setOpen(true)}>
          <span className="chat-widget-toast-author">💬 {toast.author}</span>
          <span className="chat-widget-toast-text">{toast.content}</span>
        </div>
      )}
      {!open && (
        <button
          ref={bubbleRef}
          className="chat-widget-bubble"
          onPointerDown={handleBubblePointerDown}
          title="Общий чат — клик открывает, перетаскивание перемещает"
        >
          💬
          {unseen > 0 && <span className="chat-widget-badge">{unseen > 9 ? "9+" : unseen}</span>}
        </button>
      )}
      {open && (
        <div className={isMobile ? "chat-widget-panel chat-widget-panel-mobile" : "chat-widget-panel"}>
          <div className="chat-widget-header">
            <span>🌍 Общий чат</span>
            <div className="inline-actions" style={{ gap: 8 }}>
              {isAdmin && (
                <button className="chat-widget-close" onClick={clearAll} title="Очистить весь чат (админ)">
                  🧹
                </button>
              )}
              <button className="chat-widget-close" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>
          {error && <p className="form-error" style={{ margin: "6px 10px" }}>{error}</p>}
          <div className="chat-widget-messages">
            {messages.length === 0 && <p className="empty-hint">Пока пусто — напиши первым 👋</p>}
            {messages.map((m) => (
              <div key={m.id} className={m.is_mine ? "chat-widget-msg mine" : "chat-widget-msg"}>
                {m.author_avatar ? (
                  <img src={m.author_avatar} alt="" className="chat-widget-avatar" />
                ) : (
                  <span className="chat-widget-avatar-fallback">{m.author?.[0]?.toUpperCase()}</span>
                )}
                <div>
                  <p className="chat-widget-author">
                    <span className="clickable-name" onClick={() => openProfile(m.author_id)}>
                      {m.author}
                    </span>{" "}
                    <LevelBadge level={m.author_level} /> <CustomBadge badge={m.author_badge} />
                  </p>
                  <p className="chat-widget-bubble-text">{m.content}</p>
                  {(m.is_mine || isAdmin) && (
                    <button
                      className="btn-ghost small"
                      onClick={() => removeMessage(m.id)}
                      style={{ fontSize: 11, padding: "2px 4px" }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="chat-widget-composer">
            <input
              placeholder={isRecording ? "🔴 Идёт запись…" : transcribing ? "Распознаю…" : "Написать…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={isRecording || transcribing}
            />
            <button
              className={isRecording ? "btn-secondary" : "btn-ghost"}
              onClick={toggleVoiceInput}
              disabled={transcribing}
              title="Голосовое сообщение"
              style={isRecording ? { color: "#f87171" } : undefined}
            >
              {isRecording ? "⏹" : "🎤"}
            </button>
            <button className="btn-primary" onClick={() => send()} disabled={sending || isRecording || transcribing}>
              ➤
            </button>
          </div>
          {sendError && <p className="form-error" style={{ margin: "4px 10px" }}>{sendError}</p>}
        </div>
      )}
    </div>
  );
}

// ==================== Верхняя панель: уведомления, связь, поддержка ====================

// Кнопка со всплывающим окошком "как со мной связаться" — переиспользуется и в верхней панели, и в сайдбаре
function ContactButton({ className, intro, panelStyle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className={className} onClick={() => setOpen((v) => !v)}>
        {children}
      </button>
      {open && (
        <div className="contact-popover" style={panelStyle}>
          <div className="inline-actions" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Связаться с автором</strong>
            <button className="btn-ghost small" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          {intro && (
            <p className="empty-hint" style={{ marginTop: 0, marginBottom: 10 }}>
              {intro}
            </p>
          )}
          <a
            className="btn-secondary"
            href={AUTHOR_TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", textAlign: "center", marginBottom: 8, textDecoration: "none" }}
          >
            💬 Написать в Telegram
          </a>
          <a
            className="btn-secondary"
            href={`mailto:${AUTHOR_EMAIL}`}
            style={{ display: "block", textAlign: "center", textDecoration: "none" }}
          >
            ✉️ Написать на почту
          </a>
        </div>
      )}
    </div>
  );
}

function TopBar() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [unseen, setUnseen] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [celebration, setCelebration] = useState(null);

  function getHiddenAnnouncementIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem("botyara_hidden_announcements") || "[]"));
    } catch {
      return new Set();
    }
  }

  function getCelebratedIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem("botyara_celebrated_achievements") || "[]"));
    } catch {
      return new Set();
    }
  }

  const load = useCallback(() => {
    Promise.all([api.listAnnouncements(), api.listNotifications()])
      .then(([announcements, notifications]) => {
        const hidden = getHiddenAnnouncementIds();
        const merged = [
          ...announcements
            .filter((a) => !hidden.has(a.id))
            .map((a) => ({ uid: `a-${a.id}`, content: a.content, created_at: a.created_at, icon: "📢" })),
          ...notifications.map((n) => ({ uid: `n-${n.id}`, content: n.content, created_at: n.created_at, icon: "" })),
        ].sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
        setItems(merged);
        const lastSeenTime = Number(localStorage.getItem("botyara_last_seen_time") || 0);
        const newer = merged.filter((i) => new Date(i.created_at).getTime() > lastSeenTime).length;
        setUnseen(newer);

        // Празднуем новое достижение всплывающим эффектом (один раз на каждое)
        const celebrated = getCelebratedIds();
        const freshAchievement = notifications.find(
          (n) => n.content.startsWith("🏅 Новое достижение") && !celebrated.has(n.id)
        );
        if (freshAchievement) {
          celebrated.add(freshAchievement.id);
          localStorage.setItem("botyara_celebrated_achievements", JSON.stringify([...celebrated]));
          setCelebration(freshAchievement.content.replace("🏅 Новое достижение: ", ""));
          setTimeout(() => setCelebration(null), 3500);
        }
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        localStorage.setItem("botyara_last_seen_time", String(Date.now()));
        setUnseen(0);
      }
      return next;
    });
  }

  async function clearShade() {
    setClearing(true);
    try {
      // Личные уведомления удаляем на сервере
      await api.clearNotifications();
    } catch {
      /* не критично — всё равно скроем видимое ниже */
    }
    // Общие оповещения не удаляем для всех — просто скрываем у себя навсегда
    const hidden = getHiddenAnnouncementIds();
    (items || [])
      .filter((i) => i.uid.startsWith("a-"))
      .forEach((i) => hidden.add(Number(i.uid.slice(2))));
    localStorage.setItem("botyara_hidden_announcements", JSON.stringify([...hidden]));
    setItems([]);
    setUnseen(0);
    setClearing(false);
  }

  return (
    <>
      {celebration && (
        <div className="achievement-celebration">
          <div className="achievement-celebration-card">
            <div className="achievement-celebration-emoji">🏆</div>
            <p style={{ margin: "8px 0 0", fontWeight: 700 }}>Новое достижение!</p>
            <p style={{ margin: "4px 0 0" }}>{celebration}</p>
          </div>
        </div>
      )}
      <div className="top-actions">
      <div style={{ position: "relative" }}>
        <button className="top-action-btn" onClick={toggleOpen} title="Обновления и уведомления">
          🔔
          {unseen > 0 && <span className="top-action-badge">{unseen > 9 ? "9+" : unseen}</span>}
        </button>
        {open && (
          <div className="announcements-panel">
            <div className="inline-actions" style={{ justifyContent: "space-between", marginBottom: 4 }}>
              <p className="step-question" style={{ marginTop: 0, marginBottom: 0 }}>
                🔔 Обновления и уведомления
              </p>
              {items && items.length > 0 && (
                <button className="btn-ghost small" onClick={clearShade} disabled={clearing}>
                  {clearing ? "…" : "🗑 Очистить"}
                </button>
              )}
            </div>
            {items === null && <p className="empty-hint">Загружаю…</p>}
            {items && items.length === 0 && <p className="empty-hint">Пока новостей нет.</p>}
            {items?.map((i) => (
              <div key={i.uid} className="fav-item" style={{ marginBottom: 8 }}>
                <p style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
                  {i.icon} {i.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <ContactButton
        className="top-action-btn"
        intro="Как удобнее написать — выбирай:"
        panelStyle={{ top: 50, right: 0 }}
      >
        ✉️
      </ContactButton>
      <ContactButton
        className="top-action-btn"
        intro="Спасибо, что хочешь поддержать проект! Просто напиши — подскажу, как это лучше сделать 💜"
        panelStyle={{ top: 50, right: 0 }}
      >
        💜
      </ContactButton>
      </div>
    </>
  );
}

// ==================== Админ-панель ====================

function AdminView({ isAdmin }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  const loadAll = useCallback(() => {
    Promise.all([api.adminStats(), api.adminUsers(), api.adminLeaderboard(), api.adminActivity()])
      .then(([s, u, l, a]) => {
        setStats(s);
        setUsers(u);
        setLeaderboard(l);
        setActivity(a);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const maxSignup = stats ? Math.max(1, ...stats.signups_by_day.map((d) => d.count)) : 1;

  return (
    <div className="view bt-wide">
      <ScreenHeader title="Админка" subtitle="Статистика и активность проекта" />
      {error && <p className="form-error">{error}</p>}

      {stats && (
        <div className="admin-stat-grid">
          <div className="admin-stat-card online">
            <span className="admin-stat-value">{stats.online_now}</span>
            <span className="admin-stat-label">🟢 Онлайн сейчас</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_users}</span>
            <span className="admin-stat-label">👥 Всего пользователей</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.new_today}</span>
            <span className="admin-stat-label">🆕 Новых сегодня</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.new_week}</span>
            <span className="admin-stat-label">🆕 Новых за неделю</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.active_today}</span>
            <span className="admin-stat-label">✅ Активны сегодня</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.active_week}</span>
            <span className="admin-stat-label">✅ Активны за неделю</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_messages}</span>
            <span className="admin-stat-label">💬 Сообщений всего</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_gallery_posts}</span>
            <span className="admin-stat-label">🖼️ Постов в галерее</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_comments}</span>
            <span className="admin-stat-label">💭 Комментариев</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_likes}</span>
            <span className="admin-stat-label">❤️ Лайков</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_favorites}</span>
            <span className="admin-stat-label">⭐ В избранном</span>
          </div>
          <div className="admin-stat-card warn">
            <span className="admin-stat-value">{stats.rejected_today}</span>
            <span className="admin-stat-label">🚫 Отклонено сегодня</span>
          </div>
        </div>
      )}

      {stats && (
        <>
          <p className="step-question">Регистрации за 14 дней</p>
          <div className="admin-chart">
            {stats.signups_by_day.map((d) => (
              <div key={d.date} className="admin-chart-bar-wrap" title={`${d.date}: ${d.count}`}>
                <div
                  className="admin-chart-bar"
                  style={{ height: `${Math.max(4, (d.count / maxSignup) * 100)}%` }}
                />
                <span className="admin-chart-label">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="chip-row" style={{ marginTop: 20 }}>
        <button className={tab === "overview" ? "chip active" : "chip"} onClick={() => setTab("overview")}>
          📊 Модерация
        </button>
        <button className={tab === "users" ? "chip active" : "chip"} onClick={() => setTab("users")}>
          👥 Пользователи
        </button>
        <button className={tab === "leaderboard" ? "chip active" : "chip"} onClick={() => setTab("leaderboard")}>
          🏆 Топ по опыту
        </button>
        {isAdmin && (
          <button className={tab === "manage" ? "chip active" : "chip"} onClick={() => setTab("manage")}>
            🛡 Управление
          </button>
        )}
      </div>

      {tab === "manage" && isAdmin && <AdminUserManage />}

      {tab === "overview" && (
        <div className="fav-list" style={{ marginTop: 12 }}>
          {activity === null && <p className="empty-hint">Загружаю…</p>}
          {activity && activity.length === 0 && <p className="empty-hint">Пока пусто.</p>}
          {activity?.map((e, i) => (
            <div key={i} className="fav-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div className="inline-actions" style={{ justifyContent: "space-between" }}>
                <span className="empty-hint" style={{ fontSize: 12 }}>
                  {e.kind === "gallery_post" ? "🖼️ Пост" : e.kind === "gallery_comment" ? "💭 Комментарий" : "🌍 Общий чат"} ·{" "}
                  {e.author}
                </span>
                <span
                  className={e.status === "approved" ? "saved-msg" : "form-error"}
                  style={{ fontSize: 12, margin: 0 }}
                >
                  {e.status === "approved" ? "✅ одобрено" : `🚫 отклонено${e.reject_reason ? ": " + e.reject_reason : ""}`}
                </span>
              </div>
              <p style={{ marginTop: 6 }}>{e.content}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="fav-list" style={{ marginTop: 12 }}>
          {users?.map((u) => (
            <div key={u.id} className="fav-item">
              {u.avatar ? (
                <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span className="user-avatar">{u.name[0]?.toUpperCase()}</span>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {u.is_online && <span className="online-dot" title="Онлайн" />} {u.name} <LevelBadge level={u.level} />{" "}
                  {u.is_admin && "🛡"}
                </p>
                <p className="empty-hint" style={{ margin: 0, fontSize: 12 }}>
                  {u.email || ""} {u.telegram_username ? "@" + u.telegram_username : ""} · XP {u.xp} · 🔥{u.current_streak}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="fav-list" style={{ marginTop: 12 }}>
          {leaderboard?.map((u, i) => (
            <div key={u.id} className="fav-item">
              <span style={{ fontWeight: 900, fontSize: 18, width: 24, flexShrink: 0 }}>{i + 1}</span>
              {u.avatar ? (
                <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span className="user-avatar">{u.name[0]?.toUpperCase()}</span>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {u.name} <LevelBadge level={u.level} />
                </p>
              </div>
              <span className="empty-hint">{u.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Совместные комнаты ====================

const ROOM_CATEGORY_LABELS = {
  lyrics: "📝 Текст песни",
  suno: "🎵 Suno-промпт",
  image: "🖼 Картинка",
  video: "🎬 Видео",
  other: "💬 Общий промпт",
};

function RoomsView() {
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState("");
  const [activeCode, setActiveCode] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    api
      .listMyRooms()
      .then(setRooms)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function removeRoom(code, e) {
    e.stopPropagation();
    if (!window.confirm(`Удалить комнату ${code} целиком? Это нельзя отменить.`)) return;
    try {
      await api.deleteRoom(code);
      load();
    } catch (err) {
      alert("Не удалось удалить: " + err.message);
    }
  }

  // Если перешли по пригласительной ссылке ?room=CODE — сразу присоединяемся
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl) {
      window.history.replaceState({}, "", window.location.pathname);
      api
        .joinRoom(roomFromUrl.toUpperCase())
        .then(() => setActiveCode(roomFromUrl.toUpperCase()))
        .catch((e) => setJoinError(e.message));
    }
  }, []);

  async function create(category) {
    setCreating(true);
    setError("");
    try {
      const room = await api.createRoom(category);
      setActiveCode(room.code);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function join() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinError("");
    try {
      await api.joinRoom(code);
      setActiveCode(code);
    } catch (e) {
      setJoinError(e.message);
    }
  }

  if (activeCode) {
    return (
      <RoomDetail
        code={activeCode}
        onBack={() => {
          setActiveCode(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="view">
      <ScreenHeader title="Совместные комнаты" subtitle="Сочиняйте промпт вместе — вдвоём или больше" />
      {error && <p className="form-error">{error}</p>}

      <p className="step-question">Создать новую</p>
      <div className="chip-row">
        {Object.entries(ROOM_CATEGORY_LABELS).map(([key, label]) => (
          <button key={key} className="chip" disabled={creating} onClick={() => create(key)}>
            {label}
          </button>
        ))}
      </div>

      <p className="step-question" style={{ marginTop: 20 }}>
        Присоединиться по коду
      </p>
      <div className="composer" style={{ marginBottom: joinError ? 8 : 20 }}>
        <input
          placeholder="Например: 8X2F4K"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && join()}
        />
        <button className="btn-primary" onClick={join}>
          Войти
        </button>
      </div>
      {joinError && <p className="form-error" style={{ marginBottom: 20 }}>{joinError}</p>}

      {rooms && rooms.length > 0 && (
        <>
          <p className="step-question">Твои комнаты</p>
          <div className="fav-list">
            {rooms.map((r) => (
              <button
                key={r.code}
                className="fav-item"
                style={{ textAlign: "left", cursor: "pointer" }}
                onClick={() => setActiveCode(r.code)}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    {ROOM_CATEGORY_LABELS[r.category] || r.category} · {r.code}
                  </p>
                  <p className="empty-hint" style={{ margin: 0 }}>
                    {r.status === "finished" ? "✅ Завершена" : "🟢 Открыта"}
                  </p>
                </div>
                {r.is_owner && (
                  <span
                    className="btn-ghost small"
                    onClick={(e) => removeRoom(r.code, e)}
                    title="Удалить комнату"
                    style={{ cursor: "pointer" }}
                  >
                    🗑
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RoomDetail({ code, onBack }) {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState("ai"); // "ai" | "team"
  const endRef = useRef(null);
  const typingPingRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  function handleInputChange(e) {
    setInput(e.target.value);
    const now = Date.now();
    if (e.target.value.trim() && now - typingPingRef.current > 2000) {
      typingPingRef.current = now;
      api.pingRoomTyping(code).catch(() => {});
    }
  }

  const load = useCallback(() => {
    api
      .getRoom(code)
      .then(setRoom)
      .catch((e) => setError(e.message));
  }, [code]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room, channel]);

  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || sending || room?.status !== "open") return;
    setSending(true);
    setInput("");
    try {
      const updated = await api.sendRoomMessage(code, text, channel);
      setRoom(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
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
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const { text } = await api.transcribeVoice(blob);
          if (text && text.trim()) await send(text.trim());
        } catch (e) {
          setError("Не удалось распознать голос: " + e.message);
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Не удалось получить доступ к микрофону: " + e.message);
    }
  }

  async function finish() {
    if (
      !window.confirm(
        "Завершить комнату и получить финальный промпт? Он попадёт в избранное всем участникам."
      )
    )
      return;
    setFinishing(true);
    try {
      const updated = await api.finishRoom(code);
      setRoom(updated);
    } catch (e) {
      alert("Не удалось завершить: " + e.message);
    } finally {
      setFinishing(false);
    }
  }

  function copyInvite() {
    const link = `${window.location.origin}${window.location.pathname}?room=${code}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function deleteThisRoom() {
    if (!window.confirm(`Удалить комнату ${code} целиком? Это нельзя отменить.`)) return;
    try {
      await api.deleteRoom(code);
      onBack();
    } catch (e) {
      alert("Не удалось удалить: " + e.message);
    }
  }

  if (!room) {
    return (
      <div className="view">
        <button className="btn-ghost" onClick={onBack}>
          ◀️ Назад
        </button>
        {error ? <p className="form-error">{error}</p> : <p className="empty-hint">Загружаю комнату…</p>}
      </div>
    );
  }

  const visibleMessages = room.messages.filter((m) => (m.channel || "ai") === channel);
  const aiCount = room.messages.filter((m) => (m.channel || "ai") === "ai").length;
  const teamCount = room.messages.filter((m) => m.channel === "team").length;

  return (
    <div className="view bt-wide">
      <ScreenHeader title={`🤝 Комната ${room.code}`} subtitle={ROOM_CATEGORY_LABELS[room.category] || room.category} />
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 10 }}>
        ◀️ К списку комнат
      </button>

      <div className="chip-row">
        {room.participants.map((p) => (
          <span key={p.id} className="chip" style={{ cursor: "pointer" }} onClick={() => openProfile(p.id)}>
            {p.avatar ? (
              <img
                src={p.avatar}
                alt=""
                style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover", marginRight: 4, verticalAlign: "middle" }}
              />
            ) : null}
            {p.is_me ? "Ты" : p.name} <LevelBadge level={p.level} /> <CustomBadge badge={p.badge} />
          </span>
        ))}
        {room.status === "open" && (
          <button className="chip" onClick={copyInvite} title="Скопировать ссылку-приглашение">
            {copied ? "✅ Скопировано" : "🔗 Пригласить"}
          </button>
        )}
        {room.is_owner && (
          <button className="chip" onClick={deleteThisRoom} title="Удалить комнату" style={{ color: "#f87171" }}>
            🗑 Удалить комнату
          </button>
        )}
      </div>

      {room.status === "finished" && room.final_content && (
        <div className="result-card" style={{ marginTop: 12 }}>
          <p className="result-label">✅ Готовый промпт (уже в избранном у всех участников)</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{room.final_content}</p>
        </div>
      )}

      <div className="chip-row" style={{ marginTop: 16 }}>
        <button className={channel === "ai" ? "chip active" : "chip"} onClick={() => setChannel("ai")}>
          🤖 С нейросетью {aiCount > 0 ? `(${aiCount})` : ""}
        </button>
        <button className={channel === "team" ? "chip active" : "chip"} onClick={() => setChannel("team")}>
          💬 Между собой {teamCount > 0 ? `(${teamCount})` : ""}
        </button>
      </div>
      {channel === "team" && (
        <p className="empty-hint" style={{ marginTop: 4 }}>
          Это приватное обсуждение — нейросеть его не видит. Обсудите идею здесь, а когда договоритесь —
          переключитесь на «С нейросетью» и предложите её.
        </p>
      )}

      <div className="chat-log" style={{ marginTop: 12 }}>
        {visibleMessages.length === 0 && (
          <p className="empty-hint">
            {channel === "ai" ? "Пока пусто — начни разговор с нейросетью 👇" : "Пока пусто — обсудите идею вдвоём 👇"}
          </p>
        )}
        {visibleMessages.map((m) => (
          <div key={m.id} style={{ alignSelf: m.is_mine ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            {!m.is_mine && (
              <p className="empty-hint" style={{ fontSize: 12, margin: "0 0 2px 4px" }}>
                {m.author}
              </p>
            )}
            <Bubble role={m.is_mine ? "user" : "assistant"}>{m.content}</Bubble>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {error && <p className="form-error">{error}</p>}

      {room.status === "open" && (
        <>
          {room.typing && room.typing.length > 0 && (
            <p className="empty-hint typing-indicator">
              {room.typing.join(", ")} {room.typing.length === 1 ? "печатает" : "печатают"}…
            </p>
          )}
          <div className="composer" style={{ marginTop: 12 }}>
            <input
              placeholder={
                isRecording
                  ? "🔴 Идёт запись…"
                  : transcribing
                  ? "Распознаю…"
                  : channel === "ai"
                  ? "Напиши идею для нейросети…"
                  : "Напиши напарнику…"
              }
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={isRecording || transcribing}
            />
            <button
              className={isRecording ? "btn-secondary" : "btn-ghost"}
              onClick={toggleVoiceInput}
              disabled={transcribing}
              title="Голосовое сообщение"
              style={isRecording ? { color: "#f87171" } : undefined}
            >
              {isRecording ? "⏹" : "🎤"}
            </button>
            <button className="btn-primary" onClick={() => send()} disabled={sending || isRecording || transcribing}>
              Отправить
            </button>
          </div>
          <button className="btn-secondary" onClick={finish} disabled={finishing} style={{ marginTop: 12 }}>
            {finishing ? "Собираю промпт…" : "✅ Готово — собрать финальный промпт"}
          </button>
        </>
      )}
    </div>
  );
}

// ==================== Управление пользователями (для полных админов) ====================

const BADGE_COLOR_PRESETS = ["#a78bfa", "#22d3ee", "#fb7185", "#facc15", "#4ade80", "#f472b6"];

function AdminUserManage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ display_name: "", badge_text: "", badge_color: BADGE_COLOR_PRESETS[0], is_banned: false, role: "user" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  async function search(q) {
    setError("");
    try {
      const data = await api.adminSearchUsers(q);
      setResults(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    search("");
  }, []);

  function selectUser(u) {
    setSelected(u);
    setForm({
      display_name: u.name || "",
      badge_text: u.badge_text || "",
      badge_color: u.badge_color || BADGE_COLOR_PRESETS[0],
      is_banned: u.is_banned,
      role: u.role,
    });
    setSaveMsg("");
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const patch = {
        display_name: form.display_name,
        badge_text: form.badge_text,
        badge_color: form.badge_color,
        is_banned: form.is_banned,
      };
      if (selected.can_manage_roles) patch.role = form.role;
      const updated = await api.adminUpdateUser(selected.id, patch);
      setSelected(updated);
      setSaveMsg("✅ Сохранено!");
      search(query);
    } catch (e) {
      setSaveMsg("Ошибка: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div className="composer" style={{ marginBottom: 12 }}>
        <input
          placeholder="Поиск по имени / email / Telegram…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search(query)}
        />
        <button className="btn-primary" onClick={() => search(query)}>
          Найти
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}

      <div className="fav-list">
        {results?.map((u) => (
          <button
            key={u.id}
            className="fav-item"
            style={{ textAlign: "left", cursor: "pointer" }}
            onClick={() => selectUser(u)}
          >
            {u.avatar ? (
              <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span className="user-avatar">{u.name[0]?.toUpperCase()}</span>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {u.name} <LevelBadge level={u.level} /> <CustomBadge badge={{ text: u.badge_text, color: u.badge_color }} />
                {u.is_banned && <span className="form-error" style={{ marginLeft: 6 }}>🚫 забанен</span>}
              </p>
              <p className="empty-hint" style={{ margin: 0, fontSize: 12 }}>
                {u.role !== "user" ? `роль: ${u.role} · ` : ""}
                {u.email || ""} {u.telegram_username ? "@" + u.telegram_username : ""}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="result-card" style={{ marginTop: 16 }}>
          <p className="result-label">Редактирование: {selected.name}</p>

          <div className="field-row">
            <label className="empty-hint" style={{ display: "block", marginBottom: 4 }}>Имя</label>
            <input
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            />
          </div>

          <div className="field-row">
            <label className="empty-hint" style={{ display: "block", marginBottom: 4 }}>
              Украшение (титул рядом с именем)
            </label>
            <input
              placeholder="Например: 👑 Основатель"
              value={form.badge_text}
              onChange={(e) => setForm((f) => ({ ...f, badge_text: e.target.value }))}
              maxLength={30}
            />
          </div>

          <div className="field-row">
            <label className="empty-hint" style={{ display: "block", marginBottom: 4 }}>Цвет украшения</label>
            <div className="chip-row" style={{ marginBottom: 0 }}>
              {BADGE_COLOR_PRESETS.map((c) => (
                <span
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, badge_color: c }))}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                    display: "inline-block",
                    boxShadow: form.badge_color === c ? "0 0 0 2px #fff" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {form.badge_text && (
            <p className="empty-hint">
              Превью: {selected.name} <CustomBadge badge={{ text: form.badge_text, color: form.badge_color }} />
            </p>
          )}

          {selected.can_manage_roles && (
            <div className="field-row">
              <label className="empty-hint" style={{ display: "block", marginBottom: 4 }}>Роль</label>
              <div className="chip-row" style={{ marginBottom: 0 }}>
                {["user", "moderator", "admin"].map((r) => (
                  <button
                    key={r}
                    className={form.role === r ? "chip active" : "chip"}
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                  >
                    {r === "user" ? "Обычный" : r === "moderator" ? "🛡 Модератор" : "👑 Админ"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="inline-actions" style={{ marginTop: 10 }}>
            <button
              className={form.is_banned ? "chip active" : "chip"}
              onClick={() => setForm((f) => ({ ...f, is_banned: !f.is_banned }))}
              disabled={selected.is_super_admin}
            >
              {form.is_banned ? "🚫 Забанен (нажми чтобы разбанить)" : "Забанить"}
            </button>
          </div>

          <div className="inline-actions" style={{ marginTop: 14 }}>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Сохраняю…" : "Сохранить изменения"}
            </button>
            <button className="btn-ghost" onClick={() => setSelected(null)}>
              Закрыть
            </button>
            {saveMsg && <span className="saved-msg">{saveMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Публичный профиль пользователя ====================

function PublicProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile(null);
    setError("");
    api
      .getPublicProfile(userId)
      .then(setProfile)
      .catch((e) => setError(e.message));
  }, [userId]);

  return (
    <div className="bot-login-overlay" onClick={onClose}>
      <div className="bot-login-modal" style={{ maxWidth: 420, textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
        <button className="btn-ghost small" onClick={onClose} style={{ float: "right" }}>
          ✕
        </button>
        {error && <p className="form-error">{error}</p>}
        {!profile && !error && <p className="empty-hint">Загружаю…</p>}
        {profile && (
          <>
            <div className="inline-actions" style={{ marginBottom: 10 }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span className="user-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
                  {profile.name[0]?.toUpperCase()}
                </span>
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>
                  {profile.is_me ? "Ты" : profile.name} <CustomBadge badge={profile.badge} />
                </p>
                <p className="empty-hint" style={{ margin: 0 }}>
                  Ур. {profile.level} · {profile.level_title}
                  {profile.current_streak > 0 && ` · 🔥 ${profile.current_streak}`}
                </p>
              </div>
            </div>

            {profile.achievements.length > 0 && (
              <>
                <p className="step-question">Достижения ({profile.achievements.length})</p>
                <div className="achievements-grid" style={{ marginBottom: 16 }}>
                  {profile.achievements.map((a) => (
                    <div key={a.key} className="achievement-card earned" title={a.desc}>
                      <span className="achievement-icon">{a.label.split(" ")[0]}</span>
                      <span className="achievement-name">{a.label.split(" ").slice(1).join(" ")}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {profile.gallery_posts.length > 0 && (
              <>
                <p className="step-question">Промпты в галерее ({profile.gallery_posts.length})</p>
                <div className="fav-list">
                  {profile.gallery_posts.map((p) => (
                    <div key={p.id} className="fav-item">
                      <p style={{ margin: 0 }}>{p.content}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {profile.achievements.length === 0 && profile.gallery_posts.length === 0 && (
              <p className="empty-hint">Пока не набрал(а) достижений и не публиковал(а) в галерею.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ==================== Что нового (лента обновлений, видна всем) ====================

function WhatsNewView({ isAdmin }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [aiPolish, setAiPolish] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  const load = useCallback(() => {
    api
      .listAnnouncements()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function publish() {
    if (!draft.trim() || publishing) return;
    setPublishing(true);
    setPublishMsg("");
    try {
      await api.postAnnouncement(draft.trim(), aiPolish);
      setDraft("");
      setPublishMsg("✅ Опубликовано!");
      load();
      setTimeout(() => setPublishMsg(""), 2500);
    } catch (e) {
      setPublishMsg("Ошибка: " + e.message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="view">
      <ScreenHeader title="📰 Что нового" subtitle="Обновления сайта и бота" />
      {error && <p className="form-error">{error}</p>}

      {isAdmin && (
        <div className="result-card" style={{ marginBottom: 20 }}>
          <p className="result-label">Опубликовать новость</p>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Опиши, что обновилось — можно сухим списком, нейросеть причешет стиль…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="inline-actions" style={{ marginTop: 8 }}>
            <button
              className={aiPolish ? "chip active" : "chip"}
              onClick={() => setAiPolish((v) => !v)}
              type="button"
            >
              ✨ Причесать нейросетью
            </button>
            <button className="btn-primary" onClick={publish} disabled={!draft.trim() || publishing}>
              {publishing ? "Публикую…" : "Опубликовать"}
            </button>
            {publishMsg && <span className="saved-msg">{publishMsg}</span>}
          </div>
          <p className="empty-hint" style={{ marginTop: 8, marginBottom: 0 }}>
            Публикация с сайта видна только здесь (лента + колокольчик 🔔) — в Telegram не рассылается.
            Для рассылки в личку всем пользователям бота используй команду /announce прямо в боте.
          </p>
        </div>
      )}

      {items === null && <p className="empty-hint">Загружаю…</p>}
      {items && items.length === 0 && <p className="empty-hint">Пока новостей нет.</p>}
      <div className="fav-list">
        {items?.map((a) => (
          <div key={a.id} className="fav-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{a.content}</p>
            <p className="empty-hint" style={{ margin: "6px 0 0", fontSize: 12 }}>
              {new Date(a.created_at).toLocaleString("ru-RU")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
