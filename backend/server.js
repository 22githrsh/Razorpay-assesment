import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import peopleRoutes from "./routes/peopleRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/people", peopleRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` });
});

app.use((error, _req, res, _next) => {
  if (error.message && error.message.includes("not allowed by CORS")) {
    res.status(403).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});

await connectDB();

const server = app.listen(port, () => {
  console.log(`People API listening on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Set PORT in backend/.env to a free port.`);
  } else {
    console.error("Server failed to start:", error.message);
  }
  process.exit(1);
});
