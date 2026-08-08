import { useEffect, useState } from "react";
import { Settings, UserRound } from "lucide-react";
import { api } from "../../api.js";
import ProfileTabs from "./ProfileTabs.jsx";
import ProfileHero from "./ProfileHero.jsx";
import ProfileLevelCard from "./ProfileLevelCard.jsx";
import ProfileStyleCard from "./ProfileStyleCard.jsx";
import ProfileAchievements from "./ProfileAchievements.jsx";
import ProfileActivity from "./ProfileActivity.jsx";
import ProfileSettings from "./ProfileSettings.jsx";
import "./profile-premium.css";

const PROFILE_TABS = [
  { id: "profile", label: "Профиль", icon: UserRound },
  { id: "settings", label: "Настройки", icon: Settings },
];

export default function ProfilePremiumView({ user, onUserUpdate, onLogout, viewMode, onToggleViewMode }) {
  const [activeProfileTab, setActiveProfileTab] = useState("profile");

  const [achievements, setAchievements] = useState(null);
  const [achievementsError, setAchievementsError] = useState("");

  const [galleryPosts, setGalleryPosts] = useState(null);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    api
      .listAchievements()
      .then(setAchievements)
      .catch((error) => setAchievementsError(error.message));
  }, []);

  useEffect(() => {
    api
      .getPublicProfile(user.id)
      .then((profile) => setGalleryPosts(profile.gallery_posts || []))
      .catch((error) => setActivityError(error.message));
  }, [user.id]);

  return (
    <div className="profile-premium">
      <ProfileHero user={user} />

      <div className="profile-premium-workspace">
        <ProfileTabs tabs={PROFILE_TABS} active={activeProfileTab} onChange={setActiveProfileTab} />

        {activeProfileTab === "profile" ? (
          <div className="profile-premium-dashboard">
            <div className="profile-premium-dashboard__row">
              <ProfileLevelCard user={user} />
              <ProfileStyleCard user={user} onUserUpdate={onUserUpdate} />
            </div>

            <ProfileAchievements achievements={achievements} loading={achievements === null && !achievementsError} error={achievementsError} />

            <ProfileActivity posts={galleryPosts} loading={galleryPosts === null && !activityError} error={activityError} />
          </div>
        ) : (
          <ProfileSettings
            user={user}
            onUserUpdate={onUserUpdate}
            onLogout={onLogout}
            viewMode={viewMode}
            onToggleViewMode={onToggleViewMode}
          />
        )}
      </div>
    </div>
  );
}
