export default function StudentSidebar({ activePage, setActivePage, onSignOut }) {
    const nav = [
        { label: "Dashboard", emoji: "📊" },
        { label: "Courses",   emoji: "📚" },
        { label: "Quizzes",   emoji: "❓" },
        { label: "Settings",  emoji: "⚙️" },
    ];

    return (
        <aside style={{
        width: 220,
        background: "rgba(255,255,255,0.28)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.5)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 14px 24px",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxShadow: "4px 0 24px rgba(59,130,246,0.07)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 6 }}>
            <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
            }}></div>
            <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1e3a5f", lineHeight: 1 }}>Gyaan-Z</div>
                <div style={{ fontSize: 11, color: "#6b9fd4" }}>Student Portal</div>
            </div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            {nav.map(({ label, emoji }) => {
                const active = activePage === label;
                const disabled = label === "Quizzes";
                return (
                    <button
                        key={label}
                        onClick={() => !disabled && setActivePage(label)}
                        title={disabled ? "Coming soon" : ""}
                        style={{
                            display: "flex", alignItems: "center", gap: 11,
                            padding: "11px 14px", borderRadius: 12, border: "none",
                            cursor: disabled ? "not-allowed" : "pointer",
                            textAlign: "left", width: "100%",
                            background: active ? "rgba(59,130,246,0.15)" : "transparent",
                            color: disabled ? "#b0c8e8" : active ? "#1e40af" : "#4b7bb5",
                            fontWeight: active ? 700 : 500, fontSize: 14,
                            transition: "all 0.15s",
                            boxShadow: active ? "inset 0 0 0 1px rgba(59,130,246,0.2)" : "none",
                            opacity: disabled ? 0.55 : 1,
                        }}
                    >
                    <span style={{ fontSize: 17 }}>{emoji}</span>
                    {label}
                    {disabled && (
                        <span style={{ marginLeft: "auto", fontSize: 10, background: "rgba(59,130,246,0.12)", color: "#6b9fd4", borderRadius: 20, padding: "2px 7px", fontWeight: 600 }}>
                            Soon
                        </span>
                    )}
                </button>
            );
            })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(59,130,246,0.1)", paddingTop: 16, marginTop: 16 }}>
            <div style={{ paddingLeft: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>Student</div>
                <div style={{ fontSize: 11, color: "#6b9fd4" }}>Learner</div>
            </div>
            <button
                onClick={onSignOut}
                style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, border: "none",
                    cursor: "pointer", width: "100%",
                    background: "rgba(239,68,68,0.07)", color: "#ef4444",
                    fontSize: 14, fontWeight: 600,
                }}
            >
                Sign Out
            </button>
        </div>
    </aside>
    );
}