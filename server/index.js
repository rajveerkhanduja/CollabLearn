import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import User from "./models/User.js";
import Group from "./models/Group.js";
import Message from "./models/Message.js";
import Content from "./models/Content.js";
import Quiz from "./models/Quiz.js";
import QuizResult from "./models/QuizResult.js";
import Notification from "./models/Notification.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type"));
  },
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/learning-platform", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, "your_jwt_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      role: user.role,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the account is disabled
    if (user.isDisabled) {
      return res.status(403).json({
        message:
          "Your account has been disabled. Please contact an administrator.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      role: user.role,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Quiz routes
app.post("/api/quizzes", authenticateToken, async (req, res) => {
  try {
    const { title, description, questions, groupId } = req.body;

    console.log(
      "Creating quiz with data:",
      JSON.stringify({
        title,
        description,
        questionCount: questions?.length || 0,
        userId: req.user.userId,
      })
    );

    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid quiz data. Title and at least one question required.",
      });
    }

    // Validate each question has required fields
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (
        !q.question ||
        !q.options ||
        !Array.isArray(q.options) ||
        q.options.length < 2
      ) {
        return res.status(400).json({
          message: `Question ${
            i + 1
          } is invalid. Each question needs a question text and at least 2 options.`,
        });
      }

      if (
        q.correctAnswer === undefined ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
      ) {
        return res.status(400).json({
          message: `Question ${
            i + 1
          } has an invalid correct answer. Index must be within options range.`,
        });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      questions,
      createdBy: req.user.userId,
      groupId: groupId || null,
    });

    await quiz.save();
    console.log("Quiz created successfully with ID:", quiz._id);
    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Error creating quiz: " + error.message });
  }
});

app.get("/api/quizzes", authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("createdBy", "username")
      .sort("-createdAt");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quizzes" });
  }
});

app.post("/api/quiz-results", authenticateToken, async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const isCorrect = answer === quiz.questions[index].correctAnswer;
      if (isCorrect) score++;
      return {
        question: index,
        selectedAnswer: answer,
        isCorrect,
      };
    });

    const result = new QuizResult({
      quiz: quizId,
      user: req.user.userId,
      score: (score / quiz.questions.length) * 100,
      answers: gradedAnswers,
    });

    await result.save();

    // Always allow retaking quizzes
    res.status(201).json({
      ...result._doc,
      canRetake: true,
      message:
        "Quiz submitted successfully. You can retake this quiz at any time to improve your score.",
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Error submitting quiz" });
  }
});

// File upload route
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      const content = new Content({
        title: req.body.title,
        description: req.body.description,
        fileUrl,
        uploadedBy: req.user.userId,
        groupId: req.body.groupId,
      });

      await content.save();
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ message: "Error uploading file" });
    }
  }
);

// Leaderboard route
app.get("/api/leaderboard", authenticateToken, async (req, res) => {
  try {
    const results = await QuizResult.aggregate([
      {
        $group: {
          _id: "$user",
          averageScore: { $avg: "$score" },
          quizzesTaken: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          username: "$user.username",
          averageScore: 1,
          quizzesTaken: 1,
        },
      },
      {
        $sort: { averageScore: -1 },
      },
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

// Group routes
app.post("/api/groups", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = new Group({
      name,
      description,
      creator: req.user.userId,
      members: [req.user.userId],
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error creating group" });
  }
});

app.get("/api/groups", authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.userId })
      .populate("members", "username")
      .populate("creator", "username");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups" });
  }
});

// New endpoint for admin to see all groups
app.get("/api/admin/groups", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const groups = await Group.find()
      .populate("members", "username email")
      .populate("creator", "username email");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all groups" });
  }
});

// New endpoint for seeing all available groups
app.get("/api/groups/available", authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("members", "username")
      .populate("creator", "username");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available groups" });
  }
});

// New endpoint for joining a group
app.post("/api/groups/join/:groupId", authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user already a member
    if (group.members.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    // Add user to group members
    group.members.push(req.user.userId);
    await group.save();

    res.json({ message: "Successfully joined group", group });
  } catch (error) {
    res.status(500).json({ message: "Error joining group" });
  }
});

// Message routes
app.post("/api/messages", authenticateToken, async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const message = new Message({
      content,
      sender: req.user.userId,
      groupId,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

app.get("/api/messages/:groupId", authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .populate("sender", "username")
      .sort("createdAt");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Content routes
app.post("/api/content", authenticateToken, async (req, res) => {
  try {
    const { title, description, fileUrl, groupId } = req.body;
    const content = new Content({
      title,
      description,
      fileUrl,
      uploadedBy: req.user.userId,
      groupId,
    });
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: "Error uploading content" });
  }
});

app.get("/api/content", authenticateToken, async (req, res) => {
  try {
    const content = await Content.find()
      .populate("uploadedBy", "username")
      .sort("-createdAt");
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Error fetching content" });
  }
});

// Admin routes - Users management
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Admin routes - System statistics
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const [userCount, groupCount, contentCount, quizCount] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Group.countDocuments(),
      Content.countDocuments(),
      Quiz.countDocuments(),
    ]);

    res.json({
      totalUsers: userCount,
      totalGroups: groupCount,
      totalContent: contentCount,
      totalQuizzes: quizCount,
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({ message: "Error fetching system statistics" });
  }
});

// Admin routes - Settings
app.post("/api/admin/settings", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const { platformName, maxGroupSize, fileUploadLimit } = req.body;

    // In a real application, you would save these settings to a database
    // For simplicity, we'll just return success
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
});

// Notification system
app.post("/api/notifications", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const { title, message, recipients } = req.body;

    // Determine which users should receive the notification
    let userQuery = {};
    if (recipients === "students") {
      userQuery = { role: "student" };
    } else if (recipients === "admins") {
      userQuery = { role: "admin" };
    }

    const targetUsers = await User.find(userQuery).select("_id");
    const userIds = targetUsers.map((user) => user._id);

    // Send the notification to all connected socket users
    // In a real app, you would store notifications in the database
    io.emit("notification", {
      title,
      message,
      timestamp: new Date(),
      sender: req.user.userId,
    });

    res.json({
      success: true,
      message: "Notification sent successfully",
      recipients: userIds.length,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Error sending notification" });
  }
});

// Notification routes
app.get("/api/notifications/user", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/notifications/read/:id", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if the user is the recipient
    if (notification.recipient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/notifications/read-all", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/notifications/send", authenticateToken, async (req, res) => {
  try {
    const { recipients, title, message, type, relatedId, onModel } = req.body;

    // Check if the user is an admin
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    let userIds = [];

    if (recipients === "all") {
      // Send to all users
      const allUsers = await User.find({}).select("_id");
      userIds = allUsers.map((user) => user._id);
    } else if (Array.isArray(recipients)) {
      // Send to specific users
      userIds = recipients;
    } else {
      return res.status(400).json({ message: "Invalid recipients format" });
    }

    // Create notifications for each user
    const notifications = userIds.map((userId) => ({
      recipient: userId,
      title,
      message,
      type: type || "system",
      relatedId,
      onModel,
    }));

    await Notification.insertMany(notifications);

    // Notify online users via socket
    for (const userId of userIds) {
      const userSocketId = userSockets.get(userId.toString());
      if (userSocketId) {
        io.to(userSocketId).emit("notification", {
          title,
          message,
          timestamp: new Date(),
          type: type || "system",
          relatedId,
          onModel,
        });
      }
    }

    res.json({ message: "Notifications sent successfully" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to create notification
const createNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      recipient: userId,
      ...notificationData,
    });

    await notification.save();

    // Notify user via socket if they're online
    const userSocketId = userSockets.get(userId.toString());
    if (userSocketId) {
      io.to(userSocketId).emit("notification", {
        ...notificationData,
        timestamp: new Date(),
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Enhanced Socket.IO implementation
const userSockets = new Map(); // Map of userId to socketId

io.on("connection", (socket) => {
  console.log("New client connected");
  let userId = null;

  // Authenticate user
  socket.on("authenticate", async (token) => {
    try {
      // Verify token and get user info
      const decoded = jwt.verify(token, "your_jwt_secret");
      userId = decoded.userId;

      // Store the mapping of userId to socketId
      userSockets.set(userId, socket.id);

      // Join the user's private room
      socket.join(`user:${userId}`);

      // Send confirmation
      socket.emit("connection_success", {
        userId: decoded.userId,
        username: decoded.username,
      });

      console.log(`User ${userId} authenticated and connected`);
    } catch (error) {
      console.error("Socket authentication error:", error);
      socket.emit("authentication_error", { message: "Invalid token" });
    }
  });

  // Join a room (group chat)
  socket.on("join_room", (roomId) => {
    if (!userId) return;

    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Send a message to a room
  socket.on("send_message", async (messageData) => {
    if (!userId) return;

    try {
      // Save message to database if not already done by the API
      // This is a safeguard to ensure messages are saved even if the API call fails
      const existingMessage = await Message.findOne({
        sender: userId,
        content: messageData.content,
        groupId: messageData.groupId,
        createdAt: { $gte: new Date(Date.now() - 5000) }, // Messages created in the last 5 seconds
      });

      if (!existingMessage) {
        const message = new Message({
          content: messageData.content,
          sender: userId,
          groupId: messageData.groupId,
        });
        await message.save();
      }

      // Broadcast to all clients in the room
      socket.to(messageData.room).emit("receive_message", {
        ...messageData,
        sender: userId,
        _id: existingMessage?._id || message._id,
        createdAt: existingMessage?.createdAt || new Date(),
      });

      // Create notifications for group members except the sender
      const group = await Group.findById(messageData.groupId);
      if (group) {
        const user = await User.findById(userId);
        for (const memberId of group.members) {
          if (memberId.toString() !== userId) {
            // Create notification for this member
            await createNotification(memberId, {
              title: "New message",
              message: `${user.username} sent a message in ${group.name}`,
              type: "message",
              relatedId: group._id,
              onModel: "Group",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // User typing indicator
  socket.on("typing", (data) => {
    if (!userId) return;

    socket.to(data.room).emit("user_typing", {
      userId,
      isTyping: data.isTyping,
    });
  });

  // Mark notification as read
  socket.on("read_notification", async (notificationId) => {
    if (!userId) return;

    try {
      const notification = await Notification.findById(notificationId);
      if (notification && notification.recipient.toString() === userId) {
        notification.read = true;
        await notification.save();
      }
    } catch (error) {
      console.error("Socket error marking notification as read:", error);
    }
  });

  // Direct message to a specific user
  socket.on("direct_message", async (data) => {
    if (!userId) return;

    const { recipientId, message } = data;

    // Get the socket ID of the recipient
    const recipientSocketId = userSockets.get(recipientId);

    // Send the message if the recipient is online
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("direct_message", {
        senderId: userId,
        message,
        timestamp: new Date(),
      });
    }

    // Create a notification for the recipient
    try {
      const sender = await User.findById(userId);
      await createNotification(recipientId, {
        title: "New Direct Message",
        message: `${sender.username} sent you a message: "${message.substring(
          0,
          50
        )}${message.length > 50 ? "..." : ""}"`,
        type: "message",
        relatedId: sender._id,
        onModel: "User",
      });
    } catch (error) {
      console.error("Error creating direct message notification:", error);
    }
  });

  // Update user status
  socket.on("update_status", (status) => {
    if (!userId) return;

    // Broadcast to all relevant rooms or users
    socket.broadcast.emit("user_status_change", {
      userId,
      status,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (userId) {
      // Remove from the map
      userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
    console.log("Client disconnected");
  });
});

// Admin user management
app.post("/api/users/disable/:userId", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Instead of deleting, we set an 'isDisabled' flag
    user.isDisabled = true;
    await user.save();

    res.json({ message: "User account disabled successfully" });
  } catch (error) {
    console.error("Error disabling user:", error);
    res.status(500).json({ message: "Error disabling user account" });
  }
});

// Direct messaging between users
app.post("/api/messages/direct", authenticateToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Create a direct message
    const message = new Message({
      content,
      sender: req.user.userId,
      recipient: recipientId,
      isDirect: true,
    });

    await message.save();

    // Create a notification for the recipient
    await createNotification(recipientId, {
      title: "New Direct Message",
      message: `You received a direct message: "${content.substring(0, 50)}${
        content.length > 50 ? "..." : ""
      }"`,
      type: "message",
      relatedId: req.user.userId,
      onModel: "User",
    });

    // Notify via socket if recipient is online
    const recipientSocketId = userSockets.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("direct_message", {
        content,
        sender: req.user.userId,
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: "Direct message sent successfully" });
  } catch (error) {
    console.error("Error sending direct message:", error);
    res.status(500).json({ message: "Error sending direct message" });
  }
});

// Get user profile
app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin routes - Remove a user completely
app.delete("/api/users/:userId", authenticateToken, async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove related data
    await Promise.all([
      // Remove user's messages
      Message.deleteMany({ sender: req.params.userId }),
      // Remove user's quiz results
      QuizResult.deleteMany({ user: req.params.userId }),
      // Remove user's notifications
      Notification.deleteMany({ recipient: req.params.userId }),
      // Remove user from groups (alternatively, you could transfer ownership)
      Group.updateMany(
        { members: req.params.userId },
        { $pull: { members: req.params.userId } }
      ),
      // If user is a creator of groups, you might want to handle that too
      // This is just a simple approach - delete groups created by user
      Group.deleteMany({ creator: req.params.userId }),
    ]);

    // Finally, remove the user
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: "User account and related data completely removed" });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ message: "Error removing user account" });
  }
});

// New endpoint for admin to delete a group
app.delete(
  "/api/admin/groups/:groupId",
  authenticateToken,
  async (req, res) => {
    try {
      // Check if the requester is admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Forbidden: Admin access required" });
      }

      const group = await Group.findById(req.params.groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Delete any messages associated with the group
      await Message.deleteMany({ groupId: req.params.groupId });

      // Delete any content associated with the group
      await Content.deleteMany({ groupId: req.params.groupId });

      // Delete the group
      await Group.findByIdAndDelete(req.params.groupId);

      res.json({
        message: "Group and all associated data successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Error deleting group" });
    }
  }
);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
