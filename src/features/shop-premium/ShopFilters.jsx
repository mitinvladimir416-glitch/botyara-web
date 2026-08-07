import { categoryFor } from "./shopCategories.js";

export default function ShopFilters({ categories, active, onChange, totalCount }) {
  if (!categories.length) return null;

  return (
    <div className="shop-premium-filters" role="tablist" aria-label="Категории витрины">
      <button
        type="button"
        role="tab"
        aria-selected={active === null}
        className={active === null ? "is-active" : ""}
        onClick={() => onChange(null)}
      >
        Все <span>{totalCount}</span>
      </button>

      {categories.map((key) => {
        const meta = categoryFor(key);
        const Icon = meta.icon;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            className={active === key ? "is-active" : ""}
            onClick={() => onChange(key)}
          >
            <Icon size={14} strokeWidth={1.8} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
