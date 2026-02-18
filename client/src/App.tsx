import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import NavBar from "./components/NavBar";
import SideNav from "./components/SideNav";
import FormModal from "./components/FormModal";
import LandingPage from "./pages/LandingPage";
import AllTasks from "./pages/AllTasks";
import PriorityListPage from "./pages/PriorityListPage";
import CompletedTasks from "./pages/CompletedTasks";
import "./App.css";

export default function App() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking for stored session
  if (isLoading) {
    return null;
  }

  // If user is not logged in, only show landing page
  if (!user) {
    return (
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    );
  }

  const isNewTaskRoute = location.pathname === "/new";

  return (
    <>
      <NavBar />
      <SideNav />
      <div style={{ marginTop: "64px", marginLeft: "220px" }}>
        <Routes>
          <Route path="/" element={<AllTasks />} />
          <Route path="/tasks" element={<AllTasks />} />
          <Route path="/all" element={<AllTasks />} />
          <Route path="/priority" element={<PriorityListPage />} />
          <Route path="/completed" element={<CompletedTasks />} />
          <Route path="/new" element={<AllTasks />} />
        </Routes>
      </div>
      {isNewTaskRoute && (
        <FormModal
          isOpen={isNewTaskRoute}
          onClose={() => window.history.back()}
          mode="newTask"
        />
      )}
    </>
  );
}
