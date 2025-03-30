import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "server", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

console.log("Starting MongoDB connection...");
console.log("Starting server on port 5000...");
const server = exec("node server/index.js");

server.stdout.on("data", (data) => {
  console.log(`SERVER: ${data}`);

  // Once server is running, start the client
  if (
    data.includes("Server running on port 5000") ||
    data.includes("Connected to MongoDB")
  ) {
    console.log("Starting client on port 3000...");
    const client = exec("npm run dev");

    client.stdout.on("data", (data) => {
      console.log(`CLIENT: ${data}`);
    });

    client.stderr.on("data", (data) => {
      console.error(`CLIENT ERROR: ${data}`);
    });
  }
});

server.stderr.on("data", (data) => {
  console.error(`SERVER ERROR: ${data}`);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down...");
  process.exit();
});

console.log("Collaborative Learning Platform starting up...");
console.log("Press Ctrl+C to stop the server");
