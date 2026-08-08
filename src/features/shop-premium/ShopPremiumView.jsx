import { useCallback, useEffect, useMemo, useState } from "react";
import { Backpack, Layers3, Store } from "lucide-react";
import { api } from "../../api.js";
import ShopHero from "./ShopHero.jsx";
import ShopTabs from "./ShopTabs.jsx";
import ShopProfilePreview from "./ShopProfilePreview.jsx";
import ShopOffers from "./ShopOffers.jsx";
import ShopFilters from "./ShopFilters.jsx";
import ShopCatalogGrid from "./ShopCatalogGrid.jsx";
import ShopFrameGroups from "./ShopFrameGroups.jsx";
import ShopCollectionsGrid from "./ShopCollectionsGrid.jsx";
import ShopInventoryGrid from "./ShopInventoryGrid.jsx";
import { groupByCollection } from "./shopCollections.js";
import { useAppearancePreview } from "./useAppearancePreview.js";
import "./shop-premium.css";

const SHOP_TABS = [
  { id: "showcase", label: "Витрина", icon: Store },
  { id: "collections", label: "Коллекции", icon: Layers3 },
  { id: "collection", label: "Моя коллекция", icon: Backpack },
];

export default function ShopPremiumView({ user, onUserUpdate }) {
  const [catalog, setCatalog] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [catalogError, setCatalogError] = useState("");

  const [inventory, setInventory] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  const [activeShopTab, setActiveShopTab] = useState("showcase");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTier, setActiveTier] = useState(null);

  const [buyingId, setBuyingId] = useState(null);
  const [buyMsg, setBuyMsg] = useState("");

  const appearance = useAppearancePreview(user, onUserUpdate);

  const loadCatalog = useCallback(() => {
    setCatalogError("");
    Promise.all([api.shopCatalog(), api.shopMyPurchases()])
      .then(([catalogData, purchasesData]) => {
        setCatalog(catalogData);
        setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      })
      .catch((error) => setCatalogError(error.message));
  }, []);

  useEffect(loadCatalog, [loadCatalog]);

  const loadInventory = useCallback(() => {
    setInventoryLoading(true);
    setInventoryError("");
    api
      .shopInventory()
      .then((data) => setInventory(Array.isArray(data) ? data : []))
      .catch((error) => setInventoryError(error.message))
      .finally(() => setInventoryLoading(false));
  }, []);

  useEffect(() => {
    if (activeShopTab === "collection" && inventory === null && !inventoryLoading) {
      loadInventory();
    }
  }, [activeShopTab, inventory, inventoryLoading, loadInventory]);

  function statusFor(itemId) {
    const relevant = purchases.filter((purchase) => purchase.item_id === itemId);
    if (relevant.some((purchase) => purchase.status === "fulfilled")) return "fulfilled";
    if (relevant.some((purchase) => purchase.status === "pending")) return "pending";
    return null;
  }

  async function buy(itemId) {
    setBuyingId(itemId);
    setBuyMsg("");
    try {
      await api.shopPurchase(itemId);
      setBuyMsg(
        "Заявка отправлена! Напиши мне (кнопка «Связь со мной» в меню слева), чтобы оплатить — после оплаты сразу применю украшение на твой аккаунт."
      );
      loadCatalog();
    } catch (error) {
      setBuyMsg(`Ошибка: ${error.message}`);
    } finally {
      setBuyingId(null);
    }
  }

  const categories = useMemo(
    () => [...new Set((catalog?.items || []).map((item) => item.category))],
    [catalog]
  );

  const showcaseItems = useMemo(() => {
    const items = catalog?.items || [];
    return activeCategory ? items.filter((item) => item.category === activeCategory) : items;
  }, [catalog, activeCategory]);

  const collectionGroups = useMemo(() => groupByCollection(catalog?.items), [catalog]);

  function changeCategory(category) {
    setActiveCategory(category);
    setActiveTier(null);
  }

  return (
    <div className="shop-premium">
      <div className="shop-premium__glow" aria-hidden="true" />
      <ShopHero purchasesEnabled={catalog?.purchases_enabled} itemCount={catalog?.items?.length || 0} />

      <div className="shop-premium-workspace">
        <div className="shop-premium-main">
          <ShopTabs tabs={SHOP_TABS} active={activeShopTab} onChange={setActiveShopTab} />

          {buyMsg && <p className="shop-premium-message">{buyMsg}</p>}

          {activeShopTab === "showcase" && (
            <>
              <ShopOffers
                packages={catalog?.packages}
                plans={catalog?.premium_plans}
                purchasesEnabled={catalog?.purchases_enabled}
                statusFor={statusFor}
                buyingId={buyingId}
                onBuy={buy}
              />
              <ShopFilters
                categories={categories}
                active={activeCategory}
                onChange={changeCategory}
                totalCount={catalog?.items?.length || 0}
              />
              {activeCategory === "frame" && showcaseItems.length > 0 ? (
                <ShopFrameGroups
                  items={showcaseItems}
                  activeTier={activeTier}
                  onTierChange={setActiveTier}
                  statusFor={statusFor}
                  appearance={appearance}
                  purchasesEnabled={catalog?.purchases_enabled}
                />
              ) : (
                <ShopCatalogGrid
                  items={showcaseItems}
                  loading={!catalog && !catalogError}
                  error={catalogError}
                  purchasesEnabled={catalog?.purchases_enabled}
                  statusFor={statusFor}
                  appearance={appearance}
                />
              )}
            </>
          )}

          {activeShopTab === "collections" && (
            <ShopCollectionsGrid groups={collectionGroups} onTryOn={appearance.previewItem} />
          )}

          {activeShopTab === "collection" && (
            <ShopInventoryGrid
              items={inventory}
              loading={inventoryLoading}
              error={inventoryError}
              appearance={appearance}
            />
          )}
        </div>

        <ShopProfilePreview user={user} appearance={appearance} statusFor={statusFor} buyingId={buyingId} onBuy={buy} />
      </div>
    </div>
  );
}
