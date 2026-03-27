import { useRef, useState } from "react";
import { uploadPDF, deleteCourse } from "../routing/api/index";
import { Icons } from "../components/Icons";

export default function CoursesPage({ courses, setCourses }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState(null);

    const filtered = courses.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

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
                {
                    id: result.courseId,
                    name: result.courseName || file.name,
                    pageCount: result.pageCount,
                    uploadedAt: new Date().toISOString(),
                },
            ]);
            setUploadSuccess(`"${file.name}" uploaded successfully!`);
            setTimeout(() => setUploadSuccess(""), 4000);
        } catch {
            setUploadError("Upload failed. Make sure the RAG backend is running.");
        } finally {
            setUploading(false);
            e.target.value = "";
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
                    onClick={() => fileInputRef.current.click()}
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

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: "none" }}
                onChange={handleUpload}
            />

            {uploadError && (
                <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 12, padding: "10px 16px", fontSize: 13 }}>
                    {uploadError}
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