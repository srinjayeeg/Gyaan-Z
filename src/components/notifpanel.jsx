import { markNotificationRead } from "../routing/api/index";
import { Icons } from "./Icons";

export default function NotifPanel({ notifs, setNotifs, onClose }) {
    const unread = notifs.filter((n) => !n.read);

    const markRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        } catch {
            console.error("Failed to mark read");
        }
    };

    return (
        <div style={{
            position: "absolute", top: 50, right: 0, width: 320,
        background: "linear-gradient(135deg,#f0f7ff,#e8f4ff)",
        borderRadius: 18, boxShadow: "0 16px 48px rgba(15,30,60,0.2)",
        border: "1px solid rgba(255,255,255,0.6)", zIndex: 200, overflow: "hidden",
        }}>
            <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#1e3a5f" }}>Notifications</span>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b9fd4" }}>
                    <Icons.X />
                </button>
            </div>

            <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {notifs.length === 0 ? (
                    <p style={{ padding: "20px 18px", fontSize: 13, color: "#a0b8d4", textAlign: "center" }}>No notifications</p>
                    ) : (
                    notifs.map((n, i) => (
                    <div
                        key={i}
                        onClick={() => markRead(n.id)}
                        style={{
                            padding: "12px 18px",
                            borderBottom: "1px solid rgba(59,130,246,0.06)",
                            background: n.read ? "transparent" : "rgba(59,130,246,0.05)",
                            cursor: "pointer",
                            transition: "background 0.15s",
                        }}
                    >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        {!n.read && (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 5 }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#1e3a5f", lineHeight: 1.4, fontWeight: n.read ? 400 : 600 }}>
                                {n.message}
                            </div>
                            <div style={{ fontSize: 11, color: "#a0b8d4", marginTop: 4 }}>
                                {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
        </div>

        {unread.length > 0 && (
            <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(59,130,246,0.1)", textAlign: "center" }}>
                <button
                    onClick={() => notifs.forEach((n) => !n.read && markRead(n.id))}
                    style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                    Mark all as read
                </button>
            </div>
        )}
    </div>
    );
}