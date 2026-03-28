import { useState } from "react";
import AIChatModal from "../components/AiChatModal";

const COURSES = [
    {
        id: "java101",
        name: "Java 101",
        description: "Fundamentals of Java programming — OOP, data structures, control flow, and more. Notes uploaded by your teacher.",
        subject: "Computer Science",
        emoji: "☕",
        color: "linear-gradient(135deg,#f59e0b,#d97706)",
        topics: ["Variables & Types", "OOP Concepts", "Arrays & Lists", "Exception Handling", "File I/O"],
    },
];

export default function CoursesPage({ onTakeMockTest }) {
    const [chatCourse, setChatCourse] = useState(null);
    const [search, setSearch] = useState("");

    const filtered = COURSES.filter(
        (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>My Courses</h1>
                <p style={{ color: "#6b9fd4", marginTop: 4, fontSize: 14 }}>
                    {COURSES.length} course{COURSES.length !== 1 ? "s" : ""} enrolled
                </p>
            </div>

            <div style={{ position: "relative", maxWidth: 400 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15 }}>🔍</span>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses…"
                    style={{ width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 11, paddingBottom: 11, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 12, fontSize: 14, color: "#1e3a5f", outline: "none", boxSizing: "border-box" }}
                />
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#a0b8d4" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>No courses found</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                    {filtered.map((course) => (
                        <div
                            key={course.id}
                            style={{ background: "rgba(255,255,255,0.28)", backdropFilter: "blur(12px)", borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 6px 28px rgba(59,130,246,0.09)" }}
                        >
                        <div style={{ background: course.color, padding: "22px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ fontSize: 36 }}>{course.emoji}</div>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{course.name}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{course.subject}</div>
                                </div>
                            </div>

                            <div style={{ padding: "20px 24px" }}>
                                <p style={{ fontSize: 13, color: "#4b7bb5", lineHeight: 1.6, margin: "0 0 16px" }}>{course.description}</p>

                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <span style={{ fontSize: 11, color: "#6b9fd4", fontWeight: 600 }}>Course ID:</span>
                                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#1d4ed8", background: "rgba(29,78,216,0.08)", borderRadius: 8, padding: "2px 10px" }}>{course.id}</span>
                                </div>

                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4b7bb5", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Topics Covered</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {course.topics.map((t, i) => (
                                                <span span key={i} style={{ fontSize: 11, background: "rgba(59,130,246,0.1)", color: "#1d4ed8", borderRadius: 20, padding: "3px 11px", fontWeight: 600 }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button
                                            onClick={() => setChatCourse(course)}
                                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#1d4ed8,#0369a1)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 14px rgba(29,78,216,0.3)" }}
                                        >
                                            Ask AI Tutor
                                        </button>
                                        <button
                                            onClick={() => onTakeMockTest(course)}
                                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.7)", color: "#1d4ed8", border: "2px solid rgba(29,78,216,0.25)", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                                        >
                                            Mock Test
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {chatCourse && <AIChatModal course={chatCourse} onClose={() => setChatCourse(null)} />}
            </div>
        );
}