import { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken } from "./api.js";

const BOT_USERNAME = "halpervovan_bot"; // имя бота без @, для кнопки "Войти через Telegram"

const NAV_ITEMS = [
  { id: "chat", label: "Общение", icon: "💬" },
  { id: "translate", label: "Переводчик", icon: "🌐" },
  { id: "prompts", label: "Промпты", icon: "🎨" },
  { id: "cover", label: "Обложка трека", icon: "🖼" },
  { id: "favorites", label: "Избранное", icon: "⭐" },
  { id: "account", label: "Аккаунт", icon: "👤" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

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
      <Sidebar
        active={activeTab}
        onChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="content">
        {activeTab === "chat" && <ChatView />}
        {activeTab === "translate" && <TranslateView />}
        {activeTab === "prompts" && <PromptsView />}
        {activeTab === "cover" && <CoverView />}
        {activeTab === "favorites" && <FavoritesView />}
        {activeTab === "account" && <AccountView user={user} onUserUpdate={setUser} />}
      </main>
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

function Sidebar({ active, onChange, user, onLogout }) {
  const displayName = user.telegram_first_name || user.email || "Пользователь";
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
        <div className="user-chip">
          <span className="user-avatar">{displayName[0]?.toUpperCase()}</span>
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
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [roles, setRoles] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem("botyara_chat_role") || "friend");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    api
      .history()
      .then((data) => setHistory(data.history || []))
      .catch(() => {
        /* если не получилось — просто начинаем с пустой истории */
      })
      .finally(() => setLoadingHistory(false));

    api
      .chatRoles()
      .then(setRoles)
      .catch(() => setRoles({}));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  function chooseRole(id) {
    setRole(id);
    localStorage.setItem("botyara_chat_role", id);
    setShowRolePicker(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const nextHistory = [...history, { role: "user", content: text }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.chat(nextHistory, role);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "assistant", content: "Ошибка: " + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  const currentRole = roles?.[role];

  return (
    <div className="view">
      <ScreenHeader title="Общение" subtitle="Пиши что угодно — отвечу с помощью нейросети" />

      <div className="inline-actions" style={{ marginBottom: 12 }}>
        <button className="btn-secondary" onClick={() => setShowRolePicker((v) => !v)}>
          {currentRole ? `${currentRole.emoji} ${currentRole.label}` : "Выбери роль"} 🔄
        </button>
      </div>

      {showRolePicker && roles && (
        <div className="chip-row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          {Object.entries(roles).map(([id, cfg]) => (
            <button
              key={id}
              className="chip"
              onClick={() => chooseRole(id)}
              title={cfg.description}
              style={id === role ? { borderColor: "var(--accent, #a855f7)" } : undefined}
            >
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>
      )}

      <div className="chat-log">
        {loadingHistory && <p className="empty-hint">Загружаю историю…</p>}
        {!loadingHistory && history.length === 0 && (
          <p className="empty-hint">
            Пока пусто — начни разговор ниже 👇
            {currentRole && ` Сейчас ты общаешься с ролью «${currentRole.label}».`}
          </p>
        )}
        {history.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content}
          </Bubble>
        ))}
        {loading && <Bubble role="assistant">печатает…</Bubble>}
        <div ref={endRef} />
      </div>
      <div className="composer">
        <input
          placeholder="Напиши сообщение…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn-primary" onClick={send} disabled={loading}>
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

  useEffect(() => {
    api.promptTopics().then(setTopics).catch(() => setTopics({}));
  }, []);

  function resetToTopics() {
    setTopic(null);
    setTarget(null);
    setHistory([]);
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
      await api.addFavorite(lastBot.content);
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
      await api.addFavorite(result);
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

  return (
    <div className="view">
      <ScreenHeader title="Избранное" subtitle="Сохранённые промпты" />
      {error && <p className="form-error">{error}</p>}
      {items && items.length === 0 && (
        <p className="empty-hint">Пока пусто. Сохраняй промпты кнопкой ⭐ под готовым результатом.</p>
      )}
      <div className="fav-list">
        {items?.map((item) => (
          <div key={item.id} className="fav-item">
            <p>{item.content}</p>
            <button className="btn-ghost small" onClick={() => remove(item.id)}>
              Удалить
            </button>
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

  return (
    <div className="view">
      <ScreenHeader title="Аккаунт" subtitle="Способы входа в этот аккаунт" />

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
        <p className="empty-hint">
          Email уже привязан — можешь входить на сайт как через Telegram, так и по email и паролю.
        </p>
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
