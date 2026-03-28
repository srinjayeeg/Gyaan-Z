import { useState } from "react";
import AIChatModal from "../components/AiChatModal";

const COURSES = [{ id: "java101", name: "Java 101" }];

const STATS = [
    { emoji: "📖", label: "Courses Enrolled", value: 1 },
    { emoji: "💬", label: "Questions Asked", value: 0 },
    { emoji: "🧪", label: "Mock Tests", value: 0 },
    { emoji: "🏆", label: "Best Score", value: "—" },
];

// ─── DASHBOARD HOME PAGE ──────────────────────────────────────────────────────
export default function StudentHome({ setActivePage, onTakeMockTest }) {
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedCourse] = useState(COURSES[0]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>Welcome back 👋</h1>
                <p style={{ color: "#6b9fd4", marginTop: 4, fontSize: 14 }}>Ready to learn something new today?</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {STATS.map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.28)", backdropFilter: "blur(12px)", borderRadius: 18, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 20px rgba(59,130,246,0.07)" }}>
                    <div style={{ fontSize: 26 }}>{s.emoji}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#1e3a5f", marginTop: 8, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#6b9fd4", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
            ))}
        </div>

        <div style={{ display: "flex", gap: 14 }}>
            <button
                onClick={() => setChatOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#1d4ed8,#0369a1)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 26px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(29,78,216,0.35)" }}
            >
                Ask AI Tutor
            </button>
            <button
                onClick={onTakeMockTest}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.5)", color: "#1d4ed8", border: "2px solid rgba(29,78,216,0.3)", borderRadius: 14, padding: "14px 26px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
                Take Mock Test
            </button>
            <button
                onClick={() => setActivePage("Courses")}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.5)", color: "#0369a1", border: "2px solid rgba(3,105,161,0.25)", borderRadius: 14, padding: "14px 26px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
                My Courses
            </button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.28)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.4)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", margin: "0 0 16px" }}>Current Course</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#1d4ed8,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>☕</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "#1e3a5f" }}>{selectedCourse.name}</div>
                        <div style={{ fontSize: 12, color: "#6b9fd4", marginTop: 2 }}>Course ID: <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1d4ed8" }}>{selectedCourse.id}</span></div>
                    </div>
                    <button
                        onClick={() => setChatOpen(true)}
                        style={{ background: "rgba(29,78,216,0.1)", color: "#1d4ed8", border: "1px solid rgba(29,78,216,0.2)", borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                        Ask Tutor →
                    </button>
                </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.28)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,0.4)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", margin: "0 0 14px" }}>Activity (Last 13 Weeks)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(13, 1fr)", gap: 4 }}>
                {Array.from({ length: 91 }).map((_, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 4, background: "rgba(29,78,216,0.55)" }} />
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b9fd4", marginTop: 8, fontWeight: 600 }}>
                <span>Jan</span><span>Feb</span><span>Mar</span>
            </div>
        </div>

        {chatOpen && <AIChatModal course={selectedCourse} onClose={() => setChatOpen(false)} />}
        </div>
    );
}