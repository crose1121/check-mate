import { useEffect, useState } from "react";
import NoteGrid from "../components/NoteGrid";
import Modal from "../components/Modal";
import "./AllNotes.css";

interface NoteType {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at?: string;
  completed: boolean;
}

export default function AllNotes() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getUpdatedTime = (note: NoteType) =>
    new Date(note.updated_at ?? note.created_at).getTime();

  const getPriorityOrder = (): number[] => {
    try {
      const stored = localStorage.getItem("priorityOrder");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
    } catch {
      return [];
    }
  };

  const sortByRecent = (noteList: NoteType[]) =>
    [...noteList].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByPriorityOrder = (noteList: NoteType[]) => {
    const order = getPriorityOrder();
    const orderMap = new Map(order.map((id, index) => [id, index]));

    return [...noteList].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (!a.completed && !b.completed) {
        const aIndex = orderMap.get(a.id);
        const bIndex = orderMap.get(b.id);

        if (aIndex !== undefined || bIndex !== undefined) {
          if (aIndex === undefined) return 1;
          if (bIndex === undefined) return -1;
          return aIndex - bIndex;
        }
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:4000/notes");
        if (!response.ok) throw new Error("Failed to fetch notes");
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleNoteDelete = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleNoteComplete = (id: number) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, completed: !note.completed } : note,
      ),
    );
  };

  if (loading)
    return (
      <div className="all-notes-container">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="all-notes-container">
        <p>Error: {error}</p>
      </div>
    );

  const filteredNotes = includeCompleted
    ? notes
    : notes.filter((note) => !note.completed);

  const sortedNotes = (
    sortByPriority
      ? sortByPriorityOrder(filteredNotes)
      : sortByRecent(filteredNotes)
  ).slice(0, 15);

  return (
    <div className="all-notes-container">
      <div className="all-notes-header">
        <h2>All Notes</h2>
        <div className="all-notes-actions">
          <button
            className={`all-notes-toggle ${viewMode === "list" ? "active" : ""}`}
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
            }
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
          <button
            className={`all-notes-toggle ${includeCompleted ? "active" : ""}`}
            type="button"
            onClick={() => setIncludeCompleted((prev) => !prev)}
          >
            {includeCompleted ? "Hide Completed" : "Show Completed"}
          </button>
          <button
            className={`all-notes-sort ${sortByPriority ? "active" : ""}`}
            type="button"
            onClick={() => setSortByPriority((prev) => !prev)}
          >
            {sortByPriority ? "Sorted by Priority" : "Sort by Priority"}
          </button>
        </div>
      </div>
      {sortedNotes.length === 0 ? (
        <p>No notes yet. Create one!</p>
      ) : (
        <div
          className={`notes-grid-layout ${viewMode === "list" ? "list-view" : ""}`}
        >
          {sortedNotes.map((note, index) => (
            <div key={note.id}>
              <NoteGrid
                id={note.id}
                title={note.title}
                body={note.body}
                created_at={note.created_at}
                completed={note.completed}
                onSelect={setSelectedNote}
                onDelete={handleNoteDelete}
                showCheckmark={true}
                onComplete={handleNoteComplete}
                priorityIndex={
                  sortByPriority && !note.completed ? index + 1 : undefined
                }
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={selectedNote !== null}
        onClose={() => setSelectedNote(null)}
        title={selectedNote?.title || ""}
        content={selectedNote?.body || ""}
        created_at={selectedNote?.created_at || ""}
        updated_at={selectedNote?.updated_at}
        is_completed={selectedNote?.completed}
      />
    </div>
  );
}
