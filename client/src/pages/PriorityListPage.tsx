import PriorityList from "../components/PriorityList";
import "./PriorityListPage.css";

export default function PriorityListPage() {
  return (
    <div className="priority-container">
      <div className="priority-header">
        <h2>Priority List</h2>
      </div>
      <PriorityList />
    </div>
  );
}
