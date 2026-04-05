import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

const AdminLogin = () => {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authState = localStorage.getItem("sys_admin_token_x9v2");
      if (authState === "secured_true") {
        navigate("/system-x9v2-dashboard-manage-k8m-xyz789");
      }
      
      const lockUntil = localStorage.getItem("sys_lock_until");
      if (lockUntil && new Date().getTime() < parseInt(lockUntil)) {
        setIsLocked(true);
      } else {
        localStorage.removeItem("sys_lock_until");
        setIsLocked(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLocked) {
      toast.error("System locked. Please wait.");
      return;
    }

    if (passcode === "X9-V2-K8M-ALPHA-OMEGA-992") {
      localStorage.setItem("sys_admin_token_x9v2", "secured_true");
      setAttemptCount(0);
      toast.success("Authentication successful.");
      setTimeout(() => {
        navigate("/system-x9v2-dashboard-manage-k8m-xyz789");
      }, 500);
    } else {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      toast.error("Access Denied");
      setPasscode("");
      
      if (newCount >= 3) {
        setIsLocked(true);
        localStorage.setItem("sys_lock_until", (new Date().getTime() + 5 * 60000).toString()); // 5 min lock
        toast.error("System locked for 5 minutes due to multiple failed attempts.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage access keys</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="System Security Code"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="pl-10 h-12 bg-black border-zinc-800 text-center text-lg tracking-widest font-mono text-white placeholder:text-zinc-600 focus:border-red-500/50 transition-colors"
              autoComplete="off"
              disabled={isLocked || loading}
              required
            />
          </div>

          <Button 
             type="submit" 
             className="w-full h-12 bg-red-950 hover:bg-red-900 text-red-200 border border-red-900/50 uppercase tracking-widest font-bold" 
             disabled={loading || isLocked}
          >
            {isLocked ? "System Locked" : loading ? "Verifying..." : "Initialize"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
