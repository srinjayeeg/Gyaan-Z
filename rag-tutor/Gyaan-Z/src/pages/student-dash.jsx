import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";

// Request format: { message: string, courseId: string }
// Response format: { reply: string }

const LLM_API_URL = "http://localhost:5000/api/chat";

async function askLLM(message, courseId) {
    const res = await fetch(LLM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, courseId }),
    });
    if (!res.ok) throw new Error("LLM request failed");
    const data = await res.json();
    return data.reply; //adjust
}

//   - The courses list URL (e.g. GET /api/courses)
//   - Response format: [{ id: string, name: string }]

const COURSES = [
    { id: "AAA000", name: "COURSE-AAA000" },
    { id: "BBB111", name: "COURSE-BBB111" },
];

const sidebarItems = [
    { icon: "📊", label: "Dashboard" },
    { icon: "📚", label: "Courses" },
    { icon: "❓", label: "Quizzes" },
    { icon: "⚙️", label: "Settings" },
];

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setLoading(true);
        try {
            const reply = await askLLM(userMsg, selectedCourse.id);
            setMessages((prev) => [...prev, { role: "ai", text: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "⚠️ Tutor backend not connected yet. Ask your teammate for the API URL." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300">
            <Sidebar role="Student" items={sidebarItems} />

            <div className="flex-1 flex flex-col p-6 gap-5">

                <div className="flex items-center justify-between bg-blue-500/40 backdrop-blur rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 w-64">
                        <span className="text-gray-400">🔍</span>
                        <input className="bg-transparent outline-none text-sm w-full text-gray-700" placeholder="Search courses..." />
                    </div>
                    <div className="flex gap-3 items-center">
                        <button className="text-2xl">🔔</button>
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-white bg-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-800 transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={() => setChatOpen(true)}
                        className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition shadow flex items-center gap-2"
                    >
                        Ask AI Tutor
                    </button>
                    <button
                        onClick={() => navigate("/mocktest", { state: { courseId: selectedCourse.id, courseName: selectedCourse.name } })}
                        className="bg-white text-blue-700 border-2 border-blue-600 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow flex items-center gap-2"
                    >
                        Take Mock Test
                    </button>
                </div>

                <div>
                    <h2 className="text-blue-900 font-bold text-base mb-3">Your Courses</h2>
                    <div className="bg-white/30 backdrop-blur rounded-2xl p-4">
                        <div className="flex gap-4 flex-wrap">
                            {COURSES.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCourse(c)}
                                    className={`w-40 h-28 rounded-2xl font-bold text-white text-sm shadow transition flex items-center justify-center text-center px-2
                                    ${selectedCourse.id === c.id ? "bg-blue-700 scale-105 ring-2 ring-white" : "bg-blue-500 hover:bg-blue-600"}`}
                                >
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-3 italic">
                        Showing placeholder courses — connect RAG backend to load real ones
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-white/30 backdrop-blur rounded-2xl p-4">
                    <p className="text-blue-800 font-semibold mb-3 text-sm">Activity History</p>
                    <div className="grid grid-cols-13 gap-1 mb-2" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
                        {Array.from({ length: 91 }).map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-sm ${Math.random() > 0.55 ? "bg-blue-500" : "bg-white/50"}`}
                        />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-blue-700 font-medium mt-2 px-1">
                        <span>Jan</span><span>Feb</span><span>Mar</span>
                    </div>
                </div>

                <div className="bg-blue-600/70 backdrop-blur rounded-2xl p-5 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-center flex-shrink-0">
                        <div>
                            <div className="text-2xl">0</div>
                            <div className="text-xs">Questions</div>
                        </div>
                    </div>
                <div className="flex flex-col gap-3 flex-1">
                    {[
                        { label: "Courses Viewed", pct: 0 },
                        { label: "Quizzes Taken", pct: 0 },
                        { label: "Topics Covered", pct: 0 },
                    ].map((item, i) => (
                    <div key={i}>
                        <span className="text-white text-xs">{item.label}</span>
                        <div className="w-full bg-white/30 rounded-full h-2 mt-1">
                            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${item.pct}%` }} />
                        </div>
                    </div>
                    ))}
                    <p className="text-blue-200 text-xs italic">
                        Connect backend
                    </p>
                </div>
            </div>
        </div>
        </div>

        {chatOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[580px] flex flex-col overflow-hidden">

                    <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg">AI Tutor</p>
                            <p className="text-xs text-blue-200">
                                Course: {selectedCourse.name}
                            </p>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="text-xl hover:text-red-300 mt-1">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-blue-50">
                        {messages.length === 0 && (
                        <div className="text-center mt-10">
                            <p className="text-4xl mb-3">🤖</p>
                            <p className="text-gray-500 text-sm">Ask anything about <strong>{selectedCourse.name}</strong></p>
                            <p className="text-gray-400 text-xs mt-1">Answers are based on your teacher's uploaded notes</p>
                        </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    m.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white text-gray-800 shadow rounded-bl-none"
                            }`}>
                        {m.text}
                    </div>
                </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-2.5 rounded-2xl text-sm text-gray-400 shadow animate-pulse rounded-bl-none">
                            Tutor is thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t flex gap-2 bg-white">
                <input
                    className="flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ask your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    Send
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
    );
}