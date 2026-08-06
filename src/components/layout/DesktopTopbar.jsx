export default function DesktopTopbar({ title }) {
  return (
    <header className="bt-desktop-topbar" data-bt-ui>
      <div className="bt-desktop-topbar__heading">
        <span className="bt-desktop-topbar__section">БОТЯРА</span>
        <strong>{title}</strong>
      </div>
    </header>
  );
}
