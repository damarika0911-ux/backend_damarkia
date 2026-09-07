import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure the logs directory exists
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Get the current date for log filename
const logFile = path.join(logDir, `${new Date().toISOString().split("T")[0]}.log`);

// Create a Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: logFile, level: "info" }) // Log to file
  ]
});

// Override console.log and console.error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  logger.info(args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "));
  originalConsoleLog(...args); // Keep default console log behavior
};

console.error = (...args) => {
  logger.error(args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "));
  originalConsoleError(...args); // Keep default console error behavior
};

export default logger;