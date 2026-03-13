import { useState, useRef, useCallback, useEffect } from "react";
import { ReelData, formatNumber } from "@/lib/mockData";
import { ArrowLeft, Play, Heart, MessageCircle, Share2, Bookmark, Info, ChevronRight, X, Save, Upload, Settings, Image as ImageIcon } from "lucide-react";

interface InsightsPanelProps {
  reel: ReelData;
  onClose: () => void;
  onSave?: (updated: ReelData) => void;
}

type TabName = "inspiration" | "overview" | "viewers" | "engagement";
type EditSection = null | "quickStats" | "keyMetrics" | "graph" | "traffic" | "viewerTypes" | "gender" | "age" | "locations" | "thumbnail" | "tab_overview" | "tab_viewers" | "tab_engagement" | "tab_inspiration";

const InsightsPanel = ({ reel, onClose, onSave }: InsightsPanelProps) => {
  const [localReel, setLocalReel] = useState<ReelData>(reel);
  const ins = localReel.insights;
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEditMode = () => {
    setIsEditing(prev => !prev);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handlePointerDown = () => {
    timerRef.current = setTimeout(triggerEditMode, 2000);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const updateReel = (updates: Partial<ReelData>) => {
    const next = { ...localReel, ...updates };
    setLocalReel(next);
    onSave?.(next);
  };

  const updateInsights = (updates: any) => {
    const next = { ...localReel, insights: { ...localReel.insights, ...updates } };
    setLocalReel(next);
    onSave?.(next);
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-background overflow-y-auto scrollbar-hide text-foreground select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top bar */}
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="flex items-center justify-between h-[52px] px-4">
          <button onClick={onClose} className="p-1 -ml-1">
            <ArrowLeft className="w-7 h-7 text-foreground" />
          </button>
          <h1 className="flex-1 text-center font-bold text-[17.5px] mr-1 ml-0 tracking-tight flex items-center justify-center gap-1.5">
            {isEditing ? (
              <span className="text-primary animate-pulse">Edit Mode</span>
            ) : (
              <EditableVal val="Video analysis" isEditing={isEditing} />
            )}
          </h1>
          {isEditing ? (
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[13px] font-black shadow-lg shadow-primary/20"
            >
              Done
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card">
              <div className="relative">
                <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <div className="absolute -bottom-[2px] -right-[2px] bg-card rounded-full p-[0.5px]">
                  <svg className="w-2.5 h-2.5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>
              <span className="text-[12px] font-black tracking-tight text-foreground">
                <EditableVal val="TikTok Studio" isEditing={isEditing} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Video thumbnail + date */}
      <div className="flex flex-col items-center pt-5 pb-3 bg-background">
        <div className="w-[90px] h-[120px] rounded-xl overflow-hidden relative mb-2 border border-border">
          <EditableImage isEditing={isEditing} />
          {!isEditing && (
            <>
              <img src={localReel.thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
                <span className="text-white text-[11px] font-black bg-black/50 px-2 py-0.5 rounded">
                  <EditableVal val={localReel.duration} isEditing={isEditing} />
                </span>
              </div>
                <ImageIcon className="w-3 h-3 text-white" />
            </>
          )}
        </div>
        <p className="text-muted-foreground text-[13.5px] font-bold mb-4">
          Posted on <EditableVal val={localReel.createdAt} isEditing={isEditing} />
        </p>

        {/* Quick stats */}
        <div className="flex items-center w-full px-4 mb-3.5">
          <QuickStat icon={Play} value={formatNumber(ins.views)} label="views" isEditing={isEditing} />
          <Divider />
          <QuickStat icon={Heart} value={formatNumber(ins.likes)} label="likes" isEditing={isEditing} />
          <Divider />
          <QuickStat icon={MessageCircle} value={formatNumber(ins.comments)} label="comments" isEditing={isEditing} />
          <Divider />
          <QuickStat icon={Share2} value={formatNumber(ins.shares)} label="shares" isEditing={isEditing} />
          <Divider />
          <QuickStat icon={Bookmark} value={formatNumber(ins.saves)} label="saves" isEditing={isEditing} />
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-border scrollbar-hide overflow-x-auto px-4">
          <TabBtn label="Inspiration" active={activeTab === "inspiration"} onClick={() => setActiveTab("inspiration")} isEditing={isEditing} />
          <TabBtn label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} isEditing={isEditing} />
          <TabBtn label="Viewers" active={activeTab === "viewers"} onClick={() => setActiveTab("viewers")} isEditing={isEditing} />
          <TabBtn label="Engagement" active={activeTab === "engagement"} onClick={() => setActiveTab("engagement")} isEditing={isEditing} />
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-20">
        {activeTab === "overview" && <OverviewTab ins={ins} reel={localReel} isEditing={isEditing} onUpdate={updateInsights} />}
        {activeTab === "viewers" && <ViewersTab ins={ins} isEditing={isEditing} onUpdate={updateInsights} />}
        {activeTab === "engagement" && <EngagementTab ins={ins} reel={localReel} isEditing={isEditing} />}
        {activeTab === "inspiration" && <InspirationTab ins={ins} isEditing={isEditing} />}
      </div>
    </div>
  );
};

/* ─── Helpers ─── */
const EditableVal = ({ val, isEditing, className = "", onUpdate }: { val: string | number; isEditing: boolean; className?: string; onUpdate?: (v: string) => void }) => {
  const [internalVal, setInternalVal] = useState(val);
  useEffect(() => {
    setInternalVal(val);
  }, [val]);
  return (
    <span 
      contentEditable={isEditing} 
      suppressContentEditableWarning 
      onPointerDown={e => { if (isEditing) e.stopPropagation(); }}
      onBlur={(e) => {
        const text = e.currentTarget.textContent || "";
        setInternalVal(text);
        if (onUpdate) onUpdate(text);
      }}
      className={`outline-none transition-all ${isEditing ? 'border-b border-dashed border-primary text-primary bg-primary/5 rounded px-1 min-w-[10px] inline-block' : ''} ${className}`}
    >
      {internalVal}
    </span>
  );
};

const HalfDonutChart = ({ segments }: { segments: { value: number, color: string }[] }) => {
  const radius = 80;
  const strokeWidth = 28;
  const center = 100;
  const circumference = Math.PI * radius;
  
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let currentOffset = 0;

  return (
    <svg viewBox="0 0 200 110" className="w-[240px] h-[130px] overflow-visible">
      <path
        d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        className="text-foreground/10"
      />
      {segments.map((s, i) => {
        const sliceLength = (s.value / total) * circumference;
        // Add tiny overlap to prevent white gaps between segments
        const strokeDasharray = `${sliceLength + 0.5} ${circumference * 2}`;
        const dashOffset = currentOffset;
        currentOffset -= sliceLength;

        return (
          <path
            key={i}
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{ transformOrigin: 'center', transform: 'rotate(0deg)' }}
          />
        );
      })}
    </svg>
  );
};

const GenderRow = ({ color, label, pct, isEditing, onUpdate, className = "", showChevron = false }: { color: string; label: string; pct: string; isEditing: boolean; onUpdate?: (v: string) => void; className?: string; showChevron?: boolean }) => (
  <div className={`flex items-center justify-between py-1 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[15px] font-bold text-foreground truncate"><EditableVal val={label} isEditing={isEditing} /></span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[15px] font-black text-foreground"><EditableVal val={pct} isEditing={isEditing} onUpdate={onUpdate} /></span>
      {showChevron && <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
    </div>
  </div>
);

const MetricBar = ({ label, value, isEditing, onUpdate, onLabelUpdate, color = "#00a1ff", bgOpacity = "" }: { label: string; value: number; isEditing: boolean; onUpdate?: (v: number) => void; onLabelUpdate?: (v: string) => void; color?: string; bgOpacity?: string }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [barWidth, setBarWidth] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
    setBarWidth(value);
  }, [value]);

  const handleUpdate = (v: string) => {
    const num = parseInt(v.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      setBarWidth(num);
      setCurrentValue(num);
      onUpdate?.(num);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center text-[15px] mb-2 font-bold leading-tight">
        <span className="text-foreground/90 truncate pr-2"><EditableVal val={label} isEditing={isEditing} onUpdate={onLabelUpdate} /></span>
        <span className="text-foreground font-black"><EditableVal val={`${currentValue}%`} isEditing={isEditing} onUpdate={handleUpdate} /></span>
      </div>
      <div className={`w-full h-[12px] bg-muted rounded-full overflow-hidden mt-1.5 relative`}>
        <div 
          className="h-full rounded-full absolute left-0 top-0 transition-all duration-300" 
          style={{ width: `${barWidth}%`, backgroundColor: color + bgOpacity }} 
        />
      </div>
    </div>
  );
};

const EditableImage = ({ isEditing }: { isEditing: boolean }) => {
  if (!isEditing) return null;
  return (
    <div 
      className="absolute inset-0 z-20 bg-background/40 dark:bg-black/40 flex items-center justify-center cursor-pointer"
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="w-8 h-8 rounded-full bg-foreground/20 backdrop-blur-md flex items-center justify-center border border-foreground/30">
        <Upload className="w-4 h-4 text-foreground" />
      </div>
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
    </div>
  );
};

const TabBtn = ({ label, active, onClick, isEditing }: { label: string; active: boolean; onClick: () => void; isEditing: boolean }) => (
  <button
    onClick={onClick}
    className={`flex-1 whitespace-nowrap pb-2.5 text-[15px] font-black transition-all border-b-[3.5px] text-center ${
      active ? "text-foreground border-foreground" : "text-foreground/45 border-transparent"
    }`}
  >
    <EditableVal val={label} isEditing={isEditing} />
  </button>
);

const SubTabBtn = ({ label, active, onClick, isEditing }: { label: string; active: boolean; onClick: () => void; isEditing: boolean }) => (
  <button 
    onClick={onClick} 
    className={`px-[18px] py-[7px] rounded-full text-[14px] font-bold transition-colors ${
      active ? "bg-foreground text-background" : "bg-muted text-foreground"
    }`}
  >
    <EditableVal val={label} isEditing={isEditing} />
  </button>
);

const QuickStat = ({ icon: Icon, value, label, isEditing }: { icon: any; value: string; label: string; isEditing: boolean }) => (
  <div className="flex flex-col items-center gap-1 flex-1 px-1">
    <Icon className="w-[18px] h-[18px] text-muted-foreground" />
    <span className="text-foreground text-[13.5px] font-black leading-none mt-0.5"><EditableVal val={value} isEditing={isEditing} /></span>
  </div>
);

const Divider = () => <div className="w-[1px] h-8 bg-border" />;

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-xl mx-4 mt-2.5 p-4 border border-border ${className}`}>{children}</div>
);

/* ═══════ OVERVIEW TAB ═══════ */
const OverviewTab = ({ ins, reel, isEditing, onUpdate }: { ins: ReelData["insights"]; reel: ReelData; isEditing: boolean; onUpdate: (d: any) => void }) => {
  type MetricKey = "views" | "totalPlayTime" | "avgWatchTime" | "watchedFull" | "followers";
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("views");

  const graphData = ins.viewsByDay.map(d => d.views);
  const maxVal = Math.max(...graphData, 1);

  const metricCards: { key: MetricKey; label: string; value: string; rawKey: string }[] = [
    { key: "views", label: "Video views", value: formatNumber(ins.views), rawKey: "views" },
    { key: "totalPlayTime", label: "Total play time", value: `${Math.floor(ins.totalPlayTime / 60)}h:${(ins.totalPlayTime % 60).toString().padStart(2, '0')}m:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}s`, rawKey: "totalPlayTime" },
    { key: "avgWatchTime", label: "Average watch time", value: `${ins.avgWatchTime}s`, rawKey: "avgWatchTime" },
    { key: "watchedFull", label: "Watched full video", value: "80%", rawKey: "watchedFull" },
    { key: "followers", label: "New followers", value: formatNumber(ins.followsFromPost), rawKey: "followsFromPost" },
  ];

  return (
    <>
      {/* Key metrics */}
      <Card className="border-none mt-2">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Key metrics" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground text-[12px] mb-5 font-bold"><EditableVal val="Updated on 3/4/2026." isEditing={isEditing} /></p>
        
        <div className="grid grid-cols-2 gap-2.5">
          {metricCards.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`rounded-2xl p-4 text-left min-h-[105px] flex flex-col justify-center border ${
                selectedMetric === m.key
                  ? "bg-[#e9f8ff] border-[#bae5f8] dark:bg-[#00a1ff20] dark:border-[#00a1ff40]" 
                  : "border-border bg-card"
              }`}
            >
              <p className="text-foreground/60 text-[13px] font-black mb-1.5 capitalize tracking-tight">
                <EditableVal val={m.label} isEditing={isEditing} />
              </p>
              <p className="text-foreground text-[22px] font-black leading-tight">
                <EditableVal 
                  val={m.value} 
                  isEditing={isEditing} 
                  onUpdate={(v) => {
                    const num = parseInt(v.replace(/[^0-9]/g, ''));
                    if (!isNaN(num)) onUpdate({ [m.rawKey]: num });
                  }} 
                />
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Graph */}
      <Card className="border-none">
        <DrawableGraph
          data={graphData}
          days={ins.viewsByDay.map(d => d.day)}
          maxVal={maxVal}
          isEditing={isEditing}
          onDraw={(points) => {
            const next = ins.viewsByDay.map((d, i) => ({ ...d, views: points[i] }));
            onUpdate({ viewsByDay: next });
          }}
        />
      </Card>

      {/* Retention rate */}
      <Card className="border-none">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Retention rate" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
        <p className="text-foreground text-[13.5px] font-bold mt-2 leading-snug">
          <EditableVal val={`On average, viewers watched ${Math.round((ins.avgWatchTime / 30) * 100)}% of your video.`} isEditing={isEditing} />
        </p>
        <p className="text-muted-foreground text-[12.5px] mt-1 mb-5 font-bold">
          <EditableVal val={`Most viewers stopped watching at 0:${String(Math.max(2, Math.floor(ins.avgWatchTime * 0.3))).padStart(2, '0')}.`} isEditing={isEditing} />
        </p>
        <div className="w-full aspect-[9/16] max-h-[320px] mx-auto rounded-xl overflow-hidden relative mb-4 border border-border shadow-2xl">
          <EditableImage isEditing={isEditing} />
          {!isEditing && <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="relative h-[80px] w-full">
          <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
             <defs>
               <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#00a1ff" stopOpacity="0.2" />
                 <stop offset="100%" stopColor="#00a1ff" stopOpacity="0" />
               </linearGradient>
             </defs>
             <path d="M0,5 L30,25 L60,35 L100,45 L150,55 L200,60 L250,65 L300,70 L300,80 L0,80 Z" fill="url(#retentionGrad)" />
             <polyline points="0,5 30,25 60,35 100,45 150,55 200,60 250,65 300,70" fill="none" stroke="#00a1ff" strokeWidth="2.5" />
             <circle cx="0" cy="5" r="1.8" fill="#ffffff" stroke="#00a1ff" strokeWidth="1.2" />
             <circle cx="300" cy="70" r="1.8" fill="#ffffff" stroke="#00a1ff" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-2 font-black uppercase tracking-wider">
          <span>100%</span>
          <span>50%</span>
        </div>
      </Card>

      {/* Traffic Sources */}
      <Card className="border-none mt-2.5">
        <div className="flex items-center gap-1.5 mb-4">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Traffic sources" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
        <div className="space-y-[15px]">
          {[
            { label: "For You", value: ins.trafficSources.forYouPage, key: "forYouPage" },
            { label: "Personal profile", value: ins.trafficSources.profile, key: "profile" },
            { label: "Following", value: ins.trafficSources.following, key: "following" },
            { label: "Search", value: ins.trafficSources.search, key: "search" },
            { label: "Other", value: ins.trafficSources.hashtags, key: "hashtags" },
          ].sort((a, b) => b.value - a.value).map((item) => (
            <MetricBar 
              key={item.label}
              label={item.label}
              value={item.value}
              isEditing={isEditing}
              onUpdate={(v) => onUpdate({ trafficSources: { ...ins.trafficSources, [item.key]: v } })}
              onLabelUpdate={(v) => {
                // We're just updating the dummy label in item if it was stateful, 
                // but traffic source labels are fixed in the UI usually. 
                // If they really want to change "For You" to something else, 
                // we'd need a mapping which isn't in the model yet.
              }}
            />
          ))}
        </div>
      </Card>
    </>
  );
};

/* ─── Drawable Graph Component ─── */
const DrawableGraph = ({
  data, days, maxVal, isEditing, onDraw
}: {
  data: number[];
  days: string[];
  maxVal: number;
  isEditing: boolean;
  onDraw: (points: number[]) => void;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);

  const getPointFromEvent = (e: React.PointerEvent) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(300, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const updatePoint = (e: React.PointerEvent) => {
    const pt = getPointFromEvent(e);
    if (pt) {
      const idx = Math.min(data.length - 1, Math.max(0, Math.round((pt.x / 300) * (data.length - 1))));
      const val = Math.max(0, Math.round(((100 - pt.y) / 100) * maxVal));
      const next = [...data];
      next[idx] = val;
      onDraw(next);
      e.stopPropagation();
    }
  };

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 300;
    const y = 100 - (v / maxVal) * 85 - 10;
    return { x, y };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(" ");
  const fillStr = `0,100 ${polylineStr} 300,100`;

  return (
    <div className="relative pt-6 pb-4 bg-card rounded-xl border border-border shadow-inner">
      <div className="relative h-[160px] px-2.5">
        <div className="absolute inset-0 flex flex-col justify-between py-2.5 pb-0">
          {[100, 66, 33, 0].map(p => (
            <div key={p} className="flex items-center gap-2">
              <div className="flex-1 border-t border-dashed border-border" />
              <span className="text-[10px] font-black text-muted-foreground/30 w-8 text-right pr-1">
                {p === 0 ? "0" : formatNumber(Math.round((p / 100) * maxVal))}
              </span>
            </div>
          ))}
        </div>
        
        <svg
          ref={svgRef}
          className={`relative z-10 w-full h-[calc(100%-24px)] overflow-visible ${isEditing ? "touch-none cursor-crosshair" : ""}`}
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          onPointerDown={e => { if (!isEditing) return; isDrawing.current = true; (e.target as Element).setPointerCapture(e.pointerId); updatePoint(e); e.stopPropagation(); }}
          onPointerMove={e => { if (isDrawing.current) { updatePoint(e); e.stopPropagation(); } }}
          onPointerUp={(e) => { isDrawing.current = false; (e.target as Element).releasePointerCapture(e.pointerId); if (isEditing) e.stopPropagation(); }}
          onPointerLeave={() => { isDrawing.current = false; }}
        >
          <defs>
            <linearGradient id="graphGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00a1ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00a1ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={fillStr} fill="url(#graphGradV2)" />
          <polyline points={polylineStr} fill="none" stroke="#00a1ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="#ffffff" stroke="#00a1ff" strokeWidth="1.2" />
          ))}
        </svg>
      </div>
      <div className="flex justify-between px-4 mt-2">
        <span className="text-[11px] font-black text-muted-foreground/40 truncate capitalize">{days[0]}</span>
        <span className="text-[11px] font-black text-muted-foreground/40 truncate capitalize">{days[days.length - 1]}</span>
      </div>
    </div>
  );
};

const ViewersTab = ({ ins, isEditing, onUpdate }: { ins: ReelData["insights"]; isEditing: boolean; onUpdate: (d: any) => void }) => {
  const totalViewers = Math.round(ins.views * 0.92);
  const newViewerPct = 97;
  const returningPct = 3;

  return (
    <div>
      <Card className="border-none">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-muted-foreground text-[14px] font-black uppercase tracking-wide"><EditableVal val="Total viewers" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>
        <p className="text-foreground text-[32px] font-black leading-tight mt-1">
          <EditableVal val={formatNumber(totalViewers)} isEditing={isEditing} />
        </p>
        <p className="text-muted-foreground text-[12.5px] mt-0.5 font-bold">
          <EditableVal val="+0 (vs 1d ago)" isEditing={isEditing} />
        </p>
      </Card>

      {/* Gender Section */}
      <Card className="border-none mt-2.5">
        <div className="flex items-center gap-1.5 mb-4">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Gender" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>
        <div className="flex justify-center mb-4 relative">
          <HalfDonutChart segments={[
            { value: ins.genderSplit.male, color: "#00a1ff" },
            { value: ins.genderSplit.female, color: "#00a1ff66" },
            { value: 100 - ins.genderSplit.male - ins.genderSplit.female, color: "#00a1ff1a" }
          ]} />
        </div>
        <div className="space-y-[15px]">
          <GenderRow color="#00a1ff" label="Male" pct={`${ins.genderSplit.male}%`} isEditing={isEditing} onUpdate={(v) => {
            const num = parseInt(v.replace(/[^0-9]/g, ''));
            if (!isNaN(num)) onUpdate({ genderSplit: { ...ins.genderSplit, male: num } });
          }} />
          <div className="h-[1px] bg-border w-full my-3" />
          <GenderRow color="#00a1ff66" label="Female" pct={`${ins.genderSplit.female}%`} isEditing={isEditing} onUpdate={(v) => {
            const num = parseInt(v.replace(/[^0-9]/g, ''));
            if (!isNaN(num)) onUpdate({ genderSplit: { ...ins.genderSplit, female: num } });
          }} />
          <div className="h-[1px] bg-border w-full my-3" />
          <GenderRow color="#00a1ff1a" label="Other" pct={`${100 - ins.genderSplit.male - ins.genderSplit.female}%`} isEditing={isEditing} showChevron />
        </div>
      </Card>

      {/* Age Section */}
      <Card className="border-none mt-2.5">
        <div className="flex items-center gap-1.5 mb-4">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Age" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>
        <div className="space-y-[18px]">
          {ins.ageGroups.map((group, i) => (
            <MetricBar 
              key={i}
              label={group.range}
              value={group.percentage}
              isEditing={isEditing}
              onUpdate={(v) => {
                const next = [...ins.ageGroups];
                next[i] = { ...group, percentage: v };
                onUpdate({ ageGroups: next });
              }}
              onLabelUpdate={(v) => {
                const next = [...ins.ageGroups];
                next[i] = { ...group, range: v };
                onUpdate({ ageGroups: next });
              }}
            />
          ))}
        </div>
      </Card>

      {/* Locations Section */}
      <Card className="border-none mt-2.5">
        <div className="flex items-center gap-1.5 mb-4">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Locations" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>
        <div className="space-y-[18px]">
          {[...ins.audienceRegions].sort((a, b) => b.percentage - a.percentage).map((region, i) => (
            <MetricBar 
              key={i}
              label={region.name}
              value={region.percentage}
              isEditing={isEditing}
              onUpdate={(v) => {
                const next = [...ins.audienceRegions];
                const realIdx = ins.audienceRegions.findIndex(r => r.name === region.name);
                if (realIdx !== -1) {
                  next[realIdx] = { ...region, percentage: v };
                  onUpdate({ audienceRegions: next });
                }
              }}
              onLabelUpdate={(v) => {
                const next = [...ins.audienceRegions];
                const realIdx = ins.audienceRegions.findIndex(r => r.name === region.name);
                if (realIdx !== -1) {
                  next[realIdx] = { ...region, name: v };
                  onUpdate({ audienceRegions: next });
                }
              }}
            />
          ))}
        </div>
      </Card>

      <Card className="border-none">
        <div className="flex items-center gap-1.5 mb-6">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Viewer types" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>
        <div className="space-y-[22px]">
          <MetricBar 
            label="New viewers"
            value={newViewerPct}
            isEditing={isEditing}
            onUpdate={() => {}} // Internal state only for now since it's not in the model
          />
          <MetricBar 
            label="Returning viewers"
            value={returningPct}
            isEditing={isEditing}
            color="#00a1ff"
            bgOpacity="66"
            onUpdate={() => {}} // Internal state only for now since it's not in the model
          />
        </div>
      </Card>
    </div>
  );
};

/* ═══════ ENGAGEMENT TAB ═══════ */
const EngagementTab = ({ ins, reel, isEditing }: { ins: ReelData["insights"]; reel: ReelData; isEditing: boolean }) => (
  <div>
    <Card className="border-none">
       <div className="flex items-center gap-1.5 mb-3">
          <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Engagement" isEditing={isEditing} /></h3>
          <Info className="w-3.5 h-3.5 text-muted-foreground/30" />
       </div>
       <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col">
             <span className="text-muted-foreground text-[12px] font-black uppercase mb-1">Likes</span>
             <span className="text-foreground text-[24px] font-black"><EditableVal val={formatNumber(ins.likes)} isEditing={isEditing} /></span>
          </div>
          <div className="flex flex-col">
             <span className="text-muted-foreground text-[12px] font-black uppercase mb-1">Comments</span>
             <span className="text-foreground text-[24px] font-black"><EditableVal val={formatNumber(ins.comments)} isEditing={isEditing} /></span>
          </div>
          <div className="flex flex-col">
             <span className="text-muted-foreground text-[12px] font-black uppercase mb-1">Shares</span>
             <span className="text-foreground text-[24px] font-black"><EditableVal val={formatNumber(ins.shares)} isEditing={isEditing} /></span>
          </div>
          <div className="flex flex-col">
             <span className="text-muted-foreground text-[12px] font-black uppercase mb-1">Saves</span>
             <span className="text-foreground text-[24px] font-black"><EditableVal val={formatNumber(ins.saves)} isEditing={isEditing} /></span>
          </div>
       </div>
    </Card>
    
    <Card className="border-none">
      <div className="flex items-center gap-1.5 mb-2">
        <h3 className="text-foreground text-[17px] font-black"><EditableVal val="Likes" isEditing={isEditing} /></h3>
        <Info className="w-3.5 h-3.5 text-muted-foreground/30" />
      </div>
      <p className="text-muted-foreground text-[12.5px] mt-1 mb-6 font-bold">
        <EditableVal val="Most viewers liked this video at 0:00." isEditing={isEditing} />
      </p>
      <div className="w-full aspect-[16/9] max-h-[220px] mx-auto rounded-xl overflow-hidden relative mb-6 border border-border shadow-2xl">
        <EditableImage isEditing={isEditing} />
        <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="relative h-[60px] w-full">
         <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
            <polyline points="0,10 30,25 60,32 100,38 150,42 200,45 250,48 300,50" fill="none" stroke="#00a1ff" strokeWidth="2.5" />
            <circle cx="0" cy="10" r="1.8" fill="#ffffff" stroke="#00a1ff" strokeWidth="1.2" />
            <circle cx="300" cy="50" r="1.8" fill="#ffffff" stroke="#00a1ff" strokeWidth="1.2" />
         </svg>
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground/50 mt-2 font-black uppercase tracking-wider">
        <span>00:00 (100%)</span>
        <span>00:{reel.duration?.split(':')[1] || '30'}</span>
      </div>
    </Card>
  </div>
);

/* ═══════ INSPIRATION TAB ═══════ */
const InspirationTab = ({ ins, isEditing }: { ins: ReelData["insights"]; isEditing: boolean }) => {
  const [subTab, setSubTab] = useState("trending");
  return (
    <div>
      <Card className="border-none !pb-8">
        <div className="mb-6">
          <h3 className="text-foreground text-[18.5px] font-black tracking-tight"><EditableVal val="Creation Inspiration" isEditing={isEditing} /></h3>
          <p className="text-muted-foreground text-[13.5px] mt-0.5 font-bold"><EditableVal val="Discover your next big idea!" isEditing={isEditing} /></p>
        </div>
        <div className="flex gap-2.5 mb-6 overflow-x-auto scrollbar-hide">
          <SubTab label="Trending posts" active={subTab === "trending"} onClick={() => setSubTab("trending")} isEditing={isEditing} />
          <SubTab label="Similar posts" active={subTab === "similar"} onClick={() => setSubTab("similar")} isEditing={isEditing} />
          <SubTab label="Followers viewed" active={subTab === "followers"} onClick={() => setSubTab("followers")} isEditing={isEditing} />
        </div>
        <p className="text-muted-foreground text-[13.5px] mb-6 font-bold leading-snug"><EditableVal val="Post videos like these for possible virality." isEditing={isEditing} /></p>
        <div className="space-y-[22px]">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#fcd535] flex items-center justify-center text-[11.5px] font-black text-black absolute -left-2.5 -top-1.5 z-10 border-[3px] border-card">
                   <EditableVal val={num} isEditing={isEditing} />
                </div>
                <div className="w-[72px] h-[96px] rounded-xl bg-muted overflow-hidden ml-2 border border-border relative">
                   <EditableImage isEditing={isEditing} />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-foreground text-[14.5px] font-bold leading-[1.3] line-clamp-2 mb-1.5 pr-2">
                  <EditableVal val={
                    num === 1 ? "Trending content idea #1 for your niche..." :
                    num === 2 ? "Popular format that's going viral right now..." :
                    num === 3 ? "Creative video style trending this week..." :
                    "Engaging content format with high reach..."
                  } isEditing={isEditing} />
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Heart className="w-3.5 h-3.5 text-muted-foreground/30" strokeWidth={2.5} />
                  <span className="text-muted-foreground text-[12px] font-black"><EditableVal val={formatNumber(1250000 / num)} isEditing={isEditing} /></span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-sm bg-muted overflow-hidden border border-border relative">
                     <EditableImage isEditing={isEditing} />
                  </div>
                  <span className="text-muted-foreground text-[12px] font-black"><EditableVal val="Creator Studio" isEditing={isEditing} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SubTab = ({ label, active, onClick, isEditing }: { label: string; active: boolean; onClick: () => void; isEditing: boolean }) => (
  <button 
    onClick={onClick} 
    className={`whitespace-nowrap px-4 py-2 rounded-lg text-[13px] font-black transition-all ${
      active ? "bg-foreground text-background" : "bg-muted text-muted-foreground border border-border"
    }`}
  >
    <EditableVal val={label} isEditing={isEditing} />
  </button>
);


export default InsightsPanel;
