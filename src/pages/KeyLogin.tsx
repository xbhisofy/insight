import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fingerprint, Timer, Send, Loader2, Sparkles, Lock, Shield, MessageCircle, AlertTriangle, ExternalLink, BadgeCheck } from "lucide-react";

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
                  <>Verifying...</>
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

          {/* Telegram & Support Section */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Main Channel Button */}
            <a
              href="https://t.me/whopcampaign"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 px-5 w-full h-[54px] rounded-2xl font-bold text-[14px] text-white transition-all duration-300 active:scale-[0.98] border border-white/20"
              style={{
                background: "linear-gradient(135deg, #24A1DE 0%, #1c87bc 100%)",
                boxShadow: "0 10px 25px -5px rgba(36,161,222,0.4)"
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Send className="w-4 h-4" />
                </div>
                <span>Official Channel</span>
              </div>
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Owner/Support Card */}
            <div className="relative p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-pink-200/30 overflow-hidden group">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-pink-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="px-2.5 py-1 rounded-full bg-pink-50 border border-pink-100 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-pink-500" />
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Official Access</span>
                  </div>
                  <BadgeCheck className="w-5 h-5 text-pink-500" />
                </div>

                <div className="mb-4">
                  <h3 className="text-[#880e4f] text-[17px] font-black tracking-tight">@HenryMiller08</h3>
                  <p className="text-[#ad1457]/60 text-[11px] font-semibold mt-0.5">Primary Developer & Owner</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[#ad1457]/50 text-[11px] leading-relaxed font-medium">
                    Verified owner of this TikTok Insight Editor. Anyone else selling this access is a <span className="text-red-500 font-bold underline">SCAMMER</span>. Buy only from official sources.
                  </p>

                  <a
                    href="https://t.me/HenryMiller08"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full h-[48px] rounded-xl bg-[#880e4f] text-white font-bold text-[13px] transition-all hover:bg-[#700b41] hover:shadow-lg hover:shadow-pink-900/20 active:scale-[0.97]"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" />
                    Direct Message Owner
                  </a>
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-200/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100/20 rounded-full blur-3xl" />
            </div>

            {/* Alert Section */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 shadow-sm animate-pulse-subtle">
              <div className="bg-red-100 p-2 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-red-900 font-bold text-[11px] mb-0.5 uppercase tracking-wide">Emergency Support</p>
                <p className="text-red-700/70 text-[10px] leading-snug font-semibold">
                  If you face logout issues or have been scammed by others, DM me immediately for verification.
                </p>
              </div>
            </div>
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
