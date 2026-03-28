import { useRef, useState } from "react";
import { uploadPDF, deleteCourse, getCourses } from "../routing/api/index";;
import { Icons } from "../components/Icons";
const PREDEFINED_COURSES = [
    { id: "java101", name: "Java 101" },
    { id: "Python101", name: "101" },
];

export default function CoursesPage({ courses, setCourses }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);

    const filtered = courses.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedCourseId) {
            setUploadError("Please select a course first");
            return;
        }
        
        setUploading(true);
        setUploadError("");
        setUploadSuccess("");
        
        try {
            const result = await uploadPDF(file, selectedCourseId);

            const updated = await getCourses();
            setCourses(updated);
    
            setUploadSuccess(`Uploaded ${result.document_name} — ${result.chunks_created} chunks indexed`);
            setShowUploadModal(false);
            setSelectedCourseId("");
            setTimeout(() => setUploadSuccess(""), 4000);
        } catch (err) {
            setUploadError(err.message || "Upload failed");
        }
    };

    const handleDelete = async (courseId, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeleting(courseId);
        try {
            await deleteCourse(courseId);
            setCourses((prev) => prev.filter((c) => c.id !== courseId));
        } catch {
            alert("Failed to delete course.");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", margin: 0 }}>Course Materials</h1>
                    <p style={{ color: "#6b9fd4", marginTop: 4, fontSize: 14 }}>
                        {courses.length} course{courses.length !== 1 ? "s" : ""} uploaded
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    disabled={uploading}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#3b82f6", color: "#fff", border: "none",
                        borderRadius: 14, padding: "12px 22px", fontWeight: 700,
                        fontSize: 14, cursor: "pointer", opacity: uploading ? 0.6 : 1,
                        boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                    }}
                >
                    <Icons.Upload /> {uploading ? "Uploading…" : "Upload PDF"}
                </button>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", 
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: 24, width: "90%", maxWidth: 400,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", margin: 0, marginBottom: 16 }}>
                            Upload to Course
                        </h2>
                        
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: "2px solid #e5e7eb",
                                fontSize: 14,
                                marginBottom: 16,
                                fontFamily: "inherit",
                            }}
                        >
                            <option value="">Select a course...</option>
                            {PREDEFINED_COURSES.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.id})
                                </option>
                            ))}
                        </select>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            style={{ display: "none" }}
                            onChange={handleUpload}
                        />

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                disabled={uploading || !selectedCourseId}
                                style={{
                                    flex: 1, background: "#3b82f6", color: "#fff", border: "none",
                                    borderRadius: 8, padding: 10, fontWeight: 600, cursor: "pointer"
                                }}
                            >
                                {uploading ? "Uploading…" : "Select File"}
                            </button>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                style={{
                                    flex: 1, background: "#e5e7eb", color: "#1e3a5f", border: "none",
                                    borderRadius: 8, padding: 10, fontWeight: 600, cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                        </div>

                        {uploadError && (
                            <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: 10, fontSize: 13, marginTop: 12 }}>
                                {uploadError}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {uploadSuccess && (
                <div style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 12, padding: "10px 16px", fontSize: 13 }}>
                    {uploadSuccess}
                </div>
            )}

            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b9fd4" }}>
                    <Icons.Search />
                </span>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses…"
                    style={{
                        width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                        background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)",
                        borderRadius: 12, fontSize: 14, color: "#1e3a5f", outline: "none", boxSizing: "border-box",
                    }}
                />
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#a0b8d4" }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>No courses yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Upload a PDF to get started</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                {filtered.map((course) => (
                    <div
                        key={course.id}
                        style={{
                            background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)",
                            borderRadius: "18px", padding: "20px",
                            border: "1px solid rgba(255,255,255,0.4)",
                            boxShadow: "0 4px 20px rgba(59,130,246,0.07)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                            }}>
                                <Icons.Book />
                            </div>
                            <button
                                onClick={() => handleDelete(course.id, course.name)}
                                disabled={deleting === course.id}
                                style={{
                                    background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8,
                                    padding: "6px 8px", cursor: "pointer", color: "#ef4444",
                                    opacity: deleting === course.id ? 0.4 : 1,
                                }}
                            >
                                <Icons.Trash />
                            </button>
                        </div>

                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", marginBottom: 6, lineHeight: 1.3 }}>
                            {course.name}
                        </div>

                        <div style={{ fontSize: 11, color: "#6b9fd4", marginBottom: 4 }}>
                            ID:{" "}
                            <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#3b82f6" }}>
                                {course.id}
                            </span>
                        </div>

                        {course.subject && (
                            <div style={{ fontSize: 12, color: "#4b7bb5", marginBottom: 4 }}>{course.subject}</div>
                        )}
                        {course.description && (
                            <div style={{ fontSize: 12, color: "#6b9fd4", marginBottom: 8, lineHeight: 1.5 }}>
                                {course.description}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                            {course.pageCount && (
                                <span style={{ fontSize: 11, background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>
                                    {course.pageCount} pages
                                </span>
                            )}
                            {course.uploadedAt && (
                                <span style={{ fontSize: 11, background: "rgba(16,185,129,0.1)", color: "#059669", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>
                                    {new Date(course.uploadedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
    );
}