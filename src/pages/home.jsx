import { useState } from "react";
import { useNavigate } from "react-router-dom";
import homeGirlImg from "../assets/home-girl.png";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const features = [
    {
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect x="6" y="8" width="36" height="24" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
                <path d="M16 38h16M24 32v6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 18h8M12 23h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="34" cy="20" r="4" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M36 23l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        title: "Scope-Shield Technology",
        desc: 'Stay on track with AI specialized only in your curriculum. Our "Scope-Shield" refuses off-topic distractions, ensuring every interaction is relevant to your lecture notes.',
    },
    {
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <circle cx="24" cy="20" r="10" stroke="white" strokeWidth="2.5" fill="none"/>
                <path d="M24 10V6M24 34v4M10 20H6M42 20h-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="24" cy="20" r="4" fill="white" fillOpacity="0.4"/>
                <path d="M10 38 Q24 28 38 38" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
        ),
        title: "Confusion Heatmaps",
        desc: "Faculty dashboard that aggregates student queries into real-time heatmaps, allowing professors to pinpoint which topics cause the most struggle before the next lecture.",
    },
    {
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M12 6h24v36H12z" stroke="white" strokeWidth="2.5" rx="2" fill="none"/>
                <path d="M18 14h12M18 20h12M18 26h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="34" cy="34" r="6" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2"/>
                <path d="M31 34l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        title: "Page-Level Citations",
        desc: "Every AI response includes clickable citation chips that instantly scroll your course PDF to the exact paragraph the AI is referencing — trust but verify.",
    },
    {
        icon: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <rect x="8" y="12" width="32" height="28" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
                <path d="M8 20h32" stroke="white" strokeWidth="2"/>
                <path d="M16 8v8M32 8v8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <rect x="14" y="26" width="6" height="5" rx="1" fill="white" fillOpacity="0.5"/>
                <rect x="28" y="26" width="6" height="5" rx="1" fill="white" fillOpacity="0.5"/>
            </svg>
        ),
        title: "Socratic AI",
        desc: "The AI will use socratic reasoning while answering the questions, a way that allows students to understand the course-work with their own efforts, instead of direct answers that doesn't support academic brain-tasking.",
    },
];

export default function Home() {
    const navigate = useNavigate();
    const [modal, setModal] = useState(null); // "student-login" | "teacher-login" | "signup"
    const [form, setForm] = useState({ email: "", password: "", name: "", role: "student" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const openModal = (type) => {
        setModal(type);
        setError("");
        setForm({ name: "", email: "", password: "", role: type === "teacher-login" ? "teacher" : "student" });
    };

    //SIGN UP
    const handleSignup = async () => {
        if (!form.name || !form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: form.name,
                email: form.email,
                role: form.role,
                createdAt: new Date().toISOString(),
            });

            if (form.role === "teacher") navigate("/teacher");
            else navigate("/student");

        } catch (err) {
            if (err.code === "auth/email-already-in-use") setError("Email already registered. Please log in.");
            else if (err.code === "auth/invalid-email") setError("Invalid email address.");
            else setError("Signup failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    //LOGIN
    const handleLogin = async (expectedRole) => {
        if (!form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                setError("Account not found. Please sign up first.");
                setLoading(false);
                return;
            }

            const userData = userDoc.data();

            if (userData.role !== expectedRole) {
                setError(`This account is registered as a ${userData.role}. Please use the ${userData.role} login.`);
                setLoading(false);
                return;
            }

            if (userData.role === "teacher") navigate("/teacher");
            else navigate("/student");

        } catch (err) {
            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            setError("Incorrect email or password.");
            } else {
            setError("Login failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-sky-400 font-sans">

            <nav className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-black text-xl">R</div>
                    <span className="text-blue-900 font-bold text-lg hidden sm:block">Gyaan-Z</span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="#features" className="text-blue-900 font-medium hover:underline transition" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
                    <button
                        onClick={() => { setModal("signup"); setError(""); setForm({ email: "", password: "", name: "", role: "student" }); }}
                        className="bg-blue-800 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-900 transition"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            <div className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-16 gap-10">
                <div className="max-w-xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight mb-6">
                        Begin Learning with A<br />
                        <span className="text-blue-700">Personal 24/7</span> Available Tutor
                    </h1>
                    <p className="text-blue-800 mb-8 text-base leading-relaxed">
                        AI-powered tutoring scoped strictly to your course material. Ask questions, take mock tests, and track your progress, all in one place.
                    </p>
                    <div className="flex gap-4 mb-5 flex-wrap">
                        <button
                            onClick={() => { setModal("student-login"); setError(""); setForm({ email: "", password: "", name: "", role: "student" }); }}
                            className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-800 transition shadow-md"
                        >
                            Student Login
                        </button>
                        <button
                            onClick={() => { setModal("teacher-login"); setError(""); setForm({ email: "", password: "", name: "", role: "teacher" }); }}
                            className="bg-white text-blue-700 border-2 border-blue-700 px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-50 transition shadow-md"
                        >
                            Teacher Login
                        </button>
                    </div>
                    <p className="text-blue-800 text-sm">
                        Don't have an account?{" "}
                        <button
                            onClick={() => { setModal("signup"); setError(""); setForm({ email: "", password: "", name: "", role: "student" }); }}
                            className="underline font-semibold hover:text-blue-900"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
                {/* image */}
                <div className="w-64 h-64 md:w-100 md:h-100 bg-blue-300/40 rounded-full flex items-center justify-center select-none shadow-inner overflow-hidden -translate-y-5">
                    <img
                        src={homeGirlImg}
                        alt="Home girl"
                        className="object-cover w-full h-full"
                        onError={(e) => { e.target.src = '/fallback.png'; }}
                    />
                </div>
            </div>

            {/*features*/}
            <section id="features" className="bg-light blue/80 backdrop-blur py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-blue-900 text-center mb-3">Why Gyaan-Z?</h2>
                    <p className="text-blue-900 text-center mb-14 text-base max-w-xl mx-auto">
                        Everything you need to learn smarter, teach better, and stay on track — built into one platform.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                        {features.map((f, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-blue-400 flex items-center justify-center shadow-md flex-shrink-0">
                                    {f.icon}
                                </div>
                                <h3 className="text-blue-900 font-bold text-lg leading-snug">{f.title}</h3>
                                <p className="text-gray-900 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {modal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                        <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl">✕</button>

                        {/*Student Login*/}
                        {modal === "student-login" && (
                            <>
                                <div className="text-4xl text-center mb-3">🎓</div>
                                <h2 className="text-2xl font-bold text-blue-800 mb-1 text-center">Student Login</h2>
                                <p className="text-gray-500 text-sm mb-6 text-center">Access your courses and AI tutor</p>
                                <div className="flex flex-col gap-4">
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Email address"
                                        type="email"
                                        value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && handleLogin("student")}
                                    />
                                    {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                                    <button
                                        onClick={() => handleLogin("student")}
                                        disabled={loading}
                                        className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {loading ? "Logging in..." : "Login as Student"}
                                    </button>
                                    <p className="text-center text-sm text-gray-500">
                                        No account?{" "}
                                        <button onClick={() => openModal("signup")} className="text-blue-600 underline font-medium">Sign up</button>
                                    </p>
                                </div>
                            </>
                        )}

                        {/*Teacher Login*/}
                        {modal === "teacher-login" && (
                            <>
                                <div className="text-4xl text-center mb-3">Teach</div>
                                <h2 className="text-2xl font-bold text-blue-800 mb-1 text-center">Teacher Login</h2>
                                <p className="text-gray-500 text-sm mb-6 text-center">Manage courses and view student analytics</p>
                                <div className="flex flex-col gap-4">
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Email address"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && handleLogin("teacher")}
                                    />
                                    {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                                    <button
                                        onClick={() => handleLogin("teacher")}
                                        disabled={loading}
                                        className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {loading ? "Logging in..." : "Login as Teacher"}
                                    </button>
                                    <p className="text-center text-sm text-gray-500">
                                        No account?{" "}
                                        <button onClick={() => openModal("signup")} className="text-blue-600 underline font-medium">Sign up</button>
                                    </p>
                                </div>
                            </>
                        )}

                        {/*Sign Up*/}
                        {modal === "signup" && (
                            <>
                                <div className="text-4xl text-center mb-3">SIGN UP</div>
                                <h2 className="text-2xl font-bold text-blue-800 mb-1 text-center">Create Account</h2>
                                <p className="text-gray-500 text-sm mb-6 text-center">Join RAG Tutor today</p>
                                <div className="flex flex-col gap-4">
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Full name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Email address"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                    <input
                                        className="border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Password (min 6 characters)"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                    {/*Role Select*/}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setForm({ ...form, role: "student" })}
                                            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
                                                form.role === "student"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                                            }`}
                                        >
                                            Student
                                        </button>
                                        <button
                                            onClick={() => setForm({ ...form, role: "teacher" })}
                                            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
                                                form.role === "teacher"
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                                            }`}
                                        >
                                            Teacher
                                        </button>
                                    </div>
                                    {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                                    <button
                                        onClick={handleSignup}
                                        disabled={loading}
                                        className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {loading ? "Creating account..." : "Create Account"}
                                    </button>
                                    <p className="text-center text-sm text-gray-500">
                                        Already have an account?{" "}
                                        <button onClick={() => openModal("student-login")} className="text-blue-600 underline font-medium">Login</button>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
