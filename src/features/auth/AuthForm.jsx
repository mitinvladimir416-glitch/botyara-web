import { useState } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, LockKeyhole, Mail, X } from "lucide-react";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

export default function AuthForm({
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
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";

  return (
    <div className="auth-form-block">
      <div className="auth-tabs" role="tablist" aria-label="Способ авторизации">
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={isLogin ? "auth-tab is-active" : "auth-tab"}
          onClick={() => onModeChange("login")}
        >
          Вход
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={!isLogin ? "auth-tab is-active" : "auth-tab"}
          onClick={() => onModeChange("register")}
        >
          Регистрация
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit} aria-describedby={error ? "auth-form-error" : undefined}>
        <label className="auth-field">
          <span className="auth-field__label">Email</span>
          <span className="auth-field__control">
            <Mail size={18} strokeWidth={1.5} aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </span>
        </label>

        <label className="auth-field">
          <span className="auth-field__label">Пароль</span>
          <span className="auth-field__control">
            <LockKeyhole size={18} strokeWidth={1.5} aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Минимум 6 символов"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              disabled={loading}
              required
            />
            <button
              className="auth-field__reveal"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword
                ? <EyeOff size={18} strokeWidth={1.5} aria-hidden="true" />
                : <Eye size={18} strokeWidth={1.5} aria-hidden="true" />}
            </button>
          </span>
        </label>

        {error && (
          <div className="auth-error-state" id="auth-form-error" role="alert">
            <CircleAlert size={18} strokeWidth={1.5} aria-hidden="true" />
            <p>{error}</p>
            <button type="button" onClick={onErrorDismiss} aria-label="Закрыть сообщение об ошибке">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        <PremiumButton
          className="auth-form__submit"
          type="submit"
          size="lg"
          loading={loading}
          trailingIcon={<ArrowRight size={17} strokeWidth={1.5} />}
        >
          {loading ? "Подключаемся" : isLogin ? "Войти" : "Создать аккаунт"}
        </PremiumButton>
      </form>
    </div>
  );
}
