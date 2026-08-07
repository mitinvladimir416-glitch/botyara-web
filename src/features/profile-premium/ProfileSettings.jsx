import { useState } from "react";
import { KeyRound, LogOut, Mail, Monitor, Send, Smartphone, Upload } from "lucide-react";
import { api } from "../../api.js";
import Avatar from "../../components/ui/Avatar.jsx";
import GlassCard from "../../components/ui/GlassCard.jsx";
import PremiumButton from "../../components/ui/PremiumButton.jsx";

export default function ProfileSettings({ user, onUserUpdate, onLogout, viewMode, onToggleViewMode }) {
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_base64 || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setProfileError("");
    setProfileMsg("");
    setProfileLoading(true);
    try {
      await api.updateProfile(displayName, avatarFile);
      const updated = await api.me();
      onUserUpdate(updated);
      setProfileMsg("Профиль сохранён!");
      setAvatarFile(null);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLinkEmail(event) {
    event.preventDefault();
    setLinkError("");
    setLinkSuccess("");
    setLinkLoading(true);
    try {
      await api.linkEmail(email, password);
      const updated = await api.me();
      onUserUpdate(updated);
      setLinkSuccess("Email привязан! Теперь можно входить и по нему.");
      setEmail("");
      setPassword("");
    } catch (error) {
      setLinkError(error.message);
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPwError("");
    setPwSuccess("");
    setPwLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwSuccess("Пароль изменён.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPwError(error.message);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="profile-settings">
      <GlassCard tone="elevated" padding="lg" className="profile-settings__card">
        <h2>Аватар и имя</h2>
        <form onSubmit={handleSaveProfile} className="profile-settings__avatar-form">
          <div className="profile-settings__avatar-row">
            <Avatar src={avatarPreview} name={displayName || user.email || "Б"} size="lg" shape="squircle" />
            <label className="profile-settings__upload">
              <Upload size={15} strokeWidth={1.8} />
              Выбрать фото
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <input
            placeholder="Как тебя называть?"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={50}
          />
          {profileError && <p className="profile-premium-error">{profileError}</p>}
          {profileMsg && <p className="profile-settings__success">{profileMsg}</p>}
          <PremiumButton type="submit" disabled={profileLoading}>
            {profileLoading ? "Сохраняю…" : "Сохранить профиль"}
          </PremiumButton>
        </form>
      </GlassCard>

      <GlassCard tone="elevated" padding="lg" className="profile-settings__card">
        <h2>Способы входа</h2>
        <div className="profile-settings__connections">
          <div>
            <Send size={16} strokeWidth={1.8} />
            <span>
              {user.telegram_username || user.telegram_first_name
                ? `Telegram подключён (${user.telegram_first_name || ""} ${
                    user.telegram_username ? "@" + user.telegram_username : ""
                  })`
                : "Telegram не подключён"}
            </span>
          </div>
          <div>
            <Mail size={16} strokeWidth={1.8} />
            <span>{user.email ? `Email: ${user.email}` : "Email не привязан"}</span>
          </div>
        </div>

        {user.email ? (
          <>
            <p className="profile-settings__hint">
              Email уже привязан — можешь входить как через Telegram, так и по email и паролю.
            </p>

            {!showChangePassword ? (
              <PremiumButton
                variant="secondary"
                size="sm"
                leadingIcon={<KeyRound size={15} strokeWidth={1.8} />}
                onClick={() => setShowChangePassword(true)}
              >
                Сменить пароль
              </PremiumButton>
            ) : (
              <form onSubmit={handleChangePassword} className="profile-settings__password-form">
                <input
                  type="password"
                  placeholder="Текущий пароль"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={6}
                  required
                />
                {pwError && <p className="profile-premium-error">{pwError}</p>}
                {pwSuccess && <p className="profile-settings__success">{pwSuccess}</p>}
                <div className="profile-settings__form-actions">
                  <PremiumButton type="submit" size="sm" disabled={pwLoading}>
                    {pwLoading ? "Секунду…" : "Сохранить новый пароль"}
                  </PremiumButton>
                  <PremiumButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPwError("");
                      setPwSuccess("");
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                  >
                    Отмена
                  </PremiumButton>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            <p className="profile-settings__hint">
              Привяжи email и пароль — тогда сможешь зайти сюда же, даже если временно не будет доступа к Telegram.
            </p>
            <form onSubmit={handleLinkEmail} className="profile-settings__password-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Придумай пароль"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              {linkError && <p className="profile-premium-error">{linkError}</p>}
              {linkSuccess && <p className="profile-settings__success">{linkSuccess}</p>}
              <PremiumButton type="submit" size="sm" disabled={linkLoading}>
                {linkLoading ? "Секунду…" : "Привязать email"}
              </PremiumButton>
            </form>
          </>
        )}
      </GlassCard>

      <div className="profile-settings__footer">
        <PremiumButton
          variant="secondary"
          leadingIcon={viewMode === "mobile" ? <Monitor size={16} strokeWidth={1.8} /> : <Smartphone size={16} strokeWidth={1.8} />}
          onClick={onToggleViewMode}
        >
          {viewMode === "mobile" ? "Версия для ПК" : "Мобильная версия"}
        </PremiumButton>
        <PremiumButton variant="ghost" leadingIcon={<LogOut size={16} strokeWidth={1.8} />} onClick={onLogout}>
          Выйти из аккаунта
        </PremiumButton>
      </div>
    </div>
  );
}
