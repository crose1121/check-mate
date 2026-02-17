import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  created_at: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  body,
  created_at,
}: ModalProps) {
  if (!isOpen) return null;

  const date = new Date(created_at).toLocaleDateString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{title}</h2>
        <p className="modal-body">{body}</p>
        <small className="modal-date">{date}</small>
      </div>
    </div>
  );
}
