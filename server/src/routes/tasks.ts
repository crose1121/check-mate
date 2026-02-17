import { Router } from "express";
import { pool } from "../db";

const router = Router();

// get active tasks (not completed)
router.get("/active", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE completed = false ORDER BY created_at DESC",
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
      "SELECT * FROM tasks WHERE completed = true ORDER BY created_at DESC",
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
  const { title, body } = req.body as { title: string; body: string };
  if (!title || !body) return res.status(400).json({ error: "missing fields" });

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, body) VALUES ($1,$2) RETURNING *",
      [title, body],
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
      "UPDATE tasks SET completed = true WHERE id = $1 RETURNING *",
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
      "UPDATE tasks SET completed = false WHERE id = $1 RETURNING *",
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
