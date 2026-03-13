import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fingerprint, Timer, Send, Sparkles, Shield, MessageCircle, BadgeCheck, ExternalLink } from "lucide-react";

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
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans"
      style={{ background: "linear-gradient(170deg, #fafafa 0%, #fce4ec 100%)" }}>

      {/* Decorative Blobs for premium feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-200/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px]" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 w-full">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Minimal Header */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-[28px] bg-white shadow-2xl shadow-pink-200/50 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500 border border-pink-50">
                <Shield className="w-10 h-10 text-[#db2777]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
                <BadgeCheck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-[#5c0b36] tracking-tight">Verified Access</h1>
              <p className="text-[#ad1457]/50 text-xs font-bold uppercase tracking-[0.2em] mt-2">Professional Insight Editor</p>
            </div>
          </div>

          {/* Clean Main Card */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl shadow-pink-200/40 border border-white/50">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-[#ad1457]/60 uppercase tracking-widest">Access Key</span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          background: i < filledSegments ? "#db2777" : "#f1c3d1",
                          boxShadow: i < filledSegments ? "0 0 10px #db2777" : "none"
                        }} />
                    ))}
                  </div>
                </div>
                
                <div className={`relative rounded-2xl transition-all duration-300 ${focused ? "ring-2 ring-[#db2777] ring-offset-2" : ""}`}>
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
                    className="w-full h-[60px] bg-white border-0 rounded-2xl text-center font-mono text-lg tracking-[0.3em] text-[#5c0b36] placeholder:text-pink-200 placeholder:tracking-widest shadow-inner focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || keyCode.replace(/-/g, "").length < 8}
                className="group w-full h-[56px] rounded-2xl font-black text-sm text-white flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #db2777)",
                  boxShadow: "0 12px 24px -6px rgba(219,39,119,0.3)"
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Enter Editor Hub</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Benefits icons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-pink-50/50 p-3 rounded-2xl flex items-center gap-3 border border-pink-100/50">
                <Fingerprint className="w-4 h-4 text-pink-400" />
                <span className="text-[9px] font-bold text-[#ad1457]/60 leading-tight">Secure Session</span>
              </div>
              <div className="bg-pink-50/50 p-3 rounded-2xl flex items-center gap-3 border border-pink-100/50">
                <Timer className="w-4 h-4 text-pink-400" />
                <span className="text-[9px] font-bold text-[#ad1457]/60 leading-tight">Admin Managed</span>
              </div>
            </div>
          </div>

          {/* Premium Telegram Links Section */}
          <div className="space-y-4 pt-4">
            <p className="text-center text-[10px] font-black text-[#ad1457]/30 uppercase tracking-[0.3em]">Official Connections</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://t.me/whopcampaign"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 w-full h-[54px] rounded-2xl bg-white border border-pink-100 shadow-lg shadow-pink-100/20 hover:shadow-pink-100/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0088cc]/10 flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#0088cc]" />
                  </div>
                  <span className="font-bold text-sm text-[#5c0b36]">Main Channel</span>
                </div>
                <ExternalLink className="w-4 h-4 text-pink-200" />
              </a>

              <a
                href="https://t.me/HenryMiller08"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 w-full h-[54px] rounded-2xl bg-[#5c0b36] shadow-xl shadow-pink-900/20 hover:shadow-pink-900/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white">Owner Support</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-white/80 uppercase">Active</span>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Simplified Footer */}
      <div className="pb-6 text-center opacity-30 select-none">
        <p className="text-[10px] font-black text-[#5c0b36] uppercase tracking-[0.4em]">Powered by Whop Campaign</p>
      </div>

    </div>
  );
};

export default KeyLogin;
