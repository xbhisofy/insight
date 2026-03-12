import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const getDeviceId = (): string => {
  return localStorage.getItem("device_id") || "";
};

interface KeyGuardProps {
  children: React.ReactNode;
}

const KeyGuard = ({ children }: KeyGuardProps) => {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback((reason?: string) => {
    localStorage.removeItem("access_key");
    if (reason) toast.error(reason);
    navigate("/key-login");
  }, [navigate]);

  const checkKey = useCallback(async () => {
    const saved = localStorage.getItem("access_key");
    if (!saved) {
      navigate("/key-login");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const { key_id } = parsed;

      // First check local expiry before making network call
      if (parsed.expires_at) {
        const expiresAt = new Date(parsed.expires_at);
        if (expiresAt <= new Date()) {
          logout("Key has expired");
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("check-key-status", {
        body: { key_id, device_id: getDeviceId() },
      });

      // Network error or function unavailable — allow usage (don't logout)
      if (error) {
        console.warn("Key check network error, allowing offline usage");
        setValid(true);
        setChecking(false);
        return;
      }

      // Only logout on explicit server-side rejection
      if (data && data.valid === false) {
        logout(data.reason || "Access revoked");
        return;
      }

      // Update local expiry info
      if (data?.expires_at) {
        parsed.expires_at = data.expires_at;
        localStorage.setItem("access_key", JSON.stringify(parsed));
      }

      setValid(true);
    } catch {
      // JSON parse error or any other issue — allow offline usage
      setValid(true);
    }
    setChecking(false);
  }, [logout, navigate]);

  useEffect(() => {
    checkKey();

    // Check every 60 seconds (less aggressive, better for APK/mobile)
    const interval = setInterval(checkKey, 60000);

    // Also check on tab focus (user comes back to tab)
    const handleFocus = () => checkKey();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkKey]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background" />
    );
  }

  if (!valid) return null;

  return <>{children}</>;
};

export default KeyGuard;