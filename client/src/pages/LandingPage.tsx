import "./LandingPage.css";

export default function LandingPage() {
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
    </div>
  );
}
