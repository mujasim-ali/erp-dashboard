import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import Employees from "./Pages/Employees";
import Projects from "./Pages/Projects";
import Inventory from "./Pages/Inventory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/inventory" element={<Inventory />} />
    </Routes>
  );
}

export default App;