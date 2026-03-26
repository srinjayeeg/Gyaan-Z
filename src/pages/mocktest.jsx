import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

//   The questions API URL: GET /api/questions?courseId=AAA000
//   - Response format:
//     [
//       {
//         id: "1",
//         question: "What is machine learning?",
//         options: ["A) ...", "B) ...", "C) ...", "D) ..."],
//         answer: "A"   ← the correct option letter
//       },
//       ...
//     ]

const RAG_BASE_URL = "";

async function fetchQuestions(courseId) {
    const res = await fetch(`${RAG_BASE_URL}/api/questions?courseId=${courseId}`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    return await res.json();
}

const PLACEHOLDER_QUESTIONS = [
    {
        id: "1",
        question: "What is Retrieval-Augmented Generation (RAG)?",
        options: [
        "A) A method to train neural networks from scratch",
        "B) A technique combining retrieval and generation for better AI responses",
        "C) A type of database management system",
        "D) A programming language for AI",
        ],
        answer: "B",
    },
    {
        id: "2",
        question: "Which of the following best describes a vector embedding?",
        options: [
        "A) A compressed image file format",
        "B) A numerical representation of text that captures semantic meaning",
        "C) A type of neural network layer",
        "D) A database indexing method",
        ],
        answer: "B",
    },
    {
        id: "3",
        question: "What is the role of the retriever in a RAG system?",
        options: [
        "A) To generate new text from scratch",
        "B) To translate text between languages",
        "C) To find relevant document chunks from a knowledge base",
        "D) To train the language model",
        ],
        answer: "C",
    },
];

export default function MockTest() {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId = "AAA000", courseName = "COURSE-AAA000" } = location.state || {};

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);// whether answer is shown
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        loadQuestions();
    }, [courseId]);

    const loadQuestions = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchQuestions(courseId);
            setQuestions(data);
        } catch {

            setError("Using sample questions (RAG backend not connected)");
            setQuestions(PLACEHOLDER_QUESTIONS);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (letter) => {
        if (revealed) return;
        setSelected(letter);
    };

    const handleReveal = () => {
        if (!selected) return;
        setRevealed(true);
        const correct = selected === questions[current].answer;
        if (correct) setScore((s) => s + 1);
        setAnswers((prev) => [...prev, {
            question: questions[current].question,
            selected,
            correct: questions[current].answer,
            isCorrect: correct,
        }]);
    };

    const handleNext = () => {
        if (current + 1 >= questions.length) {
            setFinished(true);
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
            setRevealed(false);
        }
    };

    const handleRestart = () => {
        setCurrent(0);
        setSelected(null);
        setRevealed(false);
        setScore(0);
        setFinished(false);
        setAnswers([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300 flex items-center justify-center">
                <div className="text-blue-800 text-xl font-semibold animate-pulse">Loading questions...</div>
            </div>
        );
    }

    if (finished) {
        const pct = Math.round((score / questions.length) * 100);
        return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 text-center">
                <div className="text-6xl mb-4">{pct >= 70 ? "🎉" : "📖"}</div>
                    <h2 className="text-2xl font-extrabold text-blue-900 mb-1">Test Complete!</h2>
                    <p className="text-gray-500 text-sm mb-6">{courseName}</p>

                    <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                        <div className="text-5xl font-black text-blue-700 mb-1">{score}/{questions.length}</div>
                            <div className="text-gray-500 text-sm">{pct}% correct</div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                                <div
                                    className={`h-3 rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-400"}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>


                        <div className="text-left mb-6 max-h-52 overflow-y-auto flex flex-col gap-2">
                            {answers.map((a, i) => (
                            <div key={i} className={`rounded-xl px-4 py-3 text-sm ${a.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                            <p className="font-semibold text-gray-800 mb-1">{i + 1}. {a.question}</p>
                            <p className={a.isCorrect ? "text-green-600" : "text-red-500"}>
                                Your answer: {a.selected} {a.isCorrect ? "✓" : `✗ (Correct: ${a.correct})`}
                            </p>
                        </div>
                    ))}
                        </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleRestart}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate("/student")}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
        );
    }

    const q = questions[current];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/student")}
            className="text-blue-700 font-semibold text-sm hover:underline flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="text-center">
            <p className="text-blue-900 font-bold">{courseName}</p>
            <p className="text-blue-600 text-xs">Mock Test</p>
          </div>
          <div className="text-blue-700 font-bold text-sm">
            {current + 1} / {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/50 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        {error && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs rounded-xl px-4 py-2 mb-4 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Flashcard */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Score Badge */}
          <div className="flex justify-between items-center mb-6">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              Score: {score}
            </span>
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              Q{current + 1}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-lg font-bold text-gray-800 mb-8 leading-relaxed text-center">
            {q.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-8">
            {q.options.map((opt) => {
              const letter = opt[0]; // "A", "B", "C", "D"
              let style = "border-2 border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-blue-50";
              if (selected === letter && !revealed) style = "border-2 border-blue-600 bg-blue-50 text-blue-800 font-semibold";
              if (revealed && letter === q.answer) style = "border-2 border-green-500 bg-green-50 text-green-800 font-semibold";
              if (revealed && selected === letter && letter !== q.answer) style = "border-2 border-red-400 bg-red-50 text-red-700 font-semibold";

              return (
                <button
                  key={letter}
                  onClick={() => handleSelect(letter)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl text-sm transition ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {!revealed ? (
              <button
                onClick={handleReveal}
                disabled={!selected}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                {current + 1 >= questions.length ? "See Results" : "Next Question →"}
              </button>
            )}
          </div>

          {/* Feedback */}
          {revealed && (
            <div className={`mt-5 text-center text-sm font-semibold ${selected === q.answer ? "text-green-600" : "text-red-500"}`}>
              {selected === q.answer ? "✅ Correct!" : `❌ Incorrect — Correct answer: ${q.answer}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}