import {
  ArrowUpRight,
  Bot,
  CircleAlert,
  Copy,
  RefreshCw,
  Send,
  ShieldCheck,
  Wifi,
  X,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";
import AuthForm from "./AuthForm.jsx";

export default function AuthPanel({
  mode,
  onModeChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  loading,
  error,
  onErrorDismiss,
  onTelegramStart,
  telegramStarting,
  telegramLaunchError,
  onTelegramLaunchErrorDismiss,
  telegramOpen,
  onTelegramClose,
  telegramToken,
  telegramUsername,
  telegramError,
  telegramStatus,
  onTelegramRetry,
  onCopyCommand,
}) {
  const command = `/start web_auth_${telegramToken}`;
  const reconnecting = telegramStatus === "reconnecting";

  return (
    <div className="auth-panel-shell">
      <div className="auth-panel-shell__rail" aria-hidden="true"><span /></div>
      <GlassCard className="auth-panel" tone="elevated" padding="none">
        <header className="auth-panel__header">
          <h2>Добро пожаловать</h2>
          <p>Войди в свой аккаунт или создай новый.</p>
        </header>

        <AuthForm
          mode={mode}
          onModeChange={onModeChange}
          email={email}
          onEmailChange={onEmailChange}
          password={password}
          onPasswordChange={onPasswordChange}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          onErrorDismiss={onErrorDismiss}
        />

        <div className="auth-divider"><span>или</span></div>

        <PremiumButton
          className="auth-telegram-button"
          variant="secondary"
          size="lg"
          leadingIcon={<Send size={18} strokeWidth={1.5} aria-hidden="true" />}
          onClick={onTelegramStart}
          loading={telegramStarting}
        >
          {telegramStarting ? "Соединяемся" : "Продолжить с Telegram"}
        </PremiumButton>

        {telegramLaunchError && (
          <div className="auth-error-state auth-error-state--telegram" role="alert">
            <CircleAlert size={18} strokeWidth={1.5} aria-hidden="true" />
            <p>{telegramLaunchError}</p>
            <button type="button" onClick={onTelegramLaunchErrorDismiss} aria-label="Закрыть сообщение об ошибке">
              <X size={16} strokeWidth={1.5} />
            </button>
            <button className="auth-error-state__retry" type="button" onClick={onTelegramStart}>
              Повторить
            </button>
          </div>
        )}

        <footer className="auth-panel__footer">
          <ShieldCheck size={15} strokeWidth={1.5} aria-hidden="true" />
          <p>
            Продолжая, вы принимаете <a href="/legal/terms">условия использования</a> и{" "}
            <a href="/legal/privacy">политику конфиденциальности</a>.
          </p>
        </footer>
      </GlassCard>

      <Modal
        open={telegramOpen}
        onClose={onTelegramClose}
        className="auth-telegram-modal"
        title="Вход через Telegram"
        description="Подтвердите вход у бота. Сайт завершит авторизацию автоматически."
        closeLabel="Закрыть окно входа через Telegram"
      >
        {!telegramError ? (
          <div className="auth-telegram-flow">
            <div className={reconnecting ? "auth-telegram-status is-reconnecting" : "auth-telegram-status"}>
              <span className="auth-telegram-status__icon">
                {reconnecting
                  ? <Wifi size={21} strokeWidth={1.5} />
                  : <Bot size={21} strokeWidth={1.5} />}
              </span>
              <div>
                <strong>{reconnecting ? "Восстанавливаем связь" : "Бот готов"}</strong>
                <span>{reconnecting ? "Gateway временно не отвечает" : "Ожидаем подтверждение аккаунта"}</span>
              </div>
            </div>

            <a
              className="auth-telegram-flow__link"
              href={`https://t.me/${telegramUsername}?start=web_auth_${telegramToken}`}
              target="_blank"
              rel="noreferrer"
            >
              Открыть Telegram <ArrowUpRight size={17} strokeWidth={1.5} />
            </a>

            <p className="auth-telegram-flow__hint">Или отправьте эту команду боту @{telegramUsername}:</p>
            <button className="auth-command" type="button" onClick={onCopyCommand}>
              <code>{command}</code><Copy size={17} strokeWidth={1.5} />
            </button>
            <div className="auth-telegram-flow__waiting">
              <span />{reconnecting ? "Повторяем проверку автоматически" : "Ожидаем авторизацию"}
            </div>
          </div>
        ) : (
          <div className="auth-telegram-failure" role="alert">
            <span><CircleAlert size={22} strokeWidth={1.5} /></span>
            <h3>Не удалось подтвердить вход</h3>
            <p>{telegramError}</p>
            <PremiumButton leadingIcon={<RefreshCw size={17} strokeWidth={1.5} />} onClick={onTelegramRetry}>
              Попробовать снова
            </PremiumButton>
          </div>
        )}
      </Modal>
    </div>
  );
}
