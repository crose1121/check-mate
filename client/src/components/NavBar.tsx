import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import checkMateLogo from "../assets/CheckMateLogo.png";
import "./NavBar.css";

export default function NavBar() {
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuth();
  const isGuestUser = user?.id === "guest-user";

  const handleAuthClick = () => {
    setUser(null);
    setToken(null);
    navigate("/");
  };

  const handleRestartClick = () => {
    setIsRestartModalOpen(true);
  };

  const handleCancelRestart = () => {
    setIsRestartModalOpen(false);
  };

  const handleConfirmRestart = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setIsRestartModalOpen(false);
    navigate("/");
  };

  const handleAboutClick = () => {
    navigate("/about");
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-left">
          <button
            type="button"
            className="nav-link nav-auth-btn"
            onClick={handleAboutClick}
          >
            About
          </button>
        </div>

        <div className="nav-center">
          <Link to="/" className={`logo ${user ? "logo-with-sidenav" : ""}`}>
            <span className="brand">
              <img
                src={checkMateLogo}
                alt="CheckMate logo"
                className="brand-icon"
              />
              <span className="brand-text">
                <span className="brand-task">Check</span>
                <span className="brand-buddy">Mate</span>
              </span>
            </span>
          </Link>
        </div>

        {user && (
          <div className="nav-right">
            <button
              type="button"
              className="nav-link nav-auth-btn"
              onClick={isGuestUser ? handleRestartClick : handleAuthClick}
            >
              {isGuestUser ? "Exit" : "Log Out"}
            </button>
          </div>
        )}
      </div>

      {isRestartModalOpen && (
        <div className="restart-modal-overlay" onClick={handleCancelRestart}>
          <div
            className="restart-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Exit Guest Session?</h3>
            <p>
              This will erase all data from your current guest session. This
              action cannot be undone.
            </p>
            <div className="restart-modal-actions">
              <button
                type="button"
                className="restart-cancel-btn"
                onClick={handleCancelRestart}
              >
                Cancel
              </button>
              <button
                type="button"
                className="restart-reset-btn"
                onClick={handleConfirmRestart}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
