export default function StatCard({ icon, label, value, sub, color }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            borderRadius: "18px",
            padding: "22px 24px",
            border: "1px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", gap: "16px",
            boxShadow: "0 4px 24px rgba(59,130,246,0.08)"
        }}>
        <div style={{
            width: 48, height: 48, borderRadius: "14px",
            background: color, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", flexShrink: 0
        }}>{icon}</div>
        <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", lineHeight: 1 }}>{value ?? "—"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4b7bb5", marginTop: 3 }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: "#6b9fd4", marginTop: 2 }}>{sub}</div>}
        </div>
    </div>
    );
}