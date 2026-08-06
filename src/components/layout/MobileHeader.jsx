import Avatar from "../ui/Avatar.jsx";

export default function MobileHeader({ title, user }) {
  const displayName = user?.display_name || user?.telegram_first_name || user?.email || "Пользователь";

  return (
    <header className="bt-mobile-header" data-bt-ui>
      <div className="bt-mobile-header__brand" aria-label="БОТЯРА">
        <span className="bt-mobile-header__mark" aria-hidden="true">Б</span>
        <div>
          <span className="bt-mobile-header__title">{title}</span>
          <span className="bt-mobile-header__subtitle">БОТЯРА</span>
        </div>
      </div>
      <Avatar
        src={user?.avatar_base64}
        name={displayName}
        alt={`Аватар ${displayName}`}
        size="sm"
      />
    </header>
  );
}
