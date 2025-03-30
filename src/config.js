// API base URL
const API_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";

// Socket.io URL - Updated to use same origin as the React app for development
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:3000"; // Changed from 5000 to 3000 to match React app origin

// JWT token secret (for reference only, actual secret is on server)
const JWT_SECRET = "your_jwt_secret";

export { API_URL, SOCKET_URL, JWT_SECRET };
