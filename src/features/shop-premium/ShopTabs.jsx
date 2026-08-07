export default function ShopTabs({ tabs, active, onChange }) {
  return (
    <div className="shop-premium-tabs" role="tablist" aria-label="Разделы магазина">
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
