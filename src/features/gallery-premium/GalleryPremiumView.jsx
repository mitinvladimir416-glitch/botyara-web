import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api.js";
import GalleryHero from "./GalleryHero.jsx";
import GalleryFilters from "./GalleryFilters.jsx";
import GalleryGrid from "./GalleryGrid.jsx";
import GalleryPostDetail from "./GalleryPostDetail.jsx";
import { totalReactions } from "./galleryCategories.js";
import "./gallery-premium.css";

export default function GalleryPremiumView({ isAdmin = false }) {
  const [posts, setPosts] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const load = useCallback(() => {
    setLoadError("");
    api
      .listGallery(search)
      .then(setPosts)
      .catch((err) => setLoadError(err.message));
  }, [search]);

  useEffect(load, [load]);

  async function reactToPost(postId, emoji) {
    try {
      const res = await api.reactToGalleryPost(postId, emoji);
      setPosts((prev) =>
        (prev || []).map((post) =>
          post.id === postId ? { ...post, reactions: res.reactions, my_reaction: res.my_reaction } : post
        )
      );
    } catch (err) {
      setLoadError(err.message);
    }
  }

  const categories = useMemo(
    () => [...new Set((posts || []).map((post) => post.category || "other"))],
    [posts]
  );

  const visiblePosts = useMemo(() => {
    if (!posts) return [];
    return activeCategory ? posts.filter((post) => (post.category || "other") === activeCategory) : posts;
  }, [posts, activeCategory]);

  const spotlightPost = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    return [...posts].sort((a, b) => totalReactions(b) - totalReactions(a))[0];
  }, [posts]);

  function openPost(id) {
    setSelectedPostId(id);
  }

  function backToFeed() {
    setSelectedPostId(null);
    load();
  }

  function submitSearch() {
    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
  }

  if (selectedPostId) {
    return (
      <div className="gallery-premium">
        <GalleryPostDetail postId={selectedPostId} isAdmin={isAdmin} onBack={backToFeed} />
      </div>
    );
  }

  return (
    <div className="gallery-premium">
      <GalleryHero
        total={posts ? posts.length : 0}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={submitSearch}
        activeSearch={search}
        onClearSearch={clearSearch}
        spotlightPost={spotlightPost}
        onOpenSpotlight={spotlightPost ? () => openPost(spotlightPost.id) : undefined}
      />

      <section className="gallery-premium-feed" aria-labelledby="gallery-premium-feed-title">
        <div className="gallery-premium-section-heading">
          <h2 id="gallery-premium-feed-title">Лента публикаций</h2>
          <p>Свежие промпты сообщества — фильтруй по категориям или ищи по ключевым словам.</p>
        </div>

        <GalleryFilters
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          totalCount={posts ? posts.length : 0}
        />

        <GalleryGrid
          posts={visiblePosts}
          loading={posts === null}
          error={loadError}
          onOpenPost={openPost}
          onReact={reactToPost}
          hasSearch={!!search}
        />
      </section>
    </div>
  );
}
