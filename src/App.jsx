import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import TeacherDashboard from "./teacher"
import MockTest from "./pages/mocktest";
import StudentDashboard from "./student";

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