import { Router } from "express";
import { pool } from "../db";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// get active tasks (not completed)
router.get("/active", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE COALESCE(is_completed, false) = false ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

// get completed tasks
router.get("/completed", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE is_completed = true ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

// get all tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

// create a task
router.post("/", async (req, res) => {
  const { title, content, due_date, user_id } = req.body as {
    title: string;
    content: string;
    due_date?: string | null;
    user_id?: string;
  };
  if (!title || !content || !user_id)
    return res.status(400).json({ error: "missing fields" });

  try {
    const taskId = uuidv4();
    const result = await pool.query(
      "INSERT INTO tasks (id, user_id, title, content, is_completed, due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [taskId, user_id, title, content, false, due_date ?? null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

// mark task as completed
router.put("/:id/complete", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE tasks SET is_completed = true WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

// mark task as incomplete
router.put("/:id/uncomplete", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE tasks SET is_completed = false WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

// delete task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "task not found" });
    res.json({ message: "task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "database error" });
  }
});

export default router;
