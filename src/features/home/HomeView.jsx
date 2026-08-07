import { useEffect, useState } from "react";
import { api } from "../../api.js";
import HomeHero from "./HomeHero.jsx";
import UserLevelCard from "./UserLevelCard.jsx";
import QuickActions from "./QuickActions.jsx";
import ActivityFeed from "./ActivityFeed.jsx";
import "./home.css";

export default function HomeView({ user, onNavigate }) {
  const displayName =
    user.display_name ||
    user.telegram_first_name ||
    user.email?.split("@")[0] ||
    "друг";
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setActivityError("");

    Promise.allSettled([api.listNotifications(), api.listAchievements()])
      .then(([notificationResult, achievementResult]) => {
        if (cancelled) return;
        if (notificationResult.status === "fulfilled") {
          setNotifications(Array.isArray(notificationResult.value) ? notificationResult.value : []);
        } else {
          setNotifications([]);
          setActivityError(notificationResult.reason?.message || "Попробуйте обновить данные.");
        }
        if (achievementResult.status === "fulfilled") {
          setAchievements(Array.isArray(achievementResult.value) ? achievementResult.value : []);
        } else {
          setAchievements([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const openNotifications = () =>
    window.dispatchEvent(new CustomEvent("botyara-open-notifications"));
  const earnedAchievements = achievements.filter((achievement) => achievement.earned);

  return (
    <div className="premium-home">
      <div className="premium-home__workspace">
        <HomeHero
          displayName={displayName}
          level={user.level}
          levelTitle={user.level_title}
          streak={user.current_streak}
          status={user.status}
          onStart={() => onNavigate("chat")}
        />
        <UserLevelCard
          user={user}
          displayName={displayName}
          achievementCount={earnedAchievements.length}
          onOpenProfile={() => onNavigate("account")}
        />
        <QuickActions onNavigate={onNavigate} />
        <ActivityFeed
          items={notifications}
          achievements={earnedAchievements}
          level={user.level}
          levelTitle={user.level_title}
          streak={user.current_streak}
          loading={loading}
          error={activityError}
          onRetry={() => setReloadKey((value) => value + 1)}
          onOpenNotifications={openNotifications}
        />
      </div>
    </div>
  );
}
