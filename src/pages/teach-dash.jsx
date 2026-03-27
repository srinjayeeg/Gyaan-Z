import StatCard from "../components/StatCard";
import { Icons } from "../components/Icons";

export default function DashboardPage({ courses, queries, stats}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>Welcome back!</h1>
                <p style={{ color: "#6b9fd4", marginTop: 4, fontSize: 14 }}>
                    Here's what's happening in your classroom today.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <StatCard icon={<Icons.Book />} label="Total Courses" value={stats?.totalCourses ?? courses.length} color="#3b82f6" />
                <StatCard icon={<Icons.Users />} label="Active Students" value={stats?.activeStudents ?? "—"} sub={`of ${stats?.totalStudents ?? "—"} total`} color="#06b6d4" />
                <StatCard icon={<Icons.Tests />} label="Tests Taken" value={stats?.totalTests ?? "—"} color="#8b5cf6" />
                <StatCard icon={<Icons.Award />} label="Avg. Score" value={stats?.avgScore != null ? `${stats.avgScore}%` : "—"} color="#10b981" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(12px)", borderRadius: "18px", padding: "22px", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", marginBottom: 14, marginTop: 0 }}>Recent Courses</h3>
                    {courses.length === 0 ? (
                        <p style={{ color: "#a0b8d4", fontSize: 13 }}>No courses uploaded yet.</p>
                    ) : (
                        courses.slice(0, 4).map((c, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(59,130,246,0.1)" : "none" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                                    <Icons.Book />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{c.name}</div>
                                        <div style={{ fontSize: 11, color: "#6b9fd4" }}>{c.pageCount ? `${c.pageCount} pages` : "—"}</div>
                                </div>
                            </div>
                        ))
                    )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(12px)", borderRadius: "18px", padding: "22px", border: "1px solid rgba(255,255,255,0.3)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", marginBottom: 14, marginTop: 0 }}>Top Student Queries</h3>
                {queries.length === 0 ? (
                    <p style={{ color: "#a0b8d4", fontSize: 13 }}>No queries yet.</p>
                ) : (
                    queries.slice(0, 5).map((q, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(59,130,246,0.08)", borderRadius: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: "#1e3a5f", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                                {q.text}
                            </span>
                            {q.count && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "rgba(59,130,246,0.12)", borderRadius: 20, padding: "2px 8px" }}>
                                    {q.count}×
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>

        {stats?.recentActivity?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(12px)", borderRadius: "18px", padding: "22px", border: "1px solid rgba(255,255,255,0.3)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", marginBottom: 14, marginTop: 0 }}>Recent Activity</h3>
                {stats.recentActivity.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: i < stats.recentActivity.length - 1 ? "1px solid rgba(59,130,246,0.1)" : "none" }}>
                        <div style={{ color: "#6b9fd4", marginTop: 2 }}><Icons.Clock /></div>
                        <div style={{ fontSize: 13, color: "#3a5a8c" }}>
                            {a.message}{" "}
                            <span style={{ color: "#a0b8d4", fontSize: 11 }}>{a.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    );
}