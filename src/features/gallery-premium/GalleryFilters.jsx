import { categoryFor } from "./galleryCategories.js";

export default function GalleryFilters({ categories, activeCategory, onChange, totalCount }) {
  if (!categories.length) return null;

  return (
    <div className="gallery-premium-filters" role="tablist" aria-label="Категории галереи">
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === null}
        className={activeCategory === null ? "is-active" : ""}
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
            aria-selected={activeCategory === key}
            className={activeCategory === key ? "is-active" : ""}
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
