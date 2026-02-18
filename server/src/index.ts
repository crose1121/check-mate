import express from "express";
import cors from "cors";
import tasks from "./routes/tasks";
import auth from "./routes/auth";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/tasks", tasks);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
