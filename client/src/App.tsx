import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import SideNav from "./components/SideNav";
import LandingPage from "./pages/LandingPage";
import AllTasks from "./pages/AllTasks";
import PriorityListPage from "./pages/PriorityListPage";
import CompletedTasks from "./pages/CompletedTasks";
import NewTask from "./pages/NewTask";
import "./App.css";

export default function App() {
  return (
    <>
      <NavBar />
      <SideNav />
      <div style={{ marginTop: "64px", marginLeft: "220px" }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tasks" element={<AllTasks />} />
          <Route path="/all" element={<AllTasks />} />
          <Route path="/priority" element={<PriorityListPage />} />
          <Route path="/completed" element={<CompletedTasks />} />
          <Route path="/new" element={<NewTask />} />
        </Routes>
      </div>
    </>
  );
}
