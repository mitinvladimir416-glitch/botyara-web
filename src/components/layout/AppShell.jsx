import AmbientBackground from "./AmbientBackground.jsx";
import DesktopTopbar from "./DesktopTopbar.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";

export default function AppShell({
  active,
  navItems,
  onNavigate,
  user,
  viewMode = "desktop",
  sidebar,
  topbar,
  contextPanel,
  overlays,
  children,
}) {
  const currentItem = navItems.find((item) => item.id === active);
  const title = currentItem?.label || "БОТЯРА";
  const classes = [
    "app-shell",
    "bt-app-shell",
    viewMode === "mobile" ? "bt-app-shell--mobile" : "bt-app-shell--desktop",
    contextPanel && "bt-app-shell--with-context",
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} data-bt-ui>
      <a className="bt-app-shell__skip" href="#bt-main-content">К основному содержимому</a>
      <AmbientBackground />
      <div className="bt-app-shell__sidebar">{sidebar}</div>
      <div className="bt-app-shell__topbar">
        <DesktopTopbar title={title} />
        <MobileHeader title={title} user={user} />
      </div>
      <div className="bt-app-shell__actions">{topbar}</div>
      <main id="bt-main-content" className="content bt-app-shell__content" tabIndex={-1}>
        {children}
      </main>
      {contextPanel && <aside className="bt-app-shell__context" aria-label="Контекстная панель">{contextPanel}</aside>}
      <MobileBottomNav active={active} items={navItems} onNavigate={onNavigate} />
      {overlays}
    </div>
  );
}
