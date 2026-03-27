import { useState, useEffect } from "react";
import {
    getCourses, getCommonQueries, getDashboardStats,
    getNotifications, getStudents, getTeacherProfile, logoutUser,
} from "./routing/api/index";
import { Icons } from "./components/Icons";
import NotifPanel from "./components/notifpanel";
import DashboardPage from "./pages/teach-dash";
import CoursesPage from "./pages/teach-courses";
import TestsPage from "./pages/teach-tests";
import SettingsPage from "./pages/teach-sett";

const NAV_ITEMS = [
    { label: "Dashboard", icon: <Icons.Dashboard /> },
    { label: "Courses",   icon: <Icons.Courses />   },
    { label: "Tests",     icon: <Icons.Tests />     },
    { label: "Settings",  icon: <Icons.Settings />  },
];

export default function TeacherDashboard() {
    const [activePage, setActivePage]   = useState("Dashboard");
    const [courses,    setCourses]      = useState([]);
    const [queries,    setQueries]      = useState([]);
    const [stats,      setStats]        = useState(null);
    const [students,   setStudents]     = useState([]);
    const [notifs,     setNotifs]       = useState([]);
    const [loading,    setLoading]      = useState(true);
    const [showNotifs, setShowNotifs]   = useState(false);
    const [teacherName, setTeacherName] = useState("Teacher");

    const unreadCount = notifs.filter((n) => !n.read).length;

    useEffect(() => {
        async function load() {
            try {
                const [c, q, s, n, st, p] = await Promise.allSettled([
                    getCourses(),
                    getCommonQueries(),
                    getDashboardStats(),
                    getNotifications(),
                    getStudents(),
                    getTeacherProfile(),
                ]);
                if (c.status  === "fulfilled") setCourses(c.value || []);
                if (q.status  === "fulfilled") setQueries(q.value?.queries || []);
                if (s.status  === "fulfilled") setStats(s.value);
                if (n.status  === "fulfilled") setNotifs(n.value || []);
                if (st.status === "fulfilled") setStudents(st.value || []);
                if (p.status  === "fulfilled" && p.value?.name)
                    setTeacherName(p.value.name.split(" ")[0]);
                } catch (e) {
                    console.warn("Backend not connected:", e.message);
                } finally {
                    setLoading(false);
                }
            }
            load();
        }, []);

        const handleLogout = async () => {
            if (!window.confirm("Sign out?")) return;
            try { await logoutUser(); } catch { console.error("Logout error"); }
            window.location.href = "/";
        };

        const renderPage = () => {
            switch (activePage) {
                case "Dashboard":
                    return <DashboardPage courses={courses} queries={queries} stats={stats} students={students} />;
                case "Courses":
                    return <CoursesPage courses={courses} setCourses={setCourses} />;
                case "Tests":
                    return <TestsPage />;
                case "Settings":
                    return <SettingsPage onLogout={handleLogout} />;
                default:
                    return null;
            }
        };

        const glass = {
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.5)",
        };

        return (
            <div style={{
                display: "flex", minHeight: "100vh",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                background: "linear-gradient(135deg, #c9dff7 0%, #daeeff 40%, #b8d4f0 100%)",
            }}>

            <aside style={{
                width: 230, ...glass,
                borderRight: "1px solid rgba(255,255,255,0.5)",
                display: "flex", flexDirection: "column",
                padding: "28px 16px 24px",
                boxShadow: "4px 0 24px rgba(59,130,246,0.06)",
                position: "sticky", top: 0, height: "100vh",
            }}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 4 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 18,
            }}></div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e3a5f", lineHeight: 1 }}>Gyaan-Z</div>
                    <div style={{ fontSize: 11, color: "#6b9fd4" }}>Teacher Portal</div>
                </div>
            </div>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                {NAV_ITEMS.map(({ label, icon }) => {
                    const active = activePage === label;
                    return (
                        <button
                            key={label}
                            onClick={() => setActivePage(label)}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "11px 14px", borderRadius: 12, border: "none",
                                cursor: "pointer", textAlign: "left", width: "100%",
                                background: active ? "rgba(59,130,246,0.15)" : "transparent",
                                color: active ? "#1e40af" : "#4b7bb5",
                                fontWeight: active ? 700 : 500, fontSize: 14,
                                transition: "all 0.15s",
                                boxShadow: active ? "inset 0 0 0 1px rgba(59,130,246,0.2)" : "none",
                            }}
                        >
                            <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
                            {label}
                        </button>
                    );
                })}
            </nav>

            <div style={{ borderTop: "1px solid rgba(59,130,246,0.1)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ paddingLeft: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>{teacherName}</div>
                    <div style={{ fontSize: 11, color: "#6b9fd4" }}>Teacher</div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", borderRadius: 12, border: "none",
                        cursor: "pointer", width: "100%",
                        background: "rgba(239,68,68,0.07)", color: "#ef4444",
                        fontSize: 14, fontWeight: 600, transition: "background 0.15s",
                    }}
                >
                    <Icons.LogOut /> Sign Out
                </button>
            </div>
            </aside>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

                <header style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 28px",
                    background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255,255,255,0.4)",
                    position: "sticky", top: 0, zIndex: 50,
                }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1e3a5f" }}>{activePage}</div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
                    <button
                        onClick={() => setShowNotifs((v) => !v)}
                        style={{
                            position: "relative",
                            background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)",
                            borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#4b7bb5",
                            display: "flex", alignItems: "center",
                        }}
                    >
                        <Icons.Bell />
                        {unreadCount > 0 && (
                            <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff" }} />
                        )}
                    </button>

                    <button
                        onClick={() => setActivePage("Settings")}
                        style={{
                            background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)",
                            borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#4b7bb5",
                            display: "flex", alignItems: "center",
                        }}
                    >
                        <Icons.User />
                    </button>

                    {showNotifs && (
                        <NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={() => setShowNotifs(false)} />
                    )}
                </div>
            </header>

            <main style={{ flex: 1, padding: "28px 28px 40px", maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                        <div style={{ color: "#6b9fd4", fontSize: 15, fontWeight: 600 }}>Loading dashboard…</div>
                    </div>
                ) : (
                    renderPage()
                )}
            </main>
        </div>
    </div>
    );
}