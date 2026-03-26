import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/sidebar";

const RAG_BASE = "http://localhost:8000";

async function uploadPDF(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${RAG_BASE}/api/upload`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return await res.json();
    //{courseId, courseName, pageCount}
}

async function getCourses() {
    const res = await fetch(`${RAG_BASE}/api/courses`);
    if (!res.ok) throw new Error("Failed to fetch courses");
    return await res.json();
    //[{id, name, uploadedAt, pageCount }]
}

async function getCommonQueries() {
    const res = await fetch(`${RAG_BASE}/api/queries`);
    if (!res.ok) throw new Error("Failed to fetch queries");
    return await res.json();
    // { queries: [{ text, count }] }
}

const sidebarItems = [
    {label: "Dashboard" },
    {label: "Courses" },
    {label: "Upload" },
    {label: "Settings" },
];

export default function TeacherDashboard() {
    const [courses, setCourses] = useState([]);
    const [queries, setQueries] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        async function loadData() {
            try {
                const [coursesData, queriesData] = await Promise.all([
                getCourses(),
                getCommonQueries(),
                ]);
                setCourses(coursesData);
                setQueries(queriesData.queries || []);
            } catch (err) {
            console.log("Backend not connected:", err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setUploadError("");
        setUploadSuccess("");
        try {
            const result = await uploadPDF(file);
            setCourses((prev) => [
                ...prev,
                { id: result.courseId, name: result.courseName || file.name, pageCount: result.pageCount },
            ]);
            setUploadSuccess(`✅ "${file.name}" uploaded successfully!`);
        } catch {
            setUploadError("Upload failed. make sure the RAG backend is running.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300">
            <Sidebar role="Teacher" items={sidebarItems} />

            <div className="flex-1 flex flex-col p-6 gap-4">
                <div className="flex items-center justify-between bg-blue-500/40 backdrop-blur rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 w-64">
                        <span className="text-gray-400">🔍</span>
                        <input className="bg-transparent outline-none text-sm w-full" placeholder="Search..." />
                    </div>
                    <div className="flex gap-3 text-xl">
                        <button>🔔</button>
                        <button>👤</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">

                    <div className="bg-white/30 backdrop-blur rounded-2xl p-5 flex flex-col gap-3">
                        <h2 className="text-blue-900 font-bold text-lg">Uploaded Course Materials</h2>

                        {loading && (
                            <p className="text-blue-600 text-sm animate-pulse">Loading courses...</p>
                        )}

                        {!loading && courses.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-blue-400 text-sm text-center">
                            No courses uploaded yet.<br />Click + to upload a PDF.
                        </div>
                        )}

                        {courses.map((course, i) => (
                        <div key={i} className="flex items-center gap-3 bg-blue-500/80 text-white rounded-xl px-4 py-3 shadow">
                            <span className="text-xl">📖</span>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{course.name}</p>
                                {course.pageCount && (
                                <p className="text-xs text-blue-200">{course.pageCount} pages</p>
                            )}
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="flex items-center justify-center bg-blue-400/70 hover:bg-blue-500 text-white rounded-xl py-5 text-3xl font-bold transition disabled:opacity-50 mt-auto"
                >
                    {uploading ? "⏳" : "+"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleUpload}
                />
                {uploadError && <p className="text-red-600 text-xs">{uploadError}</p>}
                {uploadSuccess && <p className="text-green-600 text-xs">{uploadSuccess}</p>}
            </div>

            <div className="flex flex-col gap-4">

                <div className="bg-blue-600/70 backdrop-blur rounded-2xl p-5 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-center flex-shrink-0">
                        <div>
                            <div className="text-2xl">{courses.length}</div>
                            <div className="text-xs">Courses</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        {courses.slice(0, 3).map((course, i) => (
                        <div key={i}>
                            <span className="text-white text-xs truncate block">{course.name}</span>
                            <div className="w-full bg-white/30 rounded-full h-2 mt-1">
                                <div className="bg-white rounded-full h-2" style={{ width: "100%" }} />
                            </div>
                        </div>
                        ))}
                        {courses.length === 0 && (
                        <p className="text-white/60 text-xs">No courses yet</p>
                        )}
                    </div>
                </div>

                <button className="bg-blue-600/70 text-white font-semibold rounded-xl px-5 py-3 text-sm text-left hover:bg-blue-700 transition">
                    List of Active and Inactive Students &gt;
                </button>

                <div className="bg-white/30 backdrop-blur rounded-2xl p-4 flex-1">
                    <p className="text-blue-800 font-semibold text-sm mb-3">
                        Common Student Queries
                    </p>
                    {queries.length === 0 ? (
                    <p className="text-blue-400 text-xs italic">
                        Queries will appear here once students start asking questions.
                    </p>
                    ) : (
                    <div className="flex flex-col gap-2">
                        {queries.map((q, i) => (
                            <div key={i} className="bg-blue-200/70 text-blue-900 text-sm px-4 py-2 rounded-xl flex justify-between">
                                <span className="truncate">{q.text}</span>
                                {q.count && (
                                <span className="text-blue-500 text-xs ml-2 flex-shrink-0">{q.count}x</span>
                                )}
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    </div>
    );
}