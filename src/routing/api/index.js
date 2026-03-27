const RAG_BASE = "http://localhost:8000"; 
// backend

export async function uploadPDF(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${RAG_BASE}/api/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
  return await res.json(); // { courseId, courseName, pageCount, uploadedAt }
}

export async function getCourses() {
    const res = await fetch(`${RAG_BASE}/api/courses`);
    if (!res.ok) throw new Error("Failed to fetch courses");
  return await res.json(); // [{ id, name, uploadedAt, pageCount, description, subject }]
}

export async function deleteCourse(courseId) {
    const res = await fetch(`${RAG_BASE}/api/courses/${courseId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete course");
  return await res.json(); // { success: true }
}

export async function getCommonQueries() {
    const res = await fetch(`${RAG_BASE}/api/queries`);
    if (!res.ok) throw new Error("Failed to fetch queries");
  return await res.json(); // { queries: [{ text, count, courseId }] }
}

export async function getStudentTests() {
    const res = await fetch(`${RAG_BASE}/api/tests`);
    if (!res.ok) throw new Error("Failed to fetch tests");
    return await res.json();
  // [{ id, studentName, studentId, courseId, courseName, score, maxScore, date, timeTaken, status }]
}

export async function getTestDetails(testId) {
    const res = await fetch(`${RAG_BASE}/api/tests/${testId}`);
    if (!res.ok) throw new Error("Failed to fetch test details");
    return await res.json();
  // { id, studentName, questions: [{ question, correct, studentAnswer, correctAnswer }], score, maxScore }
}

export async function getStudents() {
    const res = await fetch(`${RAG_BASE}/api/students`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return await res.json(); // [{ id, name, email, active, lastSeen, testsCount }]
}

export async function getTeacherProfile() {
    const res = await fetch(`${RAG_BASE}/api/teacher/profile`);
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json(); // { name, email, subject, institution, avatarUrl }
}

export async function updateTeacherProfile(data) {
    const res = await fetch(`${RAG_BASE}/api/teacher/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return await res.json(); // { success: true }
}

export async function getNotifications() {
    const res = await fetch(`${RAG_BASE}/api/notifications`);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return await res.json(); // [{ id, message, read, timestamp, type }]
}

export async function markNotificationRead(notifId) {
    const res = await fetch(`${RAG_BASE}/api/notifications/${notifId}/read`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to mark notification read");
    return await res.json();
}

export async function logoutUser() {
    const res = await fetch(`${RAG_BASE}/api/auth/logout`, { method: "POST" });
    if (!res.ok) throw new Error("Logout failed");
    return await res.json(); // { success: true }
}

export async function getDashboardStats() {
    const res = await fetch(`${RAG_BASE}/api/dashboard/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  // { totalCourses, totalStudents, totalTests, avgScore, activeStudents, recentActivity: [] }
}