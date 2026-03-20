import { useState } from "react";
import { ReelData, formatNumber, generateRandomReel } from "@/lib/mockData";
import { parseInputNumber } from "@/lib/utils";
import { UserPlus, Grid3X3, Menu, Plus, Bookmark, Heart, Lock, Footprints, Share, ChevronDown } from "lucide-react";
import avatar from "@/assets/avatar.jpg";
import TikTokStudioPanel from "./TikTokStudioPanel";

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  statusText: string;
  followers: string;
  following: string;
}

interface ProfileHeaderProps {
  reels: ReelData[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSetReels?: (reels: ReelData[]) => void;
}

const ProfileHeader = ({ reels, activeTab, onTabChange, onSetReels }: ProfileHeaderProps) => {
  const totalLikes = reels.reduce((sum, r) => sum + r.insights.likes, 0);
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("user_profile");
    return saved ? JSON.parse(saved) : {
      username: "officialzyrozo",
      displayName: "Locus",
      bio: "UGC Creator ✨\nProduct | Lifestyle | Reels\nHelping brands grow organically 🌱\n🧑‍🎨 Open for collaborations",
      statusText: "On your mind...",
      followers: "59",
      following: reels.length.toString(),
    };
  });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>(profile);
  const [postCount, setPostCount] = useState(reels.length.toString());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => {
    return localStorage.getItem("user_avatar") || null;
  });

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...editForm,
      following: parseInputNumber(editForm.following).toString(),
      followers: parseInputNumber(editForm.followers).toString(),
    };
    setProfile(updatedProfile);
    localStorage.setItem("user_profile", JSON.stringify(updatedProfile));

    // Handle post count change - generate random reels if count increased
    const targetCount = parseInt(postCount) || reels.length;
    if (targetCount !== reels.length && onSetReels) {
      let newReels: ReelData[];
      if (targetCount > reels.length) {
        // Add more random reels
        const toAdd = targetCount - reels.length;
        const additionalReels = Array.from({ length: toAdd }, (_, i) =>
          generateRandomReel(reels.length + i + 1)
        );
        newReels = [...reels, ...additionalReels];
      } else {
        // Remove reels from end
        newReels = reels.slice(0, targetCount);
      }
      onSetReels(newReels);
    }

    setEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAvatarPreview(dataUrl);
        localStorage.setItem("user_avatar", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-11 mt-2">
        <UserPlus className="w-7 h-7 text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <Footprints className="w-7 h-7 text-foreground" strokeWidth={1.5} />
          <Share className="w-6 h-6 text-foreground" strokeWidth={1.5} />
          <Menu className="w-7 h-7 text-foreground" strokeWidth={1.5} />
        </div>
      </div>

      {/* Avatar + Speech bubble */}
      <div className="flex justify-center mt-1">
        <div className="relative">
          <div className="absolute -top-5 -left-6 z-10">
            <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-md">
              <span className="text-foreground text-[12px] font-medium">{profile.statusText}</span>
            </div>
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
          </div>
          <div className="w-[96px] h-[96px] rounded-full overflow-hidden border-[2px] border-border">
            <img src={avatarPreview || avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-[hsl(var(--tiktok-cyan))] flex items-center justify-center border-2 border-background">
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Display Name + Edit button */}
      <div className="flex flex-col items-center justify-center mt-2 px-4">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center">
            <div className="flex items-center gap-0">
              <h1 className="text-foreground font-black text-[17.5px] tracking-tight">{profile.displayName}</h1>
              <ChevronDown className="w-4 h-4 text-foreground translate-y-[1px]" strokeWidth={3.5} />
            </div>
            
            <button
              onClick={() => {
                setEditForm(profile);
                setPostCount(reels.length.toString());
                setEditing(true);
              }}
              className="absolute left-[calc(100%+4px)] bg-secondary text-foreground text-[14px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
            >
              Edit
            </button>
          </div>
          <p className="text-muted-foreground/60 text-[13px] font-bold mt-1">@{profile.username}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <StatColumn value={formatNumber(parseInputNumber(profile.following))} label="Following" />
        <div className="w-[1px] h-3 bg-border/60" />
        <StatColumn value={formatNumber(parseInputNumber(profile.followers))} label="Followers" />
        <div className="w-[1px] h-3 bg-border/60" />
        <StatColumn value={formatNumber(totalLikes)} label="Likes" />
      </div>

      {/* Bio / Links / TikTok Studio */}
      <div className="flex flex-col items-center text-center mt-1.5 px-8 mb-1">
        {profile.bio && <p className="text-foreground text-[14px] whitespace-pre-line font-medium leading-[1.3] mb-2">{profile.bio}</p>}
        <button className="flex items-center gap-1.5" onClick={() => setShowAnalytics(true)}>
          <svg className="w-[16px] h-[16px] text-[#fe2c55]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.243 2 7 4.243 7 7C7 9.757 9.243 12 12 12C14.757 12 17 9.757 17 7C17 4.243 14.757 2 12 2Z"/>
            <path d="M15.968 12.956C14.782 12.348 13.434 12 12 12C7.038 12 3 16.037 3 21H14.12C14.65 19.34 15.82 18.06 17.65 17.6L15.968 12.956Z" />
            <path d="M22 13l-1.5 2.5L18 16l2.5 1.5L21 21l1.5-2.5L25 17l-2.5-1.5z" fill="#fe2c55" />
          </svg>
          <span className="text-[14px] font-semibold text-foreground">TikTok Studio</span>
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && <TikTokStudioPanel onClose={() => setShowAnalytics(false)} />}

      {/* Tabs */}
      <div className="flex mt-1.5 border-b border-border">
        <TabBtn active={activeTab === "grid"} onClick={() => onTabChange("grid")} icon={Grid3X3} />
        <TabBtn active={activeTab === "locked"} onClick={() => onTabChange("locked")} icon={Lock} />
        <TabBtn active={activeTab === "saved"} onClick={() => onTabChange("saved")} icon={Bookmark} />
        <TabBtn active={activeTab === "liked"} onClick={() => onTabChange("liked")} icon={Heart} />
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-end justify-center" onClick={() => setEditing(false)}>
          <div
            className="w-full max-w-lg bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-foreground font-bold text-lg">Edit Profile</h2>
              <button
                onClick={handleSaveProfile}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold"
              >
                Save
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Avatar change */}
              <div className="flex flex-col items-center">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-border mb-2">
                  <img src={avatarPreview || avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="text-primary text-[13px] font-semibold cursor-pointer">
                  Change photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Display Name</label>
                <input type="text" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Status (On your mind...)</label>
                <input type="text" value={editForm.statusText} onChange={(e) => setEditForm({ ...editForm, statusText: e.target.value })}
                  className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3}
                  className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none resize-none" />
              </div>

              {/* Stats Section */}
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">Stats</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Following</label>
                  <input type="text" value={editForm.following} onChange={(e) => setEditForm({ ...editForm, following: e.target.value })}
                    className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Followers</label>
                  <input type="text" value={editForm.followers} onChange={(e) => setEditForm({ ...editForm, followers: e.target.value })}
                    className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
                </div>
              </div>

              {/* Posts Section */}
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">Posts</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Total Posts</label>
                <input type="number" value={postCount} onChange={(e) => setPostCount(e.target.value)}
                  min={0} max={200}
                  className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Current: {reels.length} posts. Change number to auto-generate or remove posts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatColumn = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center min-w-[70px]">
    <p className="text-foreground font-black text-[17px] leading-tight">{value}</p>
    <p className="text-muted-foreground/80 text-[13px] font-medium tracking-tight mt-0.5">{label}</p>
  </div>
);

const TabBtn = ({
  active,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <button
    onClick={onClick}
    className="flex-1 py-2.5 flex flex-col items-center gap-1.5 transition-colors relative"
  >
    <Icon className={`w-[26px] h-[26px] ${active ? "text-foreground" : "text-muted-foreground"}`} />
    {active && <div className="absolute bottom-0 w-12 h-[2px] bg-foreground" />}
  </button>
);

export default ProfileHeader;