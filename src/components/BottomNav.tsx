import { useState, useRef, useCallback } from "react";
import { Home, Users, Plus, MessageCircle, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  const handlePlusDown = useCallback(() => {
    triggered.current = false;
    timerRef.current = setTimeout(() => {
      triggered.current = true;
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
      if (navigator.vibrate) navigator.vibrate(50);
    }, 3000); // 3 seconds long-press
  }, []);

  const handlePlusUp = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (!triggered.current) onTabChange("create");
  }, [onTabChange]);

  const handlePlusLeave = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        <NavItem icon={Home} label="Home" active={activeTab === "home"} onClick={() => onTabChange("home")} />
        <NavItem icon={Users} label="Friends" active={activeTab === "friends"} onClick={() => onTabChange("friends")} />
        
        {/* Create button - long press to toggle light/dark */}
        <button
          onPointerDown={handlePlusDown}
          onPointerUp={handlePlusUp}
          onPointerLeave={handlePlusLeave}
          onContextMenu={e => e.preventDefault()}
          className="relative flex items-center justify-center -mt-2 select-none"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[hsl(var(--tiktok-cyan))] translate-x-[3px]" style={{ width: 44, height: 30 }} />
            <div className="absolute inset-0 rounded-lg bg-primary -translate-x-[3px]" style={{ width: 44, height: 30 }} />
            <div className="relative bg-foreground rounded-lg flex items-center justify-center" style={{ width: 44, height: 30 }}>
              <Plus className="w-5 h-5 text-background" strokeWidth={2.5} />
            </div>
          </div>
        </button>

        <NavItem icon={MessageCircle} label="Inbox" active={activeTab === "inbox"} onClick={() => onTabChange("inbox")} />
        <NavItem icon={User} label="Profile" active={activeTab === "profile"} onClick={() => onTabChange("profile")} />
      </div>
    </div>
  );
};

const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<any>;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="flex flex-col items-center gap-0.5 min-w-[56px]">
    <Icon
      className={`w-[26px] h-[26px] ${active ? "text-foreground" : "text-muted-foreground"}`}
      fill={active ? "currentColor" : "none"}
      strokeWidth={active ? 2 : 1.5}
    />
    <span className={`text-[11px] ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
      {label}
    </span>
  </button>
);

export default BottomNav;
