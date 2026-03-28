import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "./components/StudentSidebar";
import StudentHome from "./pages/student-dash";
import CoursesPage from "./pages/student-courses";
import StudentSettings from "./pages/student-sett";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("Dashboard");

    const handleSignOut = () => navigate("/");

    const handleTakeMockTest = (course) => {
        navigate("/mocktest", {
            state: {
                courseId: course?.id ?? "java101",
                courseName: course?.name ?? "Java 101",
            },
        });
    };

    const renderPage = () => {
        switch (activePage) {
            case "Dashboard":
                return <StudentHome setActivePage={setActivePage} onTakeMockTest={() => handleTakeMockTest()} />;
            case "Courses":
                return <CoursesPage onTakeMockTest={handleTakeMockTest} />;
            case "Quizzes":
                return <QuizzesPage />;
            case "Settings":
                return <StudentSettings onSignOut={handleSignOut} />;
            default:
            return null;
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "linear-gradient(135deg,#c9dff7 0%,#daeeff 40%,#b8d4f0 100%)" }}>
            <StudentSidebar
                activePage={activePage}
                setActivePage={setActivePage}
                onSignOut={handleSignOut}
            />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <header style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 28px",
                    background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255,255,255,0.4)",
                    position: "sticky", top: 0, zIndex: 50,
                }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1e3a5f" }}>{activePage}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#6b9fd4" }}>🔍</span>
                            <input
                                placeholder="Search…"
                                style={{ paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 10, fontSize: 13, color: "#1e3a5f", outline: "none", width: 180 }}
                            />
                        </div>
                        <button style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 10, padding: "8px 11px", cursor: "pointer", fontSize: 16 }}>🔔</button>
                            <button
                                onClick={() => setActivePage("Settings")}
                                style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 10, padding: "8px 11px", cursor: "pointer", fontSize: 16 }}
                        >👤</button>
                    </div>
                </header>

                <main style={{ flex: 1, padding: "28px 28px 40px", maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}