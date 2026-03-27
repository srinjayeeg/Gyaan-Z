import { useState, useEffect } from "react";
import { getStudentTests, getTestDetails } from "../routing/api/index";
import { Icons } from "../components/Icons";

export default function TestsPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTest, setSelectedTest] = useState(null);
    const [testDetails, setTestDetails] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        getStudentTests()
        .then(setTests)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const filtered = tests.filter(
        (t) =>
        t.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        t.courseName?.toLowerCase().includes(search.toLowerCase())
    );

    const openDetails = async (test) => {
        setSelectedTest(test);
        setDetailLoading(true);
        try {
            const d = await getTestDetails(test.id);
            setTestDetails(d);
        } catch {
            setTestDetails(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedTest(null);
        setTestDetails(null);
    };

    const getGrade = (score, max) => {
        const pct = (score / max) * 100;
        if (pct >= 90) return { label: "A", color: "#10b981" };
        if (pct >= 75) return { label: "B", color: "#3b82f6" };
        if (pct >= 60) return { label: "C", color: "#f59e0b" };
        return { label: "F", color: "#ef4444" };
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>Test Performance</h1>
                <p style={{ color: "#6b9fd4", marginTop: 4, fontSize: 14 }}>
                    {tests.length} test submission{tests.length !== 1 ? "s" : ""} tracked
                </p>
            </div>

            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b9fd4" }}>
                    <Icons.Search />
                </span>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student or course…"
                    style={{
                        width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                        background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)",
                        borderRadius: 12, fontSize: 14, color: "#1e3a5f", outline: "none", boxSizing: "border-box",
                    }}
                />
            </div>

            {loading ? (
                <p style={{ color: "#6b9fd4", fontSize: 14 }}>Loading test data…</p>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#a0b8d4" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>No tests yet</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>Student submissions will appear here</div>
                        </div>
                ) : (
                    <div style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(12px)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(59,130,246,0.08)" }}>
                                    {["Student", "Course", "Score", "Grade", "Date", "Time Taken", "Status", ""].map((h, i) => (
                                        <th key={i} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#4b7bb5", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        <tbody>
                        {filtered.map((t, i) => {
                            const grade = t.score != null && t.maxScore ? getGrade(t.score, t.maxScore) : null;
                            return (
                                <tr
                                    key={i}
                                    style={{ borderTop: "1px solid rgba(59,130,246,0.08)", transition: "background 0.15s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                <td style={{ padding: "13px 16px" }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{t.studentName ?? "—"}</div>
                                    <div style={{ fontSize: 11, color: "#6b9fd4" }}>{t.studentId}</div>
                                </td>
                                <td style={{ padding: "13px 16px", fontSize: 13, color: "#3a5a8c" }}>{t.courseName ?? "—"}</td>
                                <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
                                    {t.score != null ? `${t.score}/${t.maxScore}` : "—"}
                                </td>
                                <td style={{ padding: "13px 16px" }}>
                                    {grade && (
                                        <span style={{ background: `${grade.color}18`, color: grade.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 800 }}>
                                            {grade.label}
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: "13px 16px", fontSize: 12, color: "#6b9fd4" }}>
                                    {t.date ? new Date(t.date).toLocaleDateString() : "—"}
                                </td>
                                <td style={{ padding: "13px 16px", fontSize: 12, color: "#6b9fd4" }}>{t.timeTaken ?? "—"}</td>
                                    <td style={{ padding: "13px 16px" }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px",
                                            background: t.status === "completed" ? "#dcfce7" : "#fef9c3",
                                            color: t.status === "completed" ? "#16a34a" : "#ca8a04",
                                        }}>
                                            {t.status ?? "—"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "13px 16px" }}>
                                        <button
                                            onClick={() => openDetails(t)}
                                            style={{ background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#3b82f6", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                                        >
                                            <Icons.Eye /> View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {selectedTest && (
            <div
                style={{ position: "fixed", inset: 0, background: "rgba(15,30,60,0.55)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={closeModal}
            >
                <div
                    style={{ background: "linear-gradient(135deg,#f0f7ff,#e8f4ff)", borderRadius: 24, padding: 32, maxWidth: 600, width: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(15,30,60,0.25)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{selectedTest.studentName}</h2>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b9fd4" }}>{selectedTest.courseName}</p>
                        </div>
                        <button
                            onClick={closeModal}
                            style={{ background: "rgba(0,0,0,0.07)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#4b7bb5" }}
                        >
                            <Icons.X />
                        </button>
                    </div>

                    {detailLoading ? (
                        <p style={{ color: "#6b9fd4" }}>Loading details…</p>
                    ) : testDetails ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1, background: "rgba(59,130,246,0.08)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6" }}>{testDetails.score}/{testDetails.maxScore}</div>
                                    <div style={{ fontSize: 12, color: "#6b9fd4", marginTop: 2 }}>Score</div>
                                </div>
                                <div style={{ flex: 1, background: "rgba(16,185,129,0.08)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981" }}>
                                        {Math.round((testDetails.score / testDetails.maxScore) * 100)}%
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b9fd4", marginTop: 2 }}>Percentage</div>
                                </div>
                            </div>

                            {testDetails.questions?.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        background: q.correct ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                                        borderRadius: 12, padding: "14px",
                                        border: `1px solid ${q.correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                                    }}
                                >
                                    <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>
                                        Q{i + 1}: {q.question}
                                    </p>
                                    <p style={{ margin: "0 0 4px", fontSize: 12, color: q.correct ? "#059669" : "#dc2626" }}>
                                        Student: {q.studentAnswer}
                                    </p>
                                    {!q.correct && (
                                        <p style={{ margin: 0, fontSize: 12, color: "#059669" }}>Correct: {q.correctAnswer}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#a0b8d4", fontSize: 13 }}>Detailed breakdown not available.</p>
                    )}
                </div>
            </div>
        )}
    </div>
    );
}