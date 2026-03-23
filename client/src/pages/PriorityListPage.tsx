import PriorityList from "../components/PriorityList";
import "./PriorityListPage.css";

export default function PriorityListPage() {
  return (
    <div className="priority-container">
      <div className="priority-header">
        <div className="page-heading">
          <p className="page-heading-subtitle">Planning</p>
          <h2 className="page-heading-title">Priority List</h2>
        </div>
        <p className="priority-hint">
          Drag rows to reorder · Click a task to view details
        </p>
      </div>
      <PriorityList />
    </div>
  );
}
