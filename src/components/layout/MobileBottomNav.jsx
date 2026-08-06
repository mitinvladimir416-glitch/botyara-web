import { useEffect, useRef, useState } from "react";
import {
  Ellipsis,
  GalleryVerticalEnd,
  Home,
  Languages,
  LayoutDashboard,
  MessageCircle,
  Music2,
  Newspaper,
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

const PRIMARY_IDS = ["home", "chat", "prompts", "gallery"];

function NavButton({ item, active, onSelect }) {
  const Icon = ICONS[item.id] || Sparkles;
  const isActive = active === item.id;
  return (
    <button
      type="button"
      className={isActive ? "bt-mobile-nav__item is-active" : "bt-mobile-nav__item"}
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

export default function MobileBottomNav({ active, items, onNavigate }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const rootRef = useRef(null);
  const primary = PRIMARY_IDS.map((id) => items.find((item) => item.id === id)).filter(Boolean);
  const overflow = items.filter((item) => !PRIMARY_IDS.includes(item.id));
  const overflowActive = overflow.some((item) => item.id === active);

  useEffect(() => {
    if (!moreOpen) return undefined;
    function closeOnOutside(event) {
      if (!rootRef.current?.contains(event.target)) setMoreOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  function select(id) {
    onNavigate(id);
    setMoreOpen(false);
  }

  return (
    <div ref={rootRef} className="bt-mobile-nav-wrap" data-bt-ui>
      {moreOpen && (
        <div className="bt-mobile-nav__more" role="menu" aria-label="Другие разделы">
          {overflow.map((item) => {
            const Icon = ICONS[item.id] || Sparkles;
            return (
              <button key={item.id} type="button" role="menuitem" onClick={() => select(item.id)}>
                <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
      <nav className="bt-mobile-nav" aria-label="Мобильная навигация">
        {primary.map((item) => <NavButton key={item.id} item={item} active={active} onSelect={select} />)}
        <button
          type="button"
          className={overflowActive || moreOpen ? "bt-mobile-nav__item is-active" : "bt-mobile-nav__item"}
          onClick={() => setMoreOpen((value) => !value)}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
        >
          <Ellipsis size={21} strokeWidth={1.7} aria-hidden="true" />
          <span>Ещё</span>
        </button>
      </nav>
    </div>
  );
}
