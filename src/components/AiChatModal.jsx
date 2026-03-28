import { useState, useRef, useEffect } from "react";

const CHAT_API = "http://localhost:8000/chat/";

async function askTutor(message, courseId, step = 0) {
  const res = await fetch(CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      course_id: courseId,
      step,
      threshold: 0.5,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  const data = await res.json();
  // Backend returns { response, status, similarity_score, ... }
  return { text: data.response, status: data.status, score: data.similarity_score };
}

// ─── STEP LABELS ──────────────────────────────────────────────────────────────
const STEP_LABELS = ["Hint", "Guided", "Partial", "Full"];
const STEP_TIPS = [
  "Gives a small hint + one question",
  "Deeper question + slight guidance",
  "Clearer hint + partial explanation",
  "Full explanation + example",
];

// ─── AI CHAT MODAL ────────────────────────────────────────────────────────────
export default function AIChatModal({ course, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", text }]);
    setLoading(true);
    try {
      const { text: reply, status, score } = await askTutor(text, course.id, step);
      setMessages((p) => [...p, { role: "ai", text: reply, status, score }]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "⚠️ Backend not reachable. Make sure FastAPI is running on port 5000.", status: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,30,60,0.55)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ width: "min(94vw, 560px)", height: "min(90vh, 640px)", display: "flex", flexDirection: "column", background: "#f0f7ff", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(15,30,60,0.28)", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1d4ed8,#0369a1)", padding: "18px 22px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>🤖 AI Tutor</div>
              <div style={{ fontSize: 12, color: "#93c5fd", marginTop: 2 }}>Course: {course.name}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Socratic step selector */}
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {STEP_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={STEP_TIPS[i]}
                style={{
                  flex: 1, padding: "5px 0", borderRadius: 8, border: "none",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: step === i ? "#fff" : "rgba(255,255,255,0.18)",
                  color: step === i ? "#1d4ed8" : "#bfdbfe",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#93c5fd", marginTop: 6, textAlign: "center" }}>
            {STEP_TIPS[step]}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 8px", display: "flex", flexDirection: "column", gap: 12, background: "#f0f7ff" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🧠</div>
              <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 15 }}>Ask anything about</div>
              <div style={{ fontWeight: 800, color: "#1d4ed8", fontSize: 16 }}>{course.name}</div>
              <div style={{ color: "#6b9fd4", fontSize: 12, marginTop: 8 }}>Answers are drawn from your teacher's uploaded notes</div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%",
                padding: "11px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "linear-gradient(135deg,#1d4ed8,#0369a1)" : "#fff",
                color: m.role === "user" ? "#fff" : "#1e3a5f",
                fontSize: 13, lineHeight: 1.6,
                boxShadow: m.role === "ai" ? "0 2px 12px rgba(59,130,246,0.1)" : "none",
                whiteSpace: "pre-wrap",
              }}>
                {m.text}
                {m.score != null && m.role === "ai" && (
                  <div style={{ fontSize: 10, color: m.status === "out_of_scope" ? "#f59e0b" : "#6b9fd4", marginTop: 6, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 4 }}>
                    {m.status === "out_of_scope" ? "⚠️ Out of scope" : `✓ Relevance: ${(m.score * 100).toFixed(0)}%`}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 18px", boxShadow: "0 2px 12px rgba(59,130,246,0.1)" }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(59,130,246,0.1)", background: "#fff", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask your question…"
            style={{ flex: 1, padding: "11px 16px", borderRadius: 12, border: "1.5px solid rgba(59,130,246,0.25)", fontSize: 14, color: "#1e3a5f", outline: "none", fontFamily: "inherit", background: "#f8fbff" }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1d4ed8,#0369a1)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.6 : 1 }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-7px); }
        }
      `}</style>
    </div>
  );
}