export default function ProfileTabs({ tabs, active, onChange }) {
  return (
    <div className="profile-premium-tabs" role="tablist" aria-label="Разделы профиля">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? "is-active" : ""}
            onClick={() => onChange(tab.id)}
          >
            <Icon size={15} strokeWidth={1.8} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
