import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content?: string;
  body?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string | null;
  is_completed?: boolean;
  priorityIndex?: number;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  content,
  body,
  created_at,
  updated_at,
  due_date,
  is_completed,
  priorityIndex,
}: ModalProps) {
  if (!isOpen) return null;

  const displayContent = content ?? body ?? "";

  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
  };

  const getDateMeta = () => {
    if (is_completed) {
      const completedDate = formatDate(updated_at) ?? formatDate(created_at);
      return {
        text: completedDate ? `Completed ${completedDate}` : "Completed",
        className: "modal-date modal-date--completed",
      };
    }

    if (due_date) {
      const dueDate = formatDate(due_date);
      if (dueDate) {
        return {
          text: `Due ${dueDate}`,
          className: "modal-date modal-date--due",
        };
      }
    }

    const createdDate = formatDate(created_at);
    if (createdDate) {
      return {
        text: `Created ${createdDate}`,
        className: "modal-date",
      };
    }

    return null;
  };

  const dateMeta = getDateMeta();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-layout">
          <div className="modal-priority">
            <div className="modal-priority-label">Priority</div>
            {priorityIndex ? (
              <div
                className={`modal-priority-badge priority-${Math.min(priorityIndex, 6)}`}
                aria-label={`Priority ${priorityIndex}`}
              >
                {priorityIndex}
              </div>
            ) : (
              <div className="modal-priority-placeholder">—</div>
            )}
          </div>

          <div className="modal-main">
            <h2 className="modal-title">{title}</h2>
            <p className="modal-body">{displayContent}</p>
            {dateMeta && (
              <small className={dateMeta.className}>{dateMeta.text}</small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
