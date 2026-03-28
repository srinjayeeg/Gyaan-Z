import { useState, useEffect } from "react";
import {
    getCourses,
    getCommonQueries,
    getDashboardStats,
    getStudents,
    getTeacherProfile,
    logoutUser,
} from "./routing/api/index";

import { Icons } from "./components/Icons";
import DashboardPage from "./pages/teach-dash";
import CoursesPage from "./pages/teach-courses";
import TestsPage from "./pages/teach-tests";
import SettingsPage from "./pages/teach-sett";

const NAV_ITEMS = [
    { label: "Dashboard", icon: <Icons.Dashboard /> },
    { label: "Courses", icon: <Icons.Courses /> },
    { label: "Tests", icon: <Icons.Tests /> },
    { label: "Settings", icon: <Icons.Settings /> },
];

export default function TeacherDashboard() {
    const [activePage, setActivePage] = useState("Dashboard");
    const [courses, setCourses] = useState([]);
    const [queries, setQueries] = useState([]);
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [teacherName, setTeacherName] = useState("Teacher");

    useEffect(() => {
        async function load() {
            try {
                const [c, q, s, st, p] = await Promise.allSettled([
                    getCourses(),
                    getCommonQueries(),
                    getDashboardStats(),
                    getStudents(),
                    getTeacherProfile(),
                ]);

                if (c.status === "fulfilled") setCourses(c.value || []);
                if (q.status === "fulfilled") setQueries(q.value?.queries || []);
                if (s.status === "fulfilled") setStats(s.value);
                if (st.status === "fulfilled") setStudents(st.value || []);
                if (p.status === "fulfilled" && p.value?.name) {
                    setTeacherName(p.value.name.split(" ")[0]);
                }
            } catch (e) {
                console.warn("Backend not connected:", e.message);
            }
        }
        load();
    }, []);

    const handleLogout = async () => {
        if (!window.confirm("Sign out?")) return;
        try {
            await logoutUser();
        } catch {
            console.error("Logout error");
        }
        window.location.href = "/";
    };

    const renderPage = () => {
        switch (activePage) {
            case "Dashboard":
                return (
                    <DashboardPage
                        courses={courses}
                        queries={queries}
                        stats={stats}
                        students={students}
                    />
                );
            case "Courses":
                return <CoursesPage courses={courses} setCourses={setCourses} />;
            case "Tests":
                return <TestsPage />;
            case "Settings":
                return <SettingsPage onLogout={handleLogout} />;
            default:
                return <div>Page not found</div>;
        }
    };

    const glass = {
        background: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.5)",
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                background:
                    "linear-gradient(135deg, #c9dff7 0%, #daeeff 40%, #b8d4f0 100%)",
            }}
        >
            {/* SIDEBAR */}
            <aside
                style={{
                    width: 230,
                    ...glass,
                    borderRight: "1px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "28px 16px 24px",
                    boxShadow: "4px 0 24px rgba(59,130,246,0.06)",
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                }}
            >
                {/* LOGO */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 36,
                        paddingLeft: 4,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                        }}
                    ></div>
                    <div>
                        <div
                            style={{
                                fontWeight: 800,
                                fontSize: 15,
                                color: "#1e3a5f",
                            }}
                        >
                            Gyaan-Z
                        </div>
                        <div style={{ fontSize: 11, color: "#6b9fd4" }}>
                            Teacher Portal
                        </div>
                    </div>
                </div>

                {/* NAV */}
                <nav
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                >
                    {NAV_ITEMS.map(({ label, icon }) => {
                        const active = activePage === label;
                        return (
                            <button
                                key={label}
                                onClick={() => setActivePage(label)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "11px 14px",
                                    borderRadius: 12,
                                    border: "none",
                                    cursor: "pointer",
                                    width: "100%",
                                    background: active
                                        ? "rgba(59,130,246,0.15)"
                                        : "transparent",
                                    color: active ? "#1e40af" : "#4b7bb5",
                                    fontWeight: active ? 700 : 500,
                                }}
                            >
                                {icon}
                                {label}
                            </button>
                        );
                    })}
                </nav>

                {/* USER + LOGOUT */}
                <div style={{ marginTop: 16 }}>
                    <div style={{ paddingLeft: 14, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700 }}>{teacherName}</div>
                        <div style={{ fontSize: 11, color: "#6b9fd4" }}>
                            Teacher
                        </div>
                    </div>
                    <button onClick={handleLogout}>
                        <Icons.LogOut /> Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* HEADER */}
                <header
                    style={{
                        padding: "18px 28px",
                        background: "rgba(255,255,255,0.25)",
                        borderBottom: "1px solid rgba(255,255,255,0.4)",
                    }}
                >
                    <div style={{ fontWeight: 700 }}>{activePage}</div>
                </header>

                {/* 🔥 MAIN CONTENT FIX */}
                <main style={{ padding: "28px", flex: 1 }}>
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}