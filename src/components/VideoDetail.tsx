import { useState, useRef, useCallback, useEffect } from "react";
import { ReelData, formatNumber } from "@/lib/mockData";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ArrowLeft, Heart, MessageCircle, Bookmark, MoreHorizontal, Music, Search, Play, Share2, X, Save, Loader2, Edit3 } from "lucide-react";
import { parseInputNumber } from "@/lib/utils";
import avatar from "@/assets/avatar.jpg";

interface VideoDetailProps {
  reel: ReelData;
  onBack: () => void;
  onInsights: () => void;
  onLongPress: () => void;
  onSave?: (updated: ReelData) => void;
}

const VideoDetail = ({ reel, onBack, onInsights, onLongPress, onSave }: VideoDetailProps) => {
  const [localReel, setLocalReel] = useState<ReelData>(reel);
  const [editing, setEditing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  const handlePointerDown = useCallback(() => {
    triggered.current = false;
    timerRef.current = setTimeout(() => {
      triggered.current = true;
      setEditing(true);
    }, 500); 
  }, []);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const handleSave = useCallback((updated: ReelData) => {
    setLocalReel(updated);
    onSave?.(updated);
    setEditing(false);
  }, [onSave]);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = useCallback((e: React.PointerEvent) => {
    if (triggered.current) return; 
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(prev => !prev);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = muted;
    }
  }, [muted]);

  const r = localReel;
  const ins = r.insights;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Full screen thumbnail */}
      {/* Full screen media */}
      <div
        className="absolute inset-0 select-none cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={(e) => togglePlay(e as any)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {r.videoUrl ? (
          <video 
            ref={videoRef}
            src={r.videoUrl} 
            className="w-full h-full object-cover" 
            autoPlay 
            loop 
            muted={muted} 
            playsInline 
          />
        ) : (
          <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 50%, rgba(0,0,0,0.85) 100%)' }} />
        
        {/* Play/Pause overlay */}
        {!playing && r.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
            </div>
        )}

        {/* Mute toggle button */}
        {r.videoUrl && (
            <button 
                onClick={toggleMute}
                className="absolute bottom-24 left-4 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
            >
                {muted ? (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" /></svg>
                ) : (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                )}
            </button>
        )}
      </div>


      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-7 h-7 text-white drop-shadow-lg" />
        </button>
        <button className="p-1">
          <Search className="w-6 h-6 text-white drop-shadow-lg" />
        </button>
      </div>

      {/* Right side actions - TikTok style */}
      <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4">
        {/* Profile avatar */}
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-[2px] border-white">
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[hsl(var(--tiktok-red))] flex items-center justify-center">
            <span className="text-white text-[14px] font-bold leading-none">+</span>
          </div>
        </div>

        {/* Heart - red filled */}
        <div className="flex flex-col items-center">
          <Heart className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
          <span className="text-white text-[12px] font-semibold mt-1">{formatNumber(ins.likes)}</span>
        </div>

        {/* Comments */}
        <div className="flex flex-col items-center">
          <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
          <span className="text-white text-[12px] font-semibold mt-1">{formatNumber(ins.comments)}</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center">
          <Bookmark className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
          <span className="text-white text-[12px] font-semibold mt-1">{formatNumber(ins.saves)}</span>
        </div>

        {/* More */}
        <div className="flex flex-col items-center">
          <MoreHorizontal className="w-8 h-8 text-white drop-shadow-lg" />
        </div>

        {/* Spinning music disc */}
        <div className="w-[38px] h-[38px] rounded-full overflow-hidden border-[4px] border-[#282828] animate-spin" style={{ animationDuration: '3s' }}>
          <img src={avatar} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
        {/* Username + date */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-white font-bold text-[15px] drop-shadow-lg">{r.username?.replace("@", "") || "Locus"}</span>
          <span className="text-white/70 text-[13px] drop-shadow-lg">· {r.createdAt?.slice(5) || "01-12"}</span>
        </div>

        {/* Caption/description */}
        <p className="text-white text-[14px] drop-shadow-lg leading-[1.4] mb-1 pr-14">
          {r.description}
          <span className="text-white/70 text-[13px]">...more</span>
        </p>

        {/* Music row - TikTok style */}
        <div className="flex items-center gap-2 mb-3 pr-16">
          <Music className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-white text-[13px] drop-shadow-lg truncate">
            {r.music}
          </span>
        </div>

        {/* Views + More insights row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5 text-white" fill="white" />
              <span className="text-white text-[13px] font-medium">{formatNumber(ins.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-[13px] font-medium">{formatNumber(ins.shares)}</span>
            </div>
          </div>

          {/* More insights button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onInsights}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 12h10M7 8h6M7 16h8" />
              </svg>
              <span className="text-white text-[13px] font-semibold">More insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal on long press */}
      {editing && (
        <ReelEditSheet reel={localReel} onSave={handleSave} onClose={() => setEditing(false)} />
      )}
    </div>
  );
};

/* ─── Edit Sheet for reel ─── */
const ReelEditSheet = ({ reel, onSave, onClose }: { reel: ReelData; onSave: (r: ReelData) => void; onClose: () => void }) => {
  const [title, setTitle] = useState(reel.title);
  const [description, setDescription] = useState(reel.description);
  const [tags, setTags] = useState(reel.tags.join(", "));
  const [music, setMusic] = useState(reel.music);
  const [username, setUsername] = useState(reel.username);
  const [thumbnail, setThumbnail] = useState(reel.thumbnail);
  const [videoUrl, setVideoUrl] = useState(reel.videoUrl || "");
  const [createdAt, setCreatedAt] = useState(reel.createdAt);
  const [duration, setDuration] = useState(reel.duration);
  const [views, setViews] = useState(formatNumber(reel.insights.views));
  const [likes, setLikes] = useState(formatNumber(reel.insights.likes));
  const [comments, setComments] = useState(formatNumber(reel.insights.comments));
  const [shares, setShares] = useState(formatNumber(reel.insights.shares));
  const [saves, setSaves] = useState(formatNumber(reel.insights.saves));

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
      title,
      description,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      music,
      username,
      thumbnail,
      videoUrl: videoUrl || undefined,
      createdAt,
      duration,
      insights: {
        ...reel.insights,
        views: parseInputNumber(views),
        likes: parseInputNumber(likes),
        comments: parseInputNumber(comments),
        shares: parseInputNumber(shares),
        saves: parseInputNumber(saves),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-foreground font-bold text-lg">Edit Reel</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
              <Save className="w-4 h-4" />Done
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
                <span>📷</span> Change Thumbnail
                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
              </label>
              <label className={`flex items-center gap-1.5 text-primary text-[13px] font-semibold cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <span>🎬</span> {videoUrl ? "Change Video" : "Upload Video"}
                <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </label>
            </div>
          </div>
          {uploading && (
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          {videoUrl && !uploading && (
            <div className="rounded-lg overflow-hidden border border-border">
              <video src={videoUrl} className="w-full h-32 object-cover" controls />
            </div>
          )}

          <Field label="Username" value={username} onChange={setUsername} />
          <Field label="Title" value={title} onChange={setTitle} />
          <FieldArea label="Caption / Description" value={description} onChange={setDescription} />
          <Field label="Tags (comma separated)" value={tags} onChange={setTags} />
          <Field label="Music" value={music} onChange={setMusic} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Posted Date" value={createdAt} onChange={setCreatedAt} />
            <Field label="Duration" value={duration} onChange={setDuration} />
          </div>

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
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary focus:outline-none" />
  </div>
);

export default VideoDetail;
