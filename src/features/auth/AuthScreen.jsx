import { useEffect, useRef, useState } from "react";
import Toast from "../../components/ui/Toast.jsx";
import { api } from "../../api.js";
import AuthHero from "./AuthHero.jsx";
import AuthPanel from "./AuthPanel.jsx";
import "./auth.css";

const BOT_USERNAME = "halpervovan_bot";
const TRANSIENT_STATUS_CODES = new Set([502, 503, 504]);

function isTransientAuthError(error) {
  return TRANSIENT_STATUS_CODES.has(error?.status);
}

function authErrorMessage(error, context) {
  if (error?.code === "NETWORK_ERROR") {
    return context === "telegram"
      ? "Не удалось подключиться к Telegram-входу. Проверьте соединение и попробуйте ещё раз."
      : "Не удалось подключиться к серверу. Проверьте соединение и попробуйте ещё раз.";
  }
  if (isTransientAuthError(error)) {
    return context === "telegram"
      ? "Telegram-вход временно недоступен. Сервер восстанавливает соединение, попробуйте ещё раз."
      : "Сервис авторизации временно недоступен. Подождите немного и повторите попытку.";
  }
  return error?.message || "Не удалось выполнить вход. Попробуйте ещё раз.";
}

function wait(delay) {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

async function withTransientRetry(action, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isTransientAuthError(error) || attempt === attempts - 1) throw error;
      await wait(650 * (attempt + 1));
    }
  }
  throw lastError;
}

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [botLoginOpen, setBotLoginOpen] = useState(false);
  const [botLoginToken, setBotLoginToken] = useState(null);
  const [botUsername, setBotUsername] = useState(BOT_USERNAME);
  const [botLoginError, setBotLoginError] = useState("");
  const [botLoginStarting, setBotLoginStarting] = useState(false);
  const [botLoginStatus, setBotLoginStatus] = useState("waiting");
  const [botLaunchError, setBotLaunchError] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  function completeAuth(data) {
    if (!data?.access_token || !data?.user) {
      const responseError = new Error("Сервер вернул неполные данные авторизации. Повторите попытку.");
      responseError.code = "INVALID_AUTH_RESPONSE";
      throw responseError;
    }
    onAuthed(data);
  }

  useEffect(() => {
    if (!botLoginOpen || !botLoginToken) return undefined;

    let cancelled = false;
    let timeoutId;
    let transientFailures = 0;

    async function poll() {
      try {
        const data = await api.pollBotLogin(botLoginToken);
        if (cancelled) return;
        transientFailures = 0;
        setBotLoginStatus("waiting");
        if (data.status === "confirmed") {
          completeAuth(data);
          setBotLoginOpen(false);
          return;
        }
        timeoutId = window.setTimeout(poll, 2000);
      } catch (pollError) {
        if (cancelled) return;
        if (isTransientAuthError(pollError) && transientFailures < 3) {
          transientFailures += 1;
          setBotLoginStatus("reconnecting");
          timeoutId = window.setTimeout(poll, 1200 * transientFailures);
          return;
        }
        setBotLoginStatus("failed");
        setBotLoginError(authErrorMessage(pollError, "telegram"));
      }
    }

    timeoutId = window.setTimeout(poll, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [botLoginOpen, botLoginToken, onAuthed]);

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function startBotLogin() {
    if (botLoginStarting) return;
    setBotLoginStarting(true);
    setBotLoginError("");
    setBotLaunchError("");
    setBotLoginStatus("waiting");
    try {
      const data = await withTransientRetry(() => api.startBotLogin());
      setBotLoginToken(data.token);
      setBotUsername(data.bot_username || BOT_USERNAME);
      setBotLoginOpen(true);
      setCopied(false);
    } catch (startError) {
      setBotLaunchError(authErrorMessage(startError, "telegram"));
    } finally {
      setBotLoginStarting(false);
    }
  }

  function closeBotLogin() {
    setBotLoginOpen(false);
    setBotLoginError("");
    setBotLoginStatus("waiting");
  }

  function retryBotLogin() {
    closeBotLogin();
    setBotLoginToken(null);
    startBotLogin();
  }

  async function copyBotCommand() {
    const command = `/start web_auth_${botLoginToken}`;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setBotLoginError("Не удалось скопировать команду. Выделите её и скопируйте вручную.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await withTransientRetry(() => api.login(email, password))
        : await api.register(email, password);
      completeAuth(data);
    } catch (submitError) {
      setError(authErrorMessage(submitError, mode));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="premium-auth-screen">
      <AuthHero />
      <section className="auth-scene" aria-label="Авторизация в БОТЯРЕ">
        <AuthPanel
          mode={mode}
          onModeChange={changeMode}
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onErrorDismiss={() => setError("")}
          onTelegramStart={startBotLogin}
          telegramStarting={botLoginStarting}
          telegramLaunchError={botLaunchError}
          onTelegramLaunchErrorDismiss={() => setBotLaunchError("")}
          telegramOpen={botLoginOpen}
          onTelegramClose={closeBotLogin}
          telegramToken={botLoginToken}
          telegramUsername={botUsername}
          telegramError={botLoginError}
          telegramStatus={botLoginStatus}
          onTelegramRetry={retryBotLogin}
          onCopyCommand={copyBotCommand}
        />
      </section>
      {copied && (
        <div className="auth-toast-stack">
          <Toast title="Команда скопирована" tone="success">Отправьте её боту в Telegram.</Toast>
        </div>
      )}
    </main>
  );
}
