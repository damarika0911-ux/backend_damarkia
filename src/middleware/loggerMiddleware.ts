import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import path from "path";
import fs from "fs";

// Ensure the logs directory exists
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a new write stream for daily logs
const logStream = fs.createWriteStream(
  path.join(logDir, `${new Date().toISOString().split("T")[0]}.log`),
  { flags: "a" }
);

// Middleware for logging requests
const requestLogger = morgan("combined", { stream: logStream });

export { requestLogger };