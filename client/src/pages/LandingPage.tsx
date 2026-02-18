import { useState } from "react";
import FormModal from "../components/FormModal";
import "./LandingPage.css";

export default function LandingPage() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"login" | "register">("login");

  const handleOpenLogin = () => {
    setFormMode("login");
    setFormModalOpen(true);
  };

  const handleOpenRegister = () => {
    setFormMode("register");
    setFormModalOpen(true);
  };

  return (
    <div className="landing">
      <h1 className="title">
        Welcome to{" "}
        <span className="brand">
          <span className="brand-task">Task</span>{" "}
          <span className="brand-buddy">Buddy</span>
        </span>
      </h1>
      <p className="subtitle">
        A simple, fast, and clean place to track your tasks.
      </p>
      <div className="cta-buttons">
        <button className="cta-btn cta-primary" onClick={handleOpenLogin}>
          Sign In
        </button>
        <button className="cta-btn cta-secondary" onClick={handleOpenRegister}>
          Create Account
        </button>
      </div>
      {formModalOpen && (
        <FormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          mode={formMode}
          onModeChange={setFormMode}
        />
      )}
    </div>
  );
}
