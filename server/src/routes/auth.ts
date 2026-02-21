import { Router, Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const ACHIEVEMENT_TASK_THRESHOLDS = [0, 2, 5, 7, 10, 20];

function getWarrantedLevel(completedTasks: number): number {
  return ACHIEVEMENT_TASK_THRESHOLDS.reduce((level, requiredTasks, index) => {
    if (completedTasks >= requiredTasks) {
      return index + 1;
    }

    return level;
  }, 1);
}

// Register endpoint
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body as RegisterBody;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const result = await pool.query(
      "INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, created_at",
      [userId, email, hashedPassword, firstName || null, lastName || null],
    );

    // Create priority list for the user
    const priorityListId = uuidv4();
    await pool.query(
      "INSERT INTO priority_lists (id, user_id) VALUES ($1, $2)",
      [priorityListId, userId],
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const result = await pool.query(
      "SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/achievement-status/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const userResult = await pool.query(
        "SELECT id, user_level FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const completedTasksResult = await pool.query(
        "SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = $1 AND COALESCE(is_completed, false) = true",
        [userId],
      );

      const completedTasks = completedTasksResult.rows[0]?.count ?? 0;
      const previousUserLevel = userResult.rows[0].user_level ?? 1;
      const warrantedLevel = getWarrantedLevel(completedTasks);

      const hasLevelChanged = warrantedLevel !== previousUserLevel;
      const direction = hasLevelChanged
        ? warrantedLevel > previousUserLevel
          ? "promotion"
          : "demotion"
        : "none";

      if (hasLevelChanged) {
        await pool.query("UPDATE users SET user_level = $1 WHERE id = $2", [
          warrantedLevel,
          userId,
        ]);
      }

      return res.json({
        completedTasks,
        previousUserLevel,
        userLevel: warrantedLevel,
        hasLevelChanged,
        direction,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
