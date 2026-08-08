import { useEffect, useRef, useState } from "react";
import { Download, Mic, RotateCcw, Send, Sparkles, Square } from "lucide-react";
import { api } from "../../api.js";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import "./ai-chat-premium.css";

function AIChatMessage({ role, children }) {
  const isMine = role === "user";
  return (
    <div className={isMine ? "ai-chat-premium-message is-mine" : "ai-chat-premium-message is-assistant"}>
      {!isMine && <span className="ai-chat-premium-message__mark" aria-hidden="true">Б</span>}
      <div className="ai-chat-premium-message__bubble">
        <p>{children}</p>
      </div>
    </div>
  );
}

// Бизнес-логика 1:1 из legacy ChatView (src/App.jsx) — те же состояния, эффекты,
// функции и api.* вызовы, только premium-оболочка вместо старого JSX/CSS.
export default function AIChatPremiumView() {
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
    <section className="ai-chat-premium">
      <header className="ai-chat-premium-hero">
        <span className="ai-chat-premium-hero__eyebrow">
          <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
          AI-ассистент
        </span>
        <h1>Общение с BOTYARA</h1>
        <p>Каждая роль — отдельный разговор со своей историей. Спрашивай, проси помощи, обсуждай идеи.</p>
      </header>

      <div className="ai-chat-premium-tabs-row">
        <div className="ai-chat-premium-tabs" role="tablist" aria-label="Роли ассистента">
          {!roles && <span className="ai-chat-premium-tabs__loading">Загружаю роли…</span>}
          {roles &&
            Object.entries(roles).map(([id, cfg]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === activeRole}
                className={id === activeRole ? "ai-chat-premium-tab is-active" : "ai-chat-premium-tab"}
                onClick={() => switchTab(id)}
                title={cfg.description}
              >
                <span aria-hidden="true">{cfg.emoji}</span>
                {cfg.label}
              </button>
            ))}
        </div>

        <div className="ai-chat-premium-tools">
          {history.length > 0 && (
            <button type="button" className="ai-chat-premium-tool-btn" onClick={exportHistory} title="Скачать историю">
              <Download size={15} strokeWidth={1.8} />
            </button>
          )}
          <button type="button" className="ai-chat-premium-tool-btn" onClick={resetChat} title="Начать заново">
            <RotateCcw size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <GlassCard tone="elevated" padding="none" className="ai-chat-premium-panel">
        <div className="ai-chat-premium-log">
          {loadingHistory ? (
            <div className="ai-chat-premium-loading" aria-label="Загружаю переписку">
              <span />
              <span />
              <span />
            </div>
          ) : history.length === 0 ? (
            <div className="ai-chat-premium-empty">
              <span aria-hidden="true">
                <Sparkles size={22} strokeWidth={1.5} />
              </span>
              <strong>
                {activeRole === "default" ? "Пока пусто" : `Пока пусто с ролью «${currentRole?.label || ""}»`}
              </strong>
              <p>Начни разговор ниже — BOTYARA ответит и запомнит контекст.</p>
            </div>
          ) : (
            history.map((m, i) => (
              <AIChatMessage key={i} role={m.role}>
                {m.content}
              </AIChatMessage>
            ))
          )}

          {loading && (
            <div className="ai-chat-premium-message is-assistant">
              <span className="ai-chat-premium-message__mark" aria-hidden="true">Б</span>
              <div className="ai-chat-premium-message__bubble ai-chat-premium-message__bubble--typing" aria-label="БОТЯРА печатает">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="ai-chat-premium-composer">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={isRecording || transcribing}
            placeholder={
              isRecording
                ? "Идёт запись — нажми на микрофон ещё раз, чтобы остановить"
                : transcribing
                ? "Распознаю голос…"
                : currentRole
                ? `Напиши сообщение (${currentRole.label})…`
                : "Напиши сообщение…"
            }
          />
          <button
            type="button"
            className={isRecording ? "ai-chat-premium-mic is-recording" : "ai-chat-premium-mic"}
            onClick={toggleRecording}
            disabled={transcribing || loading}
            title={isRecording ? "Остановить запись" : "Записать голосовое сообщение"}
          >
            {isRecording ? <Square size={17} strokeWidth={1.8} /> : <Mic size={17} strokeWidth={1.8} />}
          </button>
          <PremiumButton
            className="ai-chat-premium-send"
            leadingIcon={<Send size={16} strokeWidth={1.8} />}
            onClick={() => send()}
            disabled={loading || isRecording || transcribing}
          >
            Отправить
          </PremiumButton>
        </div>
      </GlassCard>
    </section>
  );
}
