import { useState, useEffect } from "react";
import { getTeacherProfile, updateTeacherProfile } from "../routing/api/index";
import { Icons } from "../components/Icons";

export default function SettingsPage({ onLogout }) {
    const [profile, setProfile] = useState({ name: "", email: "", subject: "", institution: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [notifSettings, setNotifSettings] = useState({
        emailOnQuery: true,
        emailOnTest: true,
        weeklyReport: false,
    });

    useEffect(() => {
        getTeacherProfile()
        .then((p) => setProfile(p || {}))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg("");
        try {
            await updateTeacherProfile({ ...profile, notifSettings });
            setSaveMsg("Settings saved successfully!");
            setTimeout(() => setSaveMsg(""), 3000);
        } catch {
            setSaveMsg("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, name, type = "text", placeholder }) => (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#4b7bb5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
            </label>
            <input
                type={type}
                value={profile[name] ?? ""}
                placeholder={placeholder}
                onChange={(e) => setProfile((p) => ({ ...p, [name]: e.target.value }))}
                style={{
                    width: "100%", padding: "11px 14px",
                    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 12, fontSize: 14, color: "#1e3a5f", outline: "none", boxSizing: "border-box",
                }}
            />
        </div>
    );

    const Toggle = ({ label, desc, name }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(59,130,246,0.08)" }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a5f" }}>{label}</div>
                {desc && <div style={{ fontSize: 12, color: "#6b9fd4", marginTop: 2 }}>{desc}</div>}
            </div>
            <button
                onClick={() => setNotifSettings((s) => ({ ...s, [name]: !s[name] }))}
                style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                    background: notifSettings[name] ? "#3b82f6" : "#d1d5db",
                    transition: "background 0.2s", position: "relative",
                }}
            >
            <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3,
                left: notifSettings[name] ? 23 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
        </button>
    </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>Settings</h1>
                <p style={{ color: "#6b9fd4", marginTop: 4, fontSize: 14 }}>Manage your profile and preferences</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", borderRadius: 18, padding: 24, border: "1px solid rgba(255,255,255,0.4)" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>Profile Information</h3>
                    {loading ? (
                        <p style={{ color: "#6b9fd4", fontSize: 13 }}>Loading profile…</p>
                    ) : (
                <>
                    <Field label="Full Name" name="name" placeholder="Your name" />
                    <Field label="Email" name="email" type="email" placeholder="you@school.edu" />
                    <Field label="Subject / Department" name="subject" placeholder="e.g. Mathematics" />
                    <Field label="Institution" name="institution" placeholder="School or university" />
                </>
            )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)", borderRadius: 18, padding: 24, border: "1px solid rgba(255,255,255,0.4)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#1e3a5f" }}>Notifications</h3>
            <Toggle label="Email on new student query" desc="Get notified when a student asks a new question" name="emailOnQuery" />
            <Toggle label="Email on test submission" desc="Get notified when a student completes a test" name="emailOnTest" />
            <Toggle label="Weekly performance report" desc="Receive a weekly summary of class performance" name="weeklyReport" />
        </div>

        {saveMsg && (
            <div style={{
                background: saveMsg.includes("success") ? "#dcfce7" : "#fee2e2",
                color: saveMsg.includes("success") ? "#16a34a" : "#dc2626",
                borderRadius: 12, padding: "10px 16px", fontSize: 13,
            }}>
                {saveMsg}
            </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
            <button
                onClick={handleSave}
                disabled={saving || loading}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "#3b82f6", color: "#fff", border: "none",
                    borderRadius: 14, padding: "12px 24px", fontWeight: 700,
                    fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1,
                }}
            >
                <Icons.Save /> {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
                onClick={onLogout}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(239,68,68,0.1)", color: "#dc2626",
                    border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14,
                    padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
            >
                <Icons.LogOut /> Sign Out
            </button>
        </div>
    </div>
    );
}