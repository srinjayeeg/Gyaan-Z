import { useState } from "react";

/* ✅ Move Field outside */
const Field = ({ label, name, type = "text", placeholder, profile, setProfile }) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: "#4b7bb5",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.05em"
        }}>
            {label}
        </label>
        <input
            type={type}
            value={profile[name] ?? ""}
            placeholder={placeholder}
            onChange={(e) =>
                setProfile((p) => ({ ...p, [name]: e.target.value }))
            }
            style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 12,
                fontSize: 14,
                color: "#1e3a5f",
                outline: "none",
                boxSizing: "border-box"
            }}
        />
    </div>
);

/* ✅ Move Toggle outside */
const Toggle = ({ label, desc, name, notifs, setNotifs }) => (
    <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid rgba(59,130,246,0.08)"
    }}>
        <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a5f" }}>
                {label}
            </div>
            {desc && (
                <div style={{ fontSize: 12, color: "#6b9fd4", marginTop: 2 }}>
                    {desc}
                </div>
            )}
        </div>
        <button
            onClick={() =>
                setNotifs((s) => ({ ...s, [name]: !s[name] }))
            }
            style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: notifs[name] ? "#1d4ed8" : "#d1d5db",
                position: "relative"
            }}
        >
            <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: notifs[name] ? 23 : 3,
                transition: "left 0.2s"
            }} />
        </button>
    </div>
);

export default function StudentSettings({ onSignOut }) {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        rollNo: "",
        institution: ""
    });

    const [notifs, setNotifs] = useState({
        testReminders: true,
        weeklyDigest: false,
        tutorReplies: true
    });

    const [saveMsg, setSaveMsg] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg("");

        await new Promise((r) => setTimeout(r, 800));

        setSaveMsg("Settings saved!");
        setTimeout(() => setSaveMsg(""), 3000);
        setSaving(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
            <div>
                <h1>Settings</h1>
                <p>Manage your profile and preferences</p>
            </div>

            {/* Profile */}
            <div>
                <h3>Profile Information</h3>

                <Field label="Full Name" name="name" placeholder="Your name" profile={profile} setProfile={setProfile} />
                <Field label="Email" name="email" type="email" placeholder="you@school.edu" profile={profile} setProfile={setProfile} />
                <Field label="Roll / Student ID" name="rollNo" placeholder="e.g. CS2024001" profile={profile} setProfile={setProfile} />
                <Field label="Institution" name="institution" placeholder="Your school or university" profile={profile} setProfile={setProfile} />
            </div>

            {/* Notifications */}
            <div>
                <h3>Notifications</h3>

                <Toggle label="Mock test reminders" name="testReminders" notifs={notifs} setNotifs={setNotifs} />
                <Toggle label="Weekly learning digest" name="weeklyDigest" notifs={notifs} setNotifs={setNotifs} />
                <Toggle label="AI tutor replies" name="tutorReplies" notifs={notifs} setNotifs={setNotifs} />
            </div>

            {saveMsg && <div>{saveMsg}</div>}

            <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                </button>

                <button onClick={onSignOut}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}