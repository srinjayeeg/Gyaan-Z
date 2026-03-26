import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import StudentDashboard from "./pages/student-dash";
import TeacherDashboard from "./pages/teach-dash";
import MockTest from "./pages/mocktest";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/mocktest" element={<MockTest />} />
      </Routes>
    </BrowserRouter>
  );
}