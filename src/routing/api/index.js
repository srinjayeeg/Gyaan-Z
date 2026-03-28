const RAG_BASE = "http://localhost:8000";

export async function uploadPDF(file, courseId) {
    const formData = new FormData();

    // ✅ MUST match FastAPI param name
    formData.append("file", file);

    try {
        const res = await fetch(
            `${RAG_BASE}/upload/?course_id=${courseId}`, // ✅ correct query param
            {
                method: "POST",
                body: formData,
            }
        );

        // ✅ Better error handling (IMPORTANT)
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Upload failed");
        }

        const data = await res.json();

        // ✅ Safety check
        if (!data || !data.document_name) {
            throw new Error("Invalid response from server");
        }

        return data;
    } catch (err) {
        console.error("UPLOAD ERROR:", err);

        // ❌ DO NOT return null (this was breaking your UI)
        throw err;
    }
}

export async function retrieveChunks(query, courseId) {
    try {
        const res = await fetch(
            `${RAG_BASE}/retrieve/?query=${encodeURIComponent(query)}&course_id=${courseId}`
        );

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Retrieve failed");
        }

        return await res.json();
    } catch (err) {
        console.error("RETRIEVE ERROR:", err);
        throw err;
    }
}

export async function getCourseChunks(courseId) {
    try {
        const res = await fetch(`${RAG_BASE}/course/${courseId}/chunks`);

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch course chunks");
        }

        return await res.json();
    } catch (err) {
        console.error("CHUNKS ERROR:", err);
        throw err;
    }
}

export async function askQuestion(message, courseId, step = 0) {
    try {
        const res = await fetch(`${RAG_BASE}/chat/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
                course_id: courseId,
                step,
                threshold: 0.5,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Chat failed");
        }

        return await res.json();
    } catch (err) {
        console.error("CHAT ERROR:", err);
        return {
            response: "Error connecting to tutor.",
            status: "error",
        };
    }
}

export async function askQuestionMultiTurn(messages, courseId, step = 0) {
    try {
        const res = await fetch(`${RAG_BASE}/chat/multi-turn/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                course_id: courseId,
                step,
                threshold: 0.5,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Chat failed");
        }

        return await res.json();
    } catch (err) {
        console.error("MULTI CHAT ERROR:", err);
        return {
            response: "Error connecting to tutor.",
            status: "error",
        };
    }
}

// --- MOCK / PLACEHOLDER FUNCTIONS ---

export async function getCourses() {
    console.warn("getCourses not implemented");
    return [];
}

export async function deleteCourse(courseId) {
    console.warn("deleteCourse not implemented", courseId);
    return { success: true };
}

export async function getCommonQueries() {
    return { queries: [] };
}

export async function getStudentTests() {
    return [];
}

export async function getTestDetails() {
    return null;
}

export async function getStudents() {
    return [];
}

export async function getTeacherProfile() {
    return {};
}

export async function updateTeacherProfile() {
    return { success: true };
}

export async function logoutUser() {
    return { success: true };
}

export async function getDashboardStats() {
    return {
        totalCourses: 0,
        totalStudents: 0,
        totalTests: 0,
        avgScore: 0,
        activeStudents: 0,
        recentActivity: [],
    };
}