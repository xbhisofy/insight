import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft, Lock, LogOut, Plus, Search, Copy, Trash2, XCircle, Key
} from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type AccessKey = Tables<"access_keys">;

const AdminPanel = () => {
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const authorized = await checkAuth();
      if (authorized) {
        fetchKeys();
      } else {
        setLoading(false);
      }
    };

    void initialize();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      navigate("/system-x9v2-portal-auth-k8m-login-xyz789");
      return false;
    }

    const { data: isAdmin, error } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin",
    });

    if (error || !isAdmin) {
      toast.error("Admin access required");
      navigate("/key-login");
      return false;
    }

    return true;
  };

  const fetchKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch keys");
    } else {
      setKeys(data || []);
    }
    setLoading(false);
  };

  const generateKey = async () => {
    if (!newLabel.trim()) {
      toast.error("Enter a label for the key");
      return;
    }
    setGenerating(true);
    try {
      // Generate key code
      const { data: keyCode, error: genError } = await supabase.rpc('generate_key_code');
      if (genError) throw genError;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + newDays);

      const { error } = await supabase.from("access_keys").insert({
        key_code: keyCode,
        label: newLabel.trim(),
        expiry_days: newDays,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      toast.success("Key generated!");
      setNewLabel("");
      setNewDays(30);
      fetchKeys();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate key");
    }
    setGenerating(false);
  };

  const revokeKey = async (id: string) => {
    const { error } = await supabase
      .from("access_keys")
      .update({ is_active: false })
      .eq("id", id);
    if (error) toast.error("Failed to revoke");
    else {
      toast.success("Key revoked");
      fetchKeys();
    }
  };

  const resetDevice = async (id: string) => {
    const { error } = await supabase
      .from("access_keys")
      .update({ device_id: null, device_info: null, last_ip: null, last_location: null })
      .eq("id", id);
    if (error) toast.error("Failed to reset");
    else {
      toast.success("Device reset");
      fetchKeys();
    }
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase
      .from("access_keys")
      .delete()
      .eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Key deleted");
      fetchKeys();
    }
  };

  const copyKey = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Key copied!");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password minimum 6 characters hona chahiye");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords match nahi ho rahe");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message || "Password change failed");
    } else {
      toast.success("Password successfully changed!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    }
    setChangingPassword(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_auth");
    navigate("/system-x9v2-portal-auth-k8m-login-xyz789");
  };

  const filteredKeys = keys.filter(
    (k) =>
      k.key_code.toLowerCase().includes(search.toLowerCase()) ||
      k.label.toLowerCase().includes(search.toLowerCase())
  );

  const totalKeys = keys.length;
  const activeKeys = keys.filter((k) => k.is_active && new Date(k.expires_at) > new Date()).length;
  const lockedDevices = keys.filter((k) => k.device_id).length;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPasswordModal(true)} className="text-muted-foreground p-2" title="Change Password">
            <Lock className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="text-muted-foreground p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-900/40 rounded-xl p-3">
            <p className="text-xs text-purple-300">Total Keys</p>
            <p className="text-2xl font-bold text-foreground">{totalKeys}</p>
          </div>
          <div className="bg-green-900/40 rounded-xl p-3">
            <p className="text-xs text-green-300">Active</p>
            <p className="text-2xl font-bold text-foreground">{activeKeys}</p>
          </div>
          <div className="bg-red-900/40 rounded-xl p-3">
            <p className="text-xs text-red-300">Device Locked</p>
            <p className="text-2xl font-bold text-foreground">{lockedDevices}</p>
          </div>
        </div>

        {/* Generate new key */}
        <div className="bg-card rounded-xl p-4 space-y-3 border border-border">
          <h3 className="text-sm font-medium text-foreground">Generate New Key</h3>
          <Input
            placeholder="Label (e.g., Punjab, Team-A)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="bg-secondary border-border"
          />
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Days"
              value={newDays}
              onChange={(e) => setNewDays(parseInt(e.target.value) || 1)}
              min={1}
              max={365}
              className="bg-secondary border-border w-24"
            />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <Button
            onClick={generateKey}
            disabled={generating}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Generate New Access Key"}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search keys or labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Keys list */}
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : filteredKeys.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No keys found</p>
        ) : (
          <div className="space-y-3">
            {filteredKeys.map((key) => {
              const isExpired = new Date(key.expires_at) < new Date();
              const status = !key.is_active ? "Revoked" : isExpired ? "Expired" : "Active";
              const statusColor =
                status === "Active"
                  ? "bg-green-600 text-green-100"
                  : status === "Revoked"
                  ? "bg-red-600 text-red-100"
                  : "bg-yellow-600 text-yellow-100";

              return (
                <div key={key.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                      {status}
                    </span>
                    <span className="text-sm font-medium text-foreground">{key.label}</span>
                  </div>

                  {/* Key code */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-lg px-3 py-2 font-mono text-sm text-foreground tracking-wider">
                      {key.key_code}
                    </div>
                    <button
                      onClick={() => copyKey(key.key_code)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      ⏱ Created: {format(new Date(key.created_at), "dd/MM/yyyy")}
                      {" · "}⏳ Expires: {format(new Date(key.expires_at), "dd/MM/yyyy")}
                    </p>
                    {key.device_id && (
                      <>
                        <p>📱 {key.device_id.substring(0, 20)}...</p>
                        {key.last_used_at && (
                          <p>Last used: {format(new Date(key.last_used_at), "dd/MM/yyyy, HH:mm")}</p>
                        )}
                        {key.last_ip && <p>🌐 IP: {key.last_ip}</p>}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {key.is_active && !isExpired && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeKey(key.id)}
                        className="text-xs h-7"
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Revoke
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteKey(key.id)}
                      className="text-xs h-7"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-sm space-y-4 border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">Change Password</h3>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="flex-1">
                {changingPassword ? "Changing..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
