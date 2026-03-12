import { useState, useCallback, useEffect, useRef } from "react";
import { generateMockReels, ReelData } from "@/lib/mockData";
import ProfileHeader from "@/components/ProfileHeader";
import VideoGrid from "@/components/VideoGrid";
import VideoDetail from "@/components/VideoDetail";
import EditModal from "@/components/EditModal";
import InsightsPanel from "@/components/InsightsPanel";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import PullToRefresh from "@/components/PullToRefresh";
import InboxPage from "@/components/InboxPage";

const Index = () => {
  const [reels, setReels] = useState<ReelData[]>(() => {
    const saved = localStorage.getItem("user_reels");
    return saved ? JSON.parse(saved) : generateMockReels();
  });
  const [selectedReel, setSelectedReel] = useState<ReelData | null>(null);
  const [editingReel, setEditingReel] = useState<ReelData | null>(null);
  const [insightsReel, setInsightsReel] = useState<ReelData | null>(null);
  const [profileTab, setProfileTab] = useState("grid");
  const [navTab, setNavTab] = useState(() => localStorage.getItem("last_nav_tab") || "profile");
  const navHistory = useRef<string[]>([localStorage.getItem("last_nav_tab") || "profile"]);

  // Handle tab change with history tracking
  const handleNavTab = useCallback((tab: string) => {
    setNavTab((prev) => {
      if (tab !== prev) {
        navHistory.current.push(tab);
        localStorage.setItem("last_nav_tab", tab);
        window.history.pushState({ tab }, "", "");
      }
      return tab;
    });
  }, []);

  // Browser back: close overlays first, then navigate tabs, then exit
  useEffect(() => {
    // Restore theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    }
    
    // Ensure history is initialized
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: navTab }, "", "");
    }
    const handlePopState = () => {
      if (insightsReel) { setInsightsReel(null); window.history.pushState({}, "", ""); return; }
      if (editingReel) { setEditingReel(null); window.history.pushState({}, "", ""); return; }
      if (selectedReel) { setSelectedReel(null); window.history.pushState({}, "", ""); return; }
      if (navHistory.current.length > 1) {
        navHistory.current.pop();
        const prevTab = navHistory.current[navHistory.current.length - 1];
        setNavTab(prevTab);
        window.history.pushState({ tab: prevTab }, "", "");
      } else {
        window.history.back();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navTab, selectedReel, editingReel, insightsReel]);

  // Save reels to localStorage whenever they change
  const saveReels = useCallback((newReels: ReelData[]) => {
    setReels(newReels);
    localStorage.setItem("user_reels", JSON.stringify(newReels));
  }, []);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
  }, []);

  const handleReelClick = useCallback((reel: ReelData) => {
    setSelectedReel(reel);
    window.history.pushState({ overlay: "detail" }, "", "");
  }, []);

  const handleLongPress = useCallback((reel: ReelData) => {
    setEditingReel(reel);
    window.history.pushState({ overlay: "edit" }, "", "");
  }, []);

  const handleSave = useCallback((updated: ReelData) => {
    saveReels(reels.map((r) => (r.id === updated.id ? updated : r)));
    setEditingReel(null);
    setSelectedReel((prev) => (prev?.id === updated.id ? updated : prev));
    setInsightsReel((prev) => (prev?.id === updated.id ? updated : prev));
  }, [reels, saveReels]);

  const handleAddReel = useCallback(() => {
    const newReel: ReelData = {
      id: Date.now().toString(),
      title: "New Reel",
      description: "",
      tags: [],
      thumbnail: "",
      duration: "0:00",
      createdAt: new Date().toISOString().split("T")[0],
      music: "original sound",
      username: "@priya_creates",
      insights: {
        views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
        avgWatchTime: 0, totalPlayTime: 0, reachedAudience: 0,
        profileVisits: 0, followsFromPost: 0,
        trafficSources: { forYouPage: 0, following: 0, profile: 0, search: 0, sounds: 0, hashtags: 0 },
        audienceRegions: [],
        viewsByDay: [],
        genderSplit: { male: 0, female: 0, other: 0 },
        ageGroups: [],
      },
    };
    setEditingReel(newReel);
    window.history.pushState({ overlay: "edit" }, "", "");
  }, []);

  const handleSaveNew = useCallback((updated: ReelData) => {
    // Check if it's a new reel (not in current reels list)
    const exists = reels.find((r) => r.id === updated.id);
    if (exists) {
      saveReels(reels.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      saveReels([...reels, updated]);
    }
    setEditingReel(null);
    setSelectedReel((prev) => (prev?.id === updated.id ? updated : prev));
    setInsightsReel((prev) => (prev?.id === updated.id ? updated : prev));
  }, [reels, saveReels]);

  const handleInsights = useCallback(() => {
    if (selectedReel) {
      const latest = reels.find((r) => r.id === selectedReel.id) || selectedReel;
      setInsightsReel(latest);
      window.history.pushState({ overlay: "insights" }, "", "");
    }
  }, [selectedReel, reels]);

  const currentSelectedReel = selectedReel ? reels.find((r) => r.id === selectedReel.id) || selectedReel : null;
  const currentInsightsReel = insightsReel ? reels.find((r) => r.id === insightsReel.id) || insightsReel : null;

  return (
    <div className="h-screen bg-background max-w-lg mx-auto relative flex flex-col">
      {/* Home Feed */}
      {(navTab === "home" || navTab === "friends") && <HomeFeed reels={reels} onSave={handleSave} />}

      {/* Inbox */}
      {navTab === "inbox" && <InboxPage />}
      {/* Profile page */}
      {navTab === "profile" && (
        <PullToRefresh onRefresh={handleRefresh}>
          <ProfileHeader reels={reels} activeTab={profileTab} onTabChange={setProfileTab} onSetReels={saveReels} />
          <div className="pb-14">
            <VideoGrid reels={reels} onReelClick={handleReelClick} onLongPress={handleLongPress} onAddReel={handleAddReel} />
          </div>
        </PullToRefresh>
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab={navTab} onTabChange={handleNavTab} />

      {/* Overlays */}
      {currentSelectedReel && (
        <VideoDetail
          reel={currentSelectedReel}
          onBack={() => setSelectedReel(null)}
          onInsights={handleInsights}
          onLongPress={() => setEditingReel(currentSelectedReel)}
          onSave={handleSave}
        />
      )}

      {editingReel && (
        <EditModal
          reel={reels.find((r) => r.id === editingReel.id) || editingReel}
          onSave={handleSaveNew}
          onClose={() => setEditingReel(null)}
        />
      )}

      {currentInsightsReel && (
        <InsightsPanel reel={currentInsightsReel} onClose={() => setInsightsReel(null)} onSave={handleSave} />
      )}
    </div>
  );
};

export default Index;
