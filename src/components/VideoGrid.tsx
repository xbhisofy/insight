import { ReelData, formatNumber } from "@/lib/mockData";
import { Play, Plus } from "lucide-react";
import { useRef, useState, useCallback } from "react";

interface VideoGridProps {
  reels: ReelData[];
  onReelClick: (reel: ReelData) => void;
  onLongPress: (reel: ReelData) => void;
  onAddReel?: () => void;
}

const VideoGrid = ({ reels, onReelClick, onLongPress, onAddReel }: VideoGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-[1px]">
      {reels.map((reel) => (
        <VideoThumbnail
          key={reel.id}
          reel={reel}
          onClick={() => onReelClick(reel)}
          onLongPress={() => onLongPress(reel)}
        />
      ))}
      {/* Add Reel button */}
      {onAddReel && (
        <div
          onClick={onAddReel}
          className="relative aspect-[3/4] overflow-hidden cursor-pointer select-none bg-card hover:bg-secondary transition-colors flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full border border-muted-foreground/40 flex items-center justify-center">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground text-xs font-medium">Add Reel</span>
        </div>
      )}
    </div>
  );
};

interface VideoThumbnailProps {
  reel: ReelData;
  onClick: () => void;
  onLongPress: () => void;
}

const VideoThumbnail = ({ reel, onClick, onLongPress }: VideoThumbnailProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);
  const longPressTriggered = useRef(false);

  const handlePointerDown = useCallback(() => {
    longPressTriggered.current = false;
    setPressing(true);
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      setPressing(false);
      onLongPress();
    }, 2000);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!longPressTriggered.current) {
      onClick();
    }
  }, [onClick]);

  const handlePointerLeave = useCallback(() => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden cursor-pointer select-none ${
        pressing ? "opacity-80" : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />


      {/* Views count - bottom left like TikTok */}
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
        <Play className="w-3 h-3 text-white" fill="currentColor" />
        <span className="text-white text-[11px] font-semibold drop-shadow-md">
          {formatNumber(reel.insights.views)}
        </span>
      </div>

      {/* Long press indicator */}
      {pressing && (
        <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
};

export default VideoGrid;