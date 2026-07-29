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
  const [activeTab, setActiveTab] = useState("chat");
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("botyara_view_mode");
    if (saved === "mobile" || saved === "desktop") return saved;
    return window.innerWidth <= 780 ? "mobile" : "desktop";
  });

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
        {activeTab === "gallery" && <GalleryView isAdmin={user.is_admin} />}
        {activeTab === "account" && <AccountView user={user} onUserUpdate={setUser} />}
      </main>
      <ChatWidget isAdmin={user.is_admin} />
    </div>
  );
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
  const telegramRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowAuth(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.onTelegramAuth = async (tgUser) => {
      try {
        const data = await api.telegramLogin(tgUser);
        onAuthed(data);
      } catch (e) {
        setError("Не удалось войти через Telegram: " + e.message);
      }
    };

    if (telegramRef.current && telegramRef.current.childElementCount === 0) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", BOT_USERNAME);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "12");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      telegramRef.current.appendChild(script);
    }
  }, [onAuthed]);

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

        <div className="telegram-slot" ref={telegramRef} />

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
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark small">Б</span>
        <span className="sidebar-brand-text">ботяра</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
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
          <span className="user-name">{displayName}</span>
        </div>
        <button className="btn-ghost" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </aside>
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

  if (topic === "video" && framesChoice === null) {
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

function AccountView({ user, onUserUpdate }) {
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
    </div>
  );
}

// ==================== Галерея промптов ====================

function GalleryView({ isAdmin }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const load = useCallback(() => {
    api
      .listGallery()
      .then(setPosts)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

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
      {error && <p className="form-error">{error}</p>}
      {posts && posts.length === 0 && (
        <p className="empty-hint">
          Пока пусто — опубликуй что-нибудь из "Избранного" кнопкой "📢 В галерею".
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
              <span className="empty-hint" style={{ fontSize: 13 }}>
                {post.is_mine ? "Ты" : post.author}
              </span>
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
              <p className="result-label" style={{ margin: 0 }}>
                {post.is_mine ? "Ты" : post.author}
              </p>
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
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
                    {c.author}
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

function ChatWidget({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [unseen, setUnseen] = useState(0);
  const endRef = useRef(null);
  const lastCountRef = useRef(0);
  const openRef = useRef(false);
  openRef.current = open;

  const load = useCallback(() => {
    api
      .listPublicChat()
      .then((data) => {
        setMessages(data);
        if (!openRef.current && data.length > lastCountRef.current) {
          setUnseen((u) => u + (data.length - lastCountRef.current));
        }
        lastCountRef.current = data.length;
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (open) {
      setUnseen(0);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await api.sendPublicChat(text);
      if (res.status === "approved") {
        setInput("");
        load(); // мгновенное обновление сразу после отправки, не дожидаясь опроса
      } else {
        setSendError(`🚫 ${res.reject_reason || "Отклонено модерацией"}`);
      }
    } catch (e) {
      setSendError("Ошибка: " + e.message);
    } finally {
      setSending(false);
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
    <div className="chat-widget">
      {!open && (
        <button className="chat-widget-bubble" onClick={() => setOpen(true)} title="Общий чат">
          💬
          {unseen > 0 && <span className="chat-widget-badge">{unseen > 9 ? "9+" : unseen}</span>}
        </button>
      )}
      {open && (
        <div className="chat-widget-panel">
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
                  <p className="chat-widget-author">{m.author}</p>
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
              placeholder="Написать…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn-primary" onClick={send} disabled={sending}>
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

  useEffect(() => {
    api
      .listAnnouncements()
      .then((data) => {
        setItems(data);
        const lastSeenId = Number(localStorage.getItem("botyara_last_seen_announcement") || 0);
        const newer = data.filter((a) => a.id > lastSeenId).length;
        setUnseen(newer);
      })
      .catch(() => setItems([]));
  }, []);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next && items && items.length > 0) {
        localStorage.setItem("botyara_last_seen_announcement", String(items[0].id));
        setUnseen(0);
      }
      return next;
    });
  }

  return (
    <div className="top-actions">
      <div style={{ position: "relative" }}>
        <button className="top-action-btn" onClick={toggleOpen} title="Обновления">
          🔔
          {unseen > 0 && <span className="top-action-badge">{unseen > 9 ? "9+" : unseen}</span>}
        </button>
        {open && (
          <div className="announcements-panel">
            <p className="step-question" style={{ marginTop: 0 }}>
              📢 Обновления
            </p>
            {items === null && <p className="empty-hint">Загружаю…</p>}
            {items && items.length === 0 && <p className="empty-hint">Пока новостей нет.</p>}
            {items?.map((a) => (
              <div key={a.id} className="fav-item" style={{ marginBottom: 8 }}>
                <p style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{a.content}</p>
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
  );
}
