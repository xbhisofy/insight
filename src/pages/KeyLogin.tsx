import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fingerprint, Timer, Send, Loader2, Sparkles, Lock, Shield } from "lucide-react";

const getDeviceId = (): string => {
  let id = localStorage.getItem("device_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("device_id", id); }
  return id;
};

const KeyLogin = () => {
  const [keyCode, setKeyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedKey = localStorage.getItem("access_key");
    if (savedKey) checkExistingKey(JSON.parse(savedKey));
  }, []);

  const checkExistingKey = async (saved: { key_id: string }) => {
    try {
      const { data } = await supabase.functions.invoke("check-key-status", {
        body: { key_id: saved.key_id, device_id: getDeviceId() },
      });
      if (data?.valid) navigate("/");
      else { localStorage.removeItem("access_key"); if (data?.reason) toast.error(data.reason); }
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyCode.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-key", {
        body: { key_code: keyCode.trim(), device_id: getDeviceId() },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      if (data?.success) {
        localStorage.setItem("access_key", JSON.stringify({ key_id: data.key.id, label: data.key.label, expires_at: data.key.expires_at }));
        toast.success("Access granted! 🎉");
        navigate("/");
      }
    } catch (err: any) { toast.error(err.message || "Failed to validate key"); }
    finally { setLoading(false); }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const parts = raw.match(/.{1,4}/g) || [];
    setKeyCode(parts.join("-").slice(0, 19));
  };

  const filledSegments = keyCode.split("-").filter(s => s.length === 4).length;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(170deg, #fff5f7 0%, #ffe0e6 35%, #ffc2d1 70%, #ffb3c6 100%)" }}>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 relative z-10">
        <div className="w-full max-w-[380px]">

          {/* Icon & Title */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-pink-300/30"
              style={{ background: "linear-gradient(135deg, #ec4899, #db2777)" }}>
              <Shield className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-[#880e4f] text-[28px] font-black tracking-tight">Premium Access</h1>
            <p className="text-[#c2185b]/40 text-[12px] mt-1 font-semibold">Unlock exclusive features with your key</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl shadow-pink-200/40 border border-white">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#ad1457]/60 uppercase tracking-[0.2em]">Access Key</span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{
                          background: i < filledSegments ? "#e91e63" : "#f8bbd0",
                          boxShadow: i < filledSegments ? "0 0 8px #e91e63" : "none"
                        }} />
                    ))}
                  </div>
                </div>
                <div className={`relative rounded-2xl transition-all duration-300 ${focused ? "shadow-[0_0_0_2px_#e91e63,0_0_20px_-5px_rgba(233,30,99,0.25)]" : ""}`}>
                  <input
                    type="text"
                    placeholder="XXXX - XXXX - XXXX - XXXX"
                    value={keyCode}
                    onChange={handleKeyChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    maxLength={19}
                    required
                    autoComplete="off"
                    className="w-full h-[54px] bg-[#fce4ec]/50 border border-pink-200/80 rounded-2xl text-center font-mono text-[17px] tracking-[0.3em] text-[#880e4f] placeholder:text-pink-300/60 placeholder:tracking-[0.12em] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || keyCode.replace(/-/g, "").length < 8}
                className="w-full h-[52px] rounded-2xl font-extrabold text-[15px] text-white flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: loading ? "#e0e0e0" : "linear-gradient(135deg, #ec4899, #db2777)",
                  boxShadow: loading ? "none" : "0 6px 24px -4px rgba(236,72,153,0.5)"
                }}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin text-[#880e4f]" /> <span className="text-[#880e4f]">Verifying...</span></>
                ) : (
                  <><Sparkles className="w-[18px] h-[18px]" /> Activate Key</>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-50/80 border border-pink-100">
                <Fingerprint className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                <p className="text-[#ad1457]/50 text-[10px] font-semibold">One key per device — locked to you only</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-50/80 border border-pink-100">
                <Timer className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                <p className="text-[#ad1457]/50 text-[10px] font-semibold">Time-limited keys managed by admin</p>
              </div>
            </div>
          </div>

          {/* Telegram */}
          <div className="mt-5">
            <a
              href="https://t.me/+h5IeaMEfjoAzNTZl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full h-[50px] rounded-2xl font-bold text-[14px] text-white transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                boxShadow: "0 6px 24px -4px rgba(14,165,233,0.45)"
              }}
            >
              <Send className="w-4 h-4" />
              Join Main Channel — Telegram
            </a>
            <p className="text-center text-[11px] text-[#c2185b]/30 mt-3 font-medium">
              Don't have a key? Join our main Telegram channel
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pb-4 relative z-10">
        <p className="text-[10px] text-[#e91e63]/15 font-semibold">Powered by Whop Campaign</p>
      </div>
    </div>
  );
};

export default KeyLogin;
