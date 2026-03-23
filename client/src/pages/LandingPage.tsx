import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import AppTitle from "../components/AppTitle";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  return (
    <section className="landing-page">
      <div className="landing-page__content">
        <AppTitle height="156px" width="156px" />
        <p className="landing-page__subtitle">Productivity and Planning</p>

        <div className="landing-page__actions">
          <button
            type="button"
            className="landing-page__button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            type="button"
            className="landing-page__button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>

        <button
          type="button"
          className="landing-page__learn-more"
          onClick={() => setIsLearnMoreOpen(true)}
        >
          Learn More
        </button>
      </div>

      <Modal
        isOpen={isLearnMoreOpen}
        onClose={() => setIsLearnMoreOpen(false)}
        title="Why teams choose Check Mate"
      >
        <div className="modal-info-card">
          <h3>Plan with clarity</h3>
          <p>
            Map every task with priorities, due dates, and quick status cues so
            everyone knows what matters now.
          </p>
          <ul>
            <li>Drag-and-drop priority lists</li>
            <li>Calendar view for due dates</li>
            <li>Filters for focus by status</li>
          </ul>
        </div>
        <div className="modal-info-card">
          <h3>Ship with confidence</h3>
          <p>
            Keep work moving with lightweight workflows-no clutter, just the
            essentials to get things done together.
          </p>
          <ul>
            <li>Real-time task updates</li>
            <li>Fast note-taking alongside tasks</li>
            <li>Reminders that respect your time</li>
          </ul>
        </div>
      </Modal>
    </section>
  );
}
