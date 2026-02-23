import {
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { Location } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import NavBar from "./components/NavBar";
import SideNav from "./components/SideNav";
import FormModal from "./components/FormModal";
import LandingPage from "./pages/LandingPage";
import AllTasks from "./pages/AllTasks";
import PriorityListPage from "./pages/PriorityListPage";
import CompletedTasks from "./pages/CompletedTasks";
import Achievements from "./pages/Achievements";
import CalendarPage from "./pages/CalendarPage";
import "./App.css";

export default function App() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { background?: Location } | undefined;
  const backgroundLocation = state?.background;

  // Show nothing while checking for stored session
  if (isLoading) {
    return null;
  }

  // If user is not logged in, only show landing page
  if (!user) {
    const isLoginRoute = location.pathname === "/login";
    const isRegisterRoute = location.pathname === "/register";

    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />
          <Route path="/register" element={<LandingPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>

        {(isLoginRoute || isRegisterRoute) && (
          <FormModal
            isOpen={true}
            onClose={() => navigate("/")}
            mode={isRegisterRoute ? "register" : "login"}
          />
        )}
      </>
    );
  }

  const isNewTaskRoute = location.pathname === "/new";

  return (
    <>
      <NavBar />
      <SideNav />
      <main className="app-content-with-sidenav">
        <Routes location={backgroundLocation || location}>
          <Route path="/" element={<AllTasks />} />
          <Route path="/tasks" element={<AllTasks />} />
          <Route path="/all" element={<AllTasks />} />
          <Route path="/priority" element={<PriorityListPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/completed" element={<CompletedTasks />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/new" element={<AllTasks />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>
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
