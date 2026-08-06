import {
  Bot,
  GalleryVerticalEnd,
  Home,
  Languages,
  LayoutDashboard,
  MessageCircle,
  Music2,
  Newspaper,
  Paintbrush2,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";

const ICONS = {
  home: Home,
  chat: MessageCircle,
  translate: Languages,
  prompts: Sparkles,
  cover: Music2,
  favorites: Star,
  gallery: GalleryVerticalEnd,
  rooms: UsersRound,
  whatsnew: Newspaper,
  account: UserRound,
  admin: LayoutDashboard,
};

export default function DesktopSidebar({ active, items, onNavigate, footer }) {
  return (
    <aside className="bt-desktop-sidebar" data-bt-ui>
      <div className="bt-desktop-sidebar__brand">
        <span className="bt-desktop-sidebar__mark" aria-hidden="true"><Bot size={22} strokeWidth={1.6} /></span>
        <span>БОТЯРА</span>
      </div>
      <nav className="bt-desktop-sidebar__nav" aria-label="Основная навигация">
        {items.map((item) => {
          const Icon = ICONS[item.id] || Paintbrush2;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? "bt-shell-nav-item is-active" : "bt-shell-nav-item"}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {footer && <div className="bt-desktop-sidebar__footer">{footer}</div>}
    </aside>
  );
}
