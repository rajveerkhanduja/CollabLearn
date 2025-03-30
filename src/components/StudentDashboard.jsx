import React, { useState, useEffect, useRef } from "react";
import {
  Book,
  Users,
  MessageSquare,
  Trophy,
  LogOut,
  Upload,
  PenTool,
  Home,
  Activity,
  Clock,
  FileText,
  User,
  Bell,
  Search,
  Image,
  Camera,
} from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { useDropzone } from "react-dropzone";
import { API_URL, SOCKET_URL } from "../config.js";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentGroup, setCurrentGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const profileImageRef = useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        try {
          await handleFileUpload(acceptedFiles[0]);
        } catch (error) {
          console.error("Error in file upload:", error);
        }
      }
    },
  });

  useEffect(() => {
    // Connect to socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Set up socket event listeners
    newSocket.on("connect", () => {
      console.log("Connected to socket server");

      // Authenticate with the token
      const token = localStorage.getItem("token");
      if (token) {
        newSocket.emit("authenticate", token);
        console.log("Socket authentication sent");
      }
    });

    newSocket.on("connection_success", (data) => {
      console.log("Socket authentication successful", data);
    });

    newSocket.on("notification", (data) => {
      console.log("Received notification:", data);
      // Add to notifications and mark as unread
      setNotifications((prev) => [data, ...prev]);

      // Add to recent activities
      addActivity("notification", data.message);
    });

    newSocket.on("receive_message", (data) => {
      console.log("Received message:", data);
      if (currentGroup && data.room === currentGroup._id) {
        setMessages((prev) => {
          // Check if we already have this message (by _id)
          if (data._id && prev.some((msg) => msg._id === data._id)) {
            return prev;
          }
          return [...prev, data];
        });
      }
    });

    newSocket.on("user_typing", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...prev, data.userId]);
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    // Listen for direct messages
    newSocket.on("direct_message", (data) => {
      console.log("Received direct message:", data);
      // You could add this to a direct message state or show a notification
      addActivity("message", `You received a direct message`);
    });

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const [
          groupsRes,
          materialsRes,
          quizzesRes,
          leaderboardRes,
          notificationsRes,
          availableGroupsRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/groups`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${API_URL}/content`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${API_URL}/quizzes`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${API_URL}/leaderboard`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios
            .get(`${API_URL}/notifications/user`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
            .catch((err) => ({ data: [] })), // Fallback if the endpoint isn't implemented yet
          axios.get(`${API_URL}/groups/available`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setGroups(groupsRes.data);
        setJoinedGroups(groupsRes.data);
        setStudyMaterials(materialsRes.data);
        setQuizzes(quizzesRes.data);
        setLeaderboard(leaderboardRes.data);
        setNotifications(notificationsRes.data);
        setAvailableGroups(availableGroupsRes.data);

        // Fetch user profile if not already set
        if (!userProfile) {
          try {
            const profileRes = await axios.get(`${API_URL}/users/profile`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            setUserProfile(profileRes.data);
          } catch (err) {
            console.error("Error fetching user profile:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
    return () => newSocket.close();
  }, []);

  // Effect to handle room joining when current group changes
  useEffect(() => {
    if (socket && currentGroup) {
      console.log("Joining room:", currentGroup._id);

      // Join the new room (group chat)
      socket.emit("join_room", currentGroup._id);

      // Fetch messages for this group
      const fetchGroupMessages = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/messages/${currentGroup._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("Fetched messages:", response.data);
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching group messages:", error);
        }
      };

      fetchGroupMessages();
    }
  }, [socket, currentGroup]);

  // Function to fetch all available groups
  const fetchAvailableGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups/available`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAvailableGroups(response.data);
    } catch (error) {
      console.error("Error fetching available groups:", error);
    }
  };

  // Function to join a group
  const handleJoinGroup = async (groupId) => {
    try {
      const response = await axios.post(
        `${API_URL}/groups/join/${groupId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update both lists
      const joinedGroup = response.data.group;
      setJoinedGroups([...joinedGroups, joinedGroup]);

      // Refresh available groups
      fetchAvailableGroups();

      // Add to recent activities
      addActivity("group", `You joined the group "${joinedGroup.name}"`);

      alert("Successfully joined the group!");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join the group. Please try again.");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/groups`,
        {
          name: newGroupName,
          description: newGroupDescription,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setGroups([...groups, response.data]);
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentGroup) {
      const messageData = {
        content: newMessage,
        groupId: currentGroup._id,
        room: currentGroup._id,
      };

      try {
        const response = await axios.post(`${API_URL}/messages`, messageData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Add the message locally for immediate UI update
        const messageWithSender = {
          ...response.data,
          sender: { _id: localStorage.getItem("userId") || "me" },
        };
        setMessages((prev) => [...prev, messageWithSender]);

        // Send to other users via socket
        socket.emit("send_message", messageData);

        // Add to recent activities
        addActivity("message", `You sent a message in ${currentGroup.name}`);

        // Clear input
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizAnswers(new Array(quiz.questions.length).fill(null));
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/quiz-results`,
        {
          quizId: currentQuiz._id,
          answers: quizAnswers,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Add to recent activities with score
      const score = response.data.score.toFixed(0);
      addActivity(
        "quiz",
        `You completed "${currentQuiz.title}" quiz with a score of ${score}%`
      );

      // Store current quiz for possible retake
      const completedQuiz = { ...currentQuiz };
      setCurrentQuiz(null);
      setQuizAnswers([]);

      // Refresh leaderboard
      const leaderboardRes = await axios.get(`${API_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeaderboard(leaderboardRes.data);

      // Always show retake option with modern UI dialog
      setShowScoreModal(true);
      setQuizResult({
        score: score,
        title: completedQuiz.title,
        quiz: completedQuiz,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("There was an error submitting your quiz. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const fetchStudyMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/content`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStudyMaterials(response.data);
    } catch (error) {
      console.error("Error fetching study materials:", error);
    }
  };

  const handleMessageTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && socket && currentGroup) {
      setIsTyping(true);
      socket.emit("typing", { room: currentGroup._id, isTyping: true });
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      if (socket && currentGroup) {
        setIsTyping(false);
        socket.emit("typing", { room: currentGroup._id, isTyping: false });
      }
    }, 2000);

    setTypingTimeout(timeout);
  };

  // Notification handling functions
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.post(
        `${API_URL}/notifications/read/${notificationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Also notify the server via socket
      if (socket) {
        socket.emit("read_notification", notificationId);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to add an activity to the recent activities list
  const addActivity = (type, description, timestamp = new Date()) => {
    const newActivity = {
      type,
      description,
      time: timestamp.toLocaleString(),
      timestamp, // Store the original date object for sorting
    };

    setRecentActivities((prev) => {
      // Add the new activity and sort by timestamp, most recent first
      const updated = [newActivity, ...prev].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      // Limit to 20 most recent activities
      return updated.slice(0, 20);
    });
  };

  // Enhanced file upload with activity tracking
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", uploadTitle);
    formData.append("description", uploadDescription);
    if (currentGroup) {
      formData.append("groupId", currentGroup._id);
    }

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Add to recent activities
      addActivity("material", `You uploaded "${uploadTitle}" study material`);

      // Update the materials list
      await fetchStudyMaterials();

      // Reset form
      setUploadTitle("");
      setUploadDescription("");

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  // Function to handle notification click and open the appropriate tab
  const handleNotificationClick = (notification) => {
    // Mark the notification as read
    markNotificationRead(notification._id);

    // Parse the notification to determine which tab to open
    // This is a simple example - your actual implementation might be more sophisticated
    const lowerCaseMsg = notification.message.toLowerCase();

    if (lowerCaseMsg.includes("quiz") || lowerCaseMsg.includes("test")) {
      setActiveTab("quiz");
    } else if (
      lowerCaseMsg.includes("group") ||
      lowerCaseMsg.includes("team")
    ) {
      setActiveTab("groups");
    } else if (
      lowerCaseMsg.includes("material") ||
      lowerCaseMsg.includes("content") ||
      lowerCaseMsg.includes("document")
    ) {
      setActiveTab("study");
    } else if (
      lowerCaseMsg.includes("message") ||
      lowerCaseMsg.includes("chat")
    ) {
      setActiveTab("chat");
    }
  };

  // UI for notifications dropdown
  const NotificationsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="relative">
          <Bell className="h-6 w-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
            <div className="p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={notification._id || index}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 text-center border-t">
              <button
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={() => {
                  // Mark all as read
                  notifications.forEach((n) => {
                    if (!n.read) markNotificationRead(n._id);
                  });
                }}
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add a function to handle profile image upload
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Max file size of 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploadingImage(true);

    try {
      const response = await axios.post(
        `${API_URL}/users/upload-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfileImage(response.data.imageUrl);

      // Update user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          profileImage: response.data.imageUrl,
        });
      }

      addActivity("profile", "You updated your profile picture");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert(
        "Failed to upload profile image: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Add to useEffect to set profile image from user profile
  useEffect(() => {
    if (userProfile && userProfile.profileImage) {
      setProfileImage(userProfile.profileImage);
    }
  }, [userProfile]);

  // Generate a color based on username for default avatar
  const generateAvatarColor = (username) => {
    if (!username) return "bg-indigo-500";

    // Generate a consistent color based on the username
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];

    let sum = 0;
    for (let i = 0; i < username.length; i++) {
      sum += username.charCodeAt(i);
    }

    return colors[sum % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Book className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">
                  Learning Platform
                </span>
              </div>
            </div>
            <div className="hidden md:flex md:items-center">
              <div className="ml-10 flex items-center space-x-4">
                {NotificationsDropdown()}
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-200 bg-indigo-700 bg-opacity-50 px-3 py-1 rounded-md flex items-center transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2 bg-white p-2 rounded-lg shadow">
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
              activeTab === "study"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("study")}
          >
            <Book className="h-5 w-5 mr-2" />
            Study Material
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
              activeTab === "groups"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            <Users className="h-5 w-5 mr-2" />
            Groups
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Chat
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("quiz")}
          >
            <PenTool className="h-5 w-5 mr-2" />
            Quizzes
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-5 w-5 mr-2" />
            Profile
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              {profileImage ? (
                <div className="h-24 w-24 rounded-full overflow-hidden">
                  <img
                    src={
                      profileImage.startsWith("http")
                        ? profileImage
                        : `${API_URL}/${profileImage}`
                    }
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${
                        userProfile?.username || "User"
                      }&background=random&color=fff&size=100`;
                    }}
                  />
                </div>
              ) : (
                <div
                  className={`h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-bold ${generateAvatarColor(
                    userProfile?.username
                  )}`}
                >
                  {userProfile?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full cursor-pointer shadow-md"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  className="hidden"
                  ref={profileImageRef}
                  onChange={handleProfileImageUpload}
                  disabled={uploadingImage}
                />
              </label>

              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900">
                {userProfile?.username || "Student"}
              </h3>
              <p className="text-gray-600">{userProfile?.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            {activeTab === "dashboard" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Student Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Recent activity */}
                  <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-full mr-2">
                            <Activity className="h-5 w-5" />
                          </span>
                          Your Recent Activity
                        </h3>

                        {recentActivities.length > 0 ? (
                          recentActivities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                            >
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  activity.type === "message"
                                    ? "bg-blue-100 text-blue-600"
                                    : activity.type === "quiz"
                                    ? "bg-amber-100 text-amber-600"
                                    : activity.type === "notification"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {activity.type === "message" ? (
                                  <MessageSquare className="h-4 w-4" />
                                ) : activity.type === "quiz" ? (
                                  <PenTool className="h-4 w-4" />
                                ) : activity.type === "material" ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Users className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {activity.time}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 text-gray-500">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>No recent activity</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-indigo-600" />
                          Your Performance
                        </h3>
                      </div>

                      <div>
                        <div className="mb-6">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              Quiz Average Score
                            </span>
                            <span className="text-sm font-medium">
                              {leaderboard
                                .find(
                                  (entry) =>
                                    entry.username ===
                                    (userProfile?.username || "")
                                )
                                ?.averageScore.toFixed(1) || "0"}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  leaderboard.find(
                                    (entry) =>
                                      entry.username ===
                                      (userProfile?.username || "")
                                  )?.averageScore || 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              Quizzes Completed
                            </span>
                            <span className="text-sm font-medium">
                              {Math.min(
                                leaderboard.find(
                                  (entry) =>
                                    entry.username ===
                                    (userProfile?.username || "")
                                )?.quizzesTaken || 0,
                                quizzes.length
                              )}
                              /{quizzes.length}
                            </span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  Math.min(
                                    (leaderboard.find(
                                      (entry) =>
                                        entry.username ===
                                        (userProfile?.username || "")
                                    )?.quizzesTaken || 0,
                                    quizzes.length) / (quizzes.length || 1)
                                  ) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-medium mb-3">
                            Leaderboard Position
                          </h4>
                          <div className="flex items-center justify-center bg-white/60 rounded-lg p-6">
                            <div className="text-center">
                              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                                #
                                {leaderboard.findIndex(
                                  (entry) =>
                                    entry.username ===
                                    (userProfile?.username || "")
                                ) + 1 || "-"}
                              </div>
                              <p className="text-gray-500">
                                of {leaderboard.length} students
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-indigo-600" />
                        My Groups
                      </h3>

                      {joinedGroups.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">
                          <p className="mb-3">You're not in any groups yet</p>
                          <button
                            onClick={() => setActiveTab("groups")}
                            className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
                          >
                            Browse Groups
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {joinedGroups.slice(0, 3).map((group) => (
                            <div
                              key={group._id}
                              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                              onClick={() => {
                                setCurrentGroup(group);
                                setActiveTab("chat");
                              }}
                            >
                              <h4 className="font-medium">{group.name}</h4>
                              <p className="text-xs text-gray-500">
                                {group.members.length} members
                              </p>
                            </div>
                          ))}
                          {joinedGroups.length > 3 && (
                            <button
                              onClick={() => setActiveTab("groups")}
                              className="text-sm text-indigo-600 hover:text-indigo-800 block w-full text-center mt-2"
                            >
                              View all groups
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "study" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Study Materials</h2>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Upload New Material
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows="3"
                      />
                    </div>
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-600">
                        Drag 'n' drop a file here, or click to select a file
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyMaterials.map((material) => (
                    <div key={material._id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{material.title}</h3>
                      <p className="text-gray-600">{material.description}</p>
                      <a
                        href={material.fileUrl}
                        className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download Material
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "groups" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Study Groups</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Create New Group
                    </h3>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Group Name
                        </label>
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={newGroupDescription}
                          onChange={(e) =>
                            setNewGroupDescription(e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          rows="3"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Create Group
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-2">
                        Your Groups
                      </h3>
                      <div className="space-y-4">
                        {joinedGroups.length > 0 ? (
                          joinedGroups.map((group) => (
                            <div
                              key={group._id}
                              className="border rounded-lg p-4 hover:border-indigo-500 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md"
                              onClick={() => {
                                setCurrentGroup(group);
                                setActiveTab("chat");
                              }}
                            >
                              <h4 className="font-semibold">{group.name}</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {group.description}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-gray-500">
                                  {group.members.length} members
                                </p>
                                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                  Member
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                              You haven't joined any groups yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-700 border-b pb-2">
                        Available Groups
                      </h3>
                      <div className="space-y-4">
                        {availableGroups
                          .filter(
                            (group) =>
                              !joinedGroups.some(
                                (joined) => joined._id === group._id
                              )
                          )
                          .map((group) => (
                            <div
                              key={group._id}
                              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all"
                            >
                              <h4 className="font-semibold">{group.name}</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {group.description}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-gray-500">
                                  Created by {group.creator.username}
                                </p>
                                <button
                                  onClick={() => handleJoinGroup(group._id)}
                                  className="bg-green-100 hover:bg-green-200 text-green-800 text-xs px-3 py-1 rounded-full"
                                >
                                  Join Group
                                </button>
                              </div>
                            </div>
                          ))}

                        {availableGroups.filter(
                          (group) =>
                            !joinedGroups.some(
                              (joined) => joined._id === group._id
                            )
                        ).length === 0 && (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                              No other groups available to join
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "chat" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Chat Room {currentGroup ? `- ${currentGroup.name}` : ""}
                </h2>
                {currentGroup ? (
                  <div className="h-[600px] flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-2 space-y-4 p-4 border rounded-lg bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">
                            No messages yet. Be the first to send a message!
                          </p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.sender?._id ===
                                localStorage.getItem("userId") ||
                              message.sender ===
                                localStorage.getItem("userId") ||
                              message.sender === "me"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                                message.sender?._id ===
                                  localStorage.getItem("userId") ||
                                message.sender ===
                                  localStorage.getItem("userId") ||
                                message.sender === "me"
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white border"
                              }`}
                            >
                              <div className="text-xs mb-1">
                                {message.sender?.username || "User"}
                              </div>
                              {message.content}
                              <div className="text-xs mt-1 text-right opacity-70">
                                {new Date(
                                  message.createdAt || Date.now()
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {typingUsers.length > 0 && (
                      <div className="h-6 px-4 mb-2 text-xs text-gray-500 italic">
                        {typingUsers.length === 1
                          ? `${typingUsers[0].username} is typing...`
                          : `${typingUsers.length} people are typing...`}
                      </div>
                    )}

                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-4"
                    >
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleMessageTyping}
                        className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Type your message..."
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-gray-50">
                    <MessageSquare className="h-16 w-16 text-indigo-400 mb-4" />
                    <p className="text-gray-600 mb-4 text-center">
                      Select a group from the Groups tab to start chatting
                    </p>
                    <button
                      onClick={() => setActiveTab("groups")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Go to Groups
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === "quiz" && (
              <div>
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Interactive Quizzes
                </h2>
                {currentQuiz ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
                    <h3 className="text-2xl font-semibold mb-2">
                      {currentQuiz.title}
                    </h3>
                    <p className="text-gray-600 mb-8">
                      {currentQuiz.description}
                    </p>

                    {currentQuiz.questions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="mb-8 bg-indigo-50/50 rounded-lg p-6 border border-indigo-100"
                      >
                        <p className="font-medium text-lg mb-4">
                          {questionIndex + 1}. {question.question}
                        </p>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                quizAnswers[questionIndex] === optionIndex
                                  ? "bg-indigo-100 border border-indigo-300"
                                  : "bg-white border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${questionIndex}`}
                                value={optionIndex}
                                checked={
                                  quizAnswers[questionIndex] === optionIndex
                                }
                                onChange={() => {
                                  const newAnswers = [...quizAnswers];
                                  newAnswers[questionIndex] = optionIndex;
                                  setQuizAnswers(newAnswers);
                                }}
                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                              />
                              <span className="ml-3">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => setCurrentQuiz(null)}
                        className="mr-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitQuiz}
                        className="py-2 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition-all"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <PenTool className="h-6 w-6" />
                          </div>

                          <h3 className="font-semibold text-xl mb-2">
                            {quiz.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {quiz.description}
                          </p>
                          <div className="flex justify-between text-sm text-gray-500 mb-6">
                            <span>{quiz.questions.length} questions</span>
                            <span>
                              By {quiz.createdBy?.username || "Admin"}
                            </span>
                          </div>

                          <button
                            onClick={() => handleStartQuiz(quiz)}
                            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow hover:shadow-md transition-all"
                          >
                            Start Quiz
                          </button>
                        </div>
                      </div>
                    ))}

                    {quizzes.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PenTool className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">
                          No Quizzes Available
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          There are no quizzes available at the moment. Please
                          check back later as new quizzes are added regularly.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                        {userProfile?.username?.charAt(0) || "U"}
                      </div>
                      <h3 className="text-xl font-semibold">
                        {userProfile?.username}
                      </h3>
                      <p className="text-gray-600">{userProfile?.email}</p>
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                        {userProfile?.role || "Student"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">
                      Learning Stats
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-indigo-800 mb-1">
                          Groups Joined
                        </h4>
                        <p className="text-2xl font-bold text-indigo-900">
                          {joinedGroups.length}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-1">
                          Quizzes Completed
                        </h4>
                        <p className="text-2xl font-bold text-green-900">
                          {leaderboard.find(
                            (item) => item._id === userProfile?._id
                          )?.quizzesTaken || 0}
                        </p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-amber-800 mb-1">
                          Average Score
                        </h4>
                        <p className="text-2xl font-bold text-amber-900">
                          {(
                            leaderboard.find(
                              (item) => item._id === userProfile?._id
                            )?.averageScore || 0
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Account Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            Account created
                          </p>
                          <p className="font-medium">
                            {userProfile?.createdAt
                              ? new Date(
                                  userProfile.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account type</p>
                          <p className="font-medium">
                            {userProfile?.role === "admin"
                              ? "Administrator"
                              : "Student"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showScoreModal && quizResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-500 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Completed!
              </h3>
              <p className="text-gray-500 mb-1">You scored</p>
              <p className="text-4xl font-bold text-indigo-600 mb-4">
                {quizResult.score}%
              </p>
              <p className="text-gray-600 mb-6">on "{quizResult.title}"</p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowScoreModal(false);
                    handleStartQuiz(quizResult.quiz);
                  }}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
