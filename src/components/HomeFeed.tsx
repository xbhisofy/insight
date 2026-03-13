import { useState, useRef, useCallback, useEffect } from "react";
import { ReelData, formatNumber } from "@/lib/mockData";
import { Heart, MessageCircle, Bookmark, Share2, Music, Search, X, Save, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import avatar from "@/assets/avatar.jpg";

interface HomeFeedProps {
  reels: ReelData[];
  onSave?: (updated: ReelData) => void;
}

const HomeFeed = ({ reels, onSave }: HomeFeedProps) => {
  const [activeTopTab, setActiveTopTab] = useState("foryou");
  const [editingReel, setEditingReel] = useState<ReelData | null>(null);

  return (
    <div className="fixed inset-0 z-30 bg-black">
      {/* Top tabs */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 max-w-lg mx-auto">
        <div className="w-8" />
        <div className="flex items-center gap-5">
          <button
            onClick={() => setActiveTopTab("explore")}
            className={`text-[16px] transition-colors ${activeTopTab === "explore" ? "text-white font-bold" : "text-white/60 font-medium"}`}
          >
            Explore
          </button>
          <div className="relative">
            <button
              onClick={() => setActiveTopTab("following")}
              className={`text-[16px] transition-colors ${activeTopTab === "following" ? "text-white font-bold" : "text-white/60 font-medium"}`}
            >
              Following
            </button>
            <div className="absolute -top-0.5 -right-2 w-[6px] h-[6px] rounded-full bg-[hsl(var(--tiktok-red))]" />
          </div>
          <button
            onClick={() => setActiveTopTab("foryou")}
            className={`relative text-[16px] transition-colors ${activeTopTab === "foryou" ? "text-white font-bold" : "text-white/60 font-medium"}`}
          >
            For You
            {activeTopTab === "foryou" && (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-white rounded-full" />
            )}
          </button>
        </div>
        <Search className="w-6 h-6 text-white" />
      </div>

      {/* Scrollable feed */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide max-w-lg mx-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {reels.map((reel) => (
          <FeedCard key={reel.id} reel={reel} onLongPress={() => setEditingReel(reel)} />
        ))}
      </div>

      {/* Edit modal */}
      {editingReel && (
        <HomeFeedEditSheet
          reel={editingReel}
          onSave={(updated) => {
            onSave?.(updated);
            setEditingReel(null);
          }}
          onClose={() => setEditingReel(null)}
        />
      )}
    </div>
  );
};

const FeedCard = ({ reel, onLongPress }: { reel: ReelData; onLongPress: () => void }) => {
  const ins = reel.insights;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);
  const [pressing, setPressing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Autoplay video when visible using IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [reel.videoUrl]);

  const handlePointerDown = useCallback(() => {
    triggered.current = false;
    setPressing(true);
    timerRef.current = setTimeout(() => {
      triggered.current = true;
      setPressing(false);
      onLongPress();
    }, 2000);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    setPressing(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen snap-start snap-always flex-shrink-0 select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Video or thumbnail */}
      {reel.videoUrl ? (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="auto"
          poster={reel.thumbnail}
        />
      ) : (
        <img src={reel.thumbnail} alt={reel.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 50%, rgba(0,0,0,0.85) 100%)' }} />

      {/* Long press indicator - removed spinner */}

      {/* Right side actions */}
      <div className="absolute right-3 bottom-36 z-10 flex flex-col items-center gap-5">
        <div className="relative mb-1">
          <div className="w-12 h-12 rounded-full overflow-hidden border-[2px] border-white">
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[hsl(var(--tiktok-red))] rounded-full flex items-center justify-center border-2 border-black">
            <span className="text-white text-[12px] font-bold leading-none">+</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Heart className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
          <span className="text-white text-[12px] font-semibold mt-1 drop-shadow-lg">{formatNumber(ins.likes)}</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
          <span className="text-white text-[12px] font-semibold mt-1 drop-shadow-lg">{formatNumber(ins.comments)}</span>
        </div>
        <div className="flex flex-col items-center">
          <Bookmark className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
          <span className="text-white text-[12px] font-semibold mt-1 drop-shadow-lg">{formatNumber(ins.saves)}</span>
        </div>
        <div className="flex flex-col items-center">
          <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
          <span className="text-white text-[12px] font-semibold mt-1 drop-shadow-lg">{formatNumber(ins.shares)}</span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-16 left-0 right-14 z-10 px-4">
        <p className="text-white font-bold text-[16px] drop-shadow-lg mb-1.5">{reel.title}</p>
        <p className="text-white text-[14px] drop-shadow-lg leading-[1.4] mb-1.5 line-clamp-2">{reel.description}</p>
        <div className="flex flex-wrap gap-1 mb-1">
          {reel.tags.map((tag) => (
            <span key={tag} className="text-white text-[13px] font-medium drop-shadow-lg">#{tag}</span>
          ))}
          <span className="text-white/70 text-[13px]">...more</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Music className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-white text-[13px] drop-shadow-lg truncate">{reel.music}</span>
        </div>
      </div>

      {/* Spinning music disc */}
      <div className="absolute right-3 bottom-[68px] z-10">
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden border-[5px] border-[#282828] animate-spin" style={{ animationDuration: '3s' }}>
          <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Sheet for Home Feed reel ─── */
const HomeFeedEditSheet = ({ reel, onSave, onClose }: { reel: ReelData; onSave: (r: ReelData) => void; onClose: () => void }) => {
  const [title, setTitle] = useState(reel.title);
  const [description, setDescription] = useState(reel.description);
  const [tags, setTags] = useState(reel.tags.join(", "));
  const [music, setMusic] = useState(reel.music);
  const [username, setUsername] = useState(reel.username);
  const [thumbnail, setThumbnail] = useState(reel.thumbnail);
  const [videoUrl, setVideoUrl] = useState(reel.videoUrl || "");
  const [views, setViews] = useState(reel.insights.views.toString());
  const [likes, setLikes] = useState(reel.insights.likes.toString());
  const [comments, setComments] = useState(reel.insights.comments.toString());
  const [shares, setShares] = useState(reel.insights.shares.toString());
  const [saves, setSaves] = useState(reel.insights.saves.toString());
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("thumbnail");
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, setProgress);
      setThumbnail(result.secure_url);
    } catch (err) { console.error("Upload failed:", err); }
    setUploading(null);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("video");
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, setProgress);
      setVideoUrl(result.secure_url);
    } catch (err) { console.error("Upload failed:", err); }
    setUploading(null);
  };

  const handleSave = () => {
    onSave({
      ...reel,
      title, description, music, username, thumbnail,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      videoUrl: videoUrl || undefined,
      insights: {
        ...reel.insights,
        views: parseInt(views) || 0,
        likes: parseInt(likes) || 0,
        comments: parseInt(comments) || 0,
        shares: parseInt(shares) || 0,
        saves: parseInt(saves) || 0,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-foreground font-bold text-lg">Edit Reel</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={!!uploading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${uploading ? "bg-[#8a8b91] text-white cursor-not-allowed" : "bg-primary text-primary-foreground"}`}>
              {uploading ? <>Processing... {progress}%</> : <><Save className="w-4 h-4" />Done</>}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {/* Media */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border relative">
              <img src={thumbnail} alt="" className="w-full h-full object-cover" />
              {uploading === "thumbnail" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{progress}%</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className={`flex items-center gap-1.5 text-[hsl(var(--tiktok-cyan))] text-[13px] font-semibold cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading === "thumbnail" ? null : <span>📷</span>} Change Thumbnail
                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
              </label>
              <label className={`flex items-center gap-1.5 text-primary text-[13px] font-semibold cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading === "video" ? null : <span>🎬</span>} {videoUrl ? "Change Video" : "Upload Video"}
                <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </label>
            </div>
          </div>
          {uploading && (
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          <Field label="Username" value={username} onChange={setUsername} />
          <Field label="Title" value={title} onChange={setTitle} />
          <FieldArea label="Caption / Description" value={description} onChange={setDescription} />
          <Field label="Tags (comma separated)" value={tags} onChange={setTags} />
          <Field label="Music" value={music} onChange={setMusic} />

          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">Stats</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Views" value={views} onChange={setViews} />
            <NumField label="Likes" value={likes} onChange={setLikes} />
            <NumField label="Comments" value={comments} onChange={setComments} />
            <NumField label="Shares" value={shares} onChange={setShares} />
            <NumField label="Saves" value={saves} onChange={setSaves} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs text-muted-foreground font-medium mb-0.5 block">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
  </div>
);

const FieldArea = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs text-muted-foreground font-medium mb-0.5 block">{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none resize-none" />
  </div>
);

const NumField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs text-muted-foreground font-medium mb-0.5 block">{label}</label>
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
  </div>
);

export default HomeFeed;
