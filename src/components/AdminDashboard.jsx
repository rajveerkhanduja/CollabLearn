import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Bell,
  Settings,
  LogOut,
  PlusCircle,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Home,
  PenTool,
  Upload,
  File,
  Trash2,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../config.js";

// Add this function before the function component
const generateAvatarColor = (username) => {
  if (!username) return "bg-gray-400";

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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    recipients: "all",
  });
  const [systemSettings, setSystemSettings] = useState({
    platformName: "Collaborative Learning Platform",
    maxGroupSize: 10,
    fileUploadLimit: 10,
  });
  const [expandedUsers, setExpandedUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalContent: 0,
    totalQuizzes: 0,
  });
  const [notificationSent, setNotificationSent] = useState(false);
  const [groups, setGroups] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
    groupId: "",
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletionConfirmInput, setDeletionConfirmInput] = useState("");
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetailModalVisible, setGroupDetailModalVisible] = useState(false);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadDetails, setUploadDetails] = useState({
    title: "",
    description: "",
    groupId: "",
  });

  const navItems = [
    { name: "Dashboard", icon: Home, id: "dashboard" },
    { name: "Students", icon: Users, id: "students" },
    { name: "Groups", icon: Users, id: "groups" },
    { name: "Quizzes", icon: FileText, id: "quizzes" },
    { name: "Notifications", icon: Bell, id: "notifications" },
    { name: "Settings", icon: Settings, id: "settings" },
  ];

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
    fetchSystemStats();
    fetchGroups();
    fetchQuizzes();
    fetchStudyMaterials();
  }, []);

  // Fix the activeTab issue - ensure "users" tab shows students content
  useEffect(() => {
    // If activeTab is "users", map it to "students" for backward compatibility
    if (activeTab === "users") {
      setActiveTab("students");
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStudents(response.data.filter((user) => user.role === "student"));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`${API_URL}/quizzes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
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

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!notification.title || !notification.message) {
      alert("Please provide both title and message for the notification");
      return;
    }

    try {
      // Use our new notification endpoint
      await axios.post(
        `${API_URL}/notifications/send`,
        {
          recipients: notification.recipients,
          title: notification.title,
          message: notification.message,
          type: "system",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Reset form
      setNotification({ title: "", message: "", recipients: "all" });
      setNotificationSent(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setNotificationSent(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending notification:", error);
      alert(
        `Failed to send notification: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleToggleUserDetails = (userId) => {
    setExpandedUsers({
      ...expandedUsers,
      [userId]: !expandedUsers[userId],
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/settings`, systemSettings, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: 0 },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions.splice(index, 1);
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    if (field === "option") {
      const [optionIndex, optionValue] = value;
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else if (field === "correctAnswer") {
      updatedQuestions[index].correctAnswer = parseInt(value);
    } else {
      updatedQuestions[index][field] = value;
    }
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    // Validate quiz data
    if (!newQuiz.title.trim()) {
      alert("Quiz title is required");
      return;
    }

    if (
      newQuiz.questions.some(
        (q) => !q.question.trim() || q.options.some((opt) => !opt.trim())
      )
    ) {
      alert("All questions and options must be filled out");
      return;
    }

    try {
      console.log("Submitting quiz:", JSON.stringify(newQuiz));

      const response = await axios.post(`${API_URL}/quizzes`, newQuiz, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Quiz creation response:", response.data);

      // Reset form and refresh quizzes
      setNewQuiz({
        title: "",
        description: "",
        questions: [
          { question: "", options: ["", "", "", ""], correctAnswer: 0 },
        ],
        groupId: "",
      });
      fetchQuizzes();

      alert("Quiz created successfully!");
    } catch (error) {
      console.error(
        "Error creating quiz:",
        error.response?.data || error.message
      );
      alert(
        `Failed to create quiz: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/users/disable/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // Refresh user list
      fetchUsers();
      alert("User account disabled successfully");
    } catch (error) {
      console.error("Error disabling user:", error);
      alert("Failed to disable user account");
    }
  };

  const handleSendDirectMessage = async (userId, message) => {
    try {
      await axios.post(
        `${API_URL}/messages/direct`,
        {
          recipientId: userId,
          content: message,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const handleRemoveUser = async (userId, username) => {
    // Show a more serious confirmation dialog
    const confirmDelete = window.confirm(
      `⚠️ WARNING: You are about to PERMANENTLY DELETE ${username}'s account and ALL associated data including messages, quizzes, and group memberships. This action CANNOT be undone. Are you absolutely sure?`
    );

    if (!confirmDelete) {
      return;
    }

    // Double-check with a custom modal
    setDeleteModalVisible(true);
    setUserToDelete({
      id: userId,
      username: username,
    });
  };

  const executeUserDeletion = async () => {
    if (
      !userToDelete ||
      !deletionConfirmInput ||
      deletionConfirmInput !== userToDelete.username
    ) {
      alert("Username did not match. User deletion cancelled.");
      resetDeletionState();
      return;
    }

    try {
      setDeletionInProgress(true);

      await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Refresh user list and stats
      fetchUsers();
      fetchSystemStats();

      // Reset state
      resetDeletionState();

      // Show success message
      setDeletionSuccess(true);
      setTimeout(() => setDeletionSuccess(false), 3000);
    } catch (error) {
      console.error("Error removing user:", error);
      alert(
        `Failed to remove user: ${
          error.response?.data?.message || error.message
        }`
      );
      resetDeletionState();
    }
  };

  const resetDeletionState = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
    setDeletionConfirmInput("");
    setDeletionInProgress(false);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to delete this group? This action cannot be undone."
        )
      ) {
        return;
      }

      await axios.delete(`${API_URL}/admin/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Refresh groups after deletion
      fetchGroups();
      alert("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group");
    }
  };

  // Function to view group details
  const handleViewGroupDetails = (group) => {
    setSelectedGroup(group);
    setGroupDetailModalVisible(true);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.length) {
      alert("Please select a file to upload");
      return;
    }

    if (!uploadDetails.title.trim()) {
      alert("Please provide a title for the document");
      return;
    }

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", uploadDetails.title);
    formData.append("description", uploadDetails.description);

    if (uploadDetails.groupId) {
      formData.append("groupId", uploadDetails.groupId);
    }

    setUploadingFile(true);

    try {
      await axios.post(`${API_URL}/content/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setUploadDetails({
        title: "",
        description: "",
        groupId: "",
      });
      fileInputRef.current.value = "";

      // Refresh materials list
      fetchStudyMaterials();
      fetchSystemStats();

      alert("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(
        `Failed to upload file: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setUploadingFile(false);
    }
  };

  // Update the handleDeleteDocument function to fix document deletion
  const handleDeleteDocument = async (documentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Updated endpoint to match the backend API structure
      await axios.delete(`${API_URL}/content/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Refresh the document list
      fetchStudyMaterials();
      fetchSystemStats();

      alert("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert(
        "Failed to delete document: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-indigo-600 to-indigo-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Settings className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">
                  Admin Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-white hover:text-gray-200 bg-indigo-800 px-4 py-2 rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2 bg-white p-2 rounded-lg shadow">
          {navItems.map((item) => (
          <button
              key={item.id}
            className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                activeTab === item.id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white hover:bg-gray-100"
            }`}
              onClick={() => setActiveTab(item.id)}
          >
              <item.icon className="h-5 w-5 mr-2" />
              {item.name}
          </button>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Admin Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="relative overflow-hidden bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
                  <div className="absolute right-0 top-0 w-32 h-32 opacity-10 transform translate-x-6 -translate-y-6 group-hover:opacity-20 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full text-indigo-600"
                    >
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                    </svg>
                  </div>
                  <div className="mb-4">
                    <div className="bg-indigo-100 text-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalUsers}
                  </h3>
                  <p className="text-gray-600">Total Students</p>
          <button
                    onClick={() => setActiveTab("students")}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center group-hover:underline"
                  >
                    View Details
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
          </button>
                </div>

                <div className="relative overflow-hidden bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
                  <div className="absolute right-0 top-0 w-32 h-32 opacity-10 transform translate-x-6 -translate-y-6 group-hover:opacity-20 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full text-purple-600"
                    >
                      <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
                    </svg>
                  </div>
                  <div className="mb-4">
                    <div className="bg-purple-100 text-purple-600 h-12 w-12 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalGroups}
                  </h3>
                  <p className="text-gray-600">Study Groups</p>
          <button
            onClick={() => setActiveTab("groups")}
                    className="mt-4 text-sm text-purple-600 hover:text-purple-800 flex items-center group-hover:underline"
                  >
                    View Details
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
          </button>
                </div>

                <div className="relative overflow-hidden bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
                  <div className="absolute right-0 top-0 w-32 h-32 opacity-10 transform translate-x-6 -translate-y-6 group-hover:opacity-20 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full text-amber-600"
                    >
                      <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                      <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                      <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
                    </svg>
                  </div>
                  <div className="mb-4">
                    <div className="bg-amber-100 text-amber-600 h-12 w-12 rounded-lg flex items-center justify-center">
                      <PenTool className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalQuizzes}
                  </h3>
                  <p className="text-gray-600">Active Quizzes</p>
          <button
            onClick={() => setActiveTab("quizzes")}
                    className="mt-4 text-sm text-amber-600 hover:text-amber-800 flex items-center group-hover:underline"
                  >
                    View Details
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
          </button>
                </div>

                <div className="relative overflow-hidden bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
                  <div className="absolute right-0 top-0 w-32 h-32 opacity-10 transform translate-x-6 -translate-y-6 group-hover:opacity-20 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full text-green-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
                        clipRule="evenodd"
                      />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  </div>
                  <div className="mb-4">
                    <div className="bg-green-100 text-green-600 h-12 w-12 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalContent}
                  </h3>
                  <p className="text-gray-600">Learning Resources</p>
          <button
            onClick={() => setActiveTab("content")}
                    className="mt-4 text-sm text-green-600 hover:text-green-800 flex items-center group-hover:underline"
                  >
                    View Details
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
          </button>
                </div>
        </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Platform Activity
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="relative h-80">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Mock chart visualization */}
                        <div className="w-full max-w-md">
                          <div className="flex items-end justify-between h-40 mb-2">
                            <div className="w-1/7 bg-indigo-600 rounded-t h-20"></div>
                            <div className="w-1/7 bg-indigo-600 rounded-t h-32"></div>
                            <div className="w-1/7 bg-indigo-600 rounded-t h-24"></div>
                            <div className="w-1/7 bg-indigo-600 rounded-t h-36"></div>
                            <div className="w-1/7 bg-indigo-600 rounded-t h-20"></div>
                            <div className="w-1/7 bg-indigo-600 rounded-t h-28"></div>
                            <div className="w-1/7 bg-indigo-600 rounded-t h-16"></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                            <div>Sun</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <PenTool className="h-4 w-4" />
                        </div>
                    <div>
                          <p className="text-sm text-gray-800">
                            New quiz{" "}
                            <span className="font-semibold">
                              "Advanced Mathematics"
                            </span>{" "}
                            created
                          </p>
                          <p className="text-xs text-gray-500">
                            Today, 10:30 AM
                          </p>
                    </div>
                  </div>
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4" />
                </div>
                    <div>
                          <p className="text-sm text-gray-800">
                            New user{" "}
                            <span className="font-semibold">Alex Johnson</span>{" "}
                            registered
                          </p>
                          <p className="text-xs text-gray-500">
                            Yesterday, 3:45 PM
                          </p>
                    </div>
                  </div>
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4" />
                </div>
                    <div>
                          <p className="text-sm text-gray-800">
                            New group{" "}
                            <span className="font-semibold">
                              "Physics Study Group"
                            </span>{" "}
                            created
                          </p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                </div>
                    <div>
                          <p className="text-sm text-gray-800">
                            New study material{" "}
                            <span className="font-semibold">
                              "Chemistry Notes"
                            </span>{" "}
                            uploaded
                          </p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Student Management
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Registered Students</h3>
                  <div className="relative">
                  <input
                    type="text"
                      placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading students...</p>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                        className="border rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div
                          className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => handleToggleUserDetails(student._id)}
                      >
                        <div className="flex items-center">
                            {student.profileImage ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <img
                                  src={`${API_URL}/${student.profileImage}`}
                                  alt={student.username}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${
                                      student.username || "User"
                                    }&background=random&color=fff&size=100`;
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${generateAvatarColor(
                                  student.username
                                )}`}
                              >
                            {student.username.charAt(0).toUpperCase()}
                          </div>
                            )}
                          <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900">
                              {student.username}
                            </h3>
                            <p className="text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        <div>
                          {expandedUsers[student._id] ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedUsers[student._id] && (
                        <div className="p-4 bg-white border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                User Details
                              </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium text-gray-500 mr-2">
                                      Role:
                                    </span>
                                    <span className="font-medium text-indigo-600">
                                  {student.role}
                                </span>
                              </p>
                              <p>
                                    <span className="font-medium text-gray-500 mr-2">
                                      Joined:
                                    </span>
                                    <span>
                                  {new Date(
                                    student.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </p>
                                  <p>
                                    <span className="font-medium text-gray-500 mr-2">
                                      Status:
                                    </span>
                                    <span
                                      className={
                                        student.isDisabled
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }
                                    >
                                      {student.isDisabled
                                        ? "Disabled"
                                        : "Active"}
                                    </span>
                                  </p>
                                </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Actions
                              </h4>
                                <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => {
                                    const message = window.prompt(
                                      "Enter message to send to " +
                                        student.username
                                    );
                                    if (message)
                                      handleSendDirectMessage(
                                        student._id,
                                        message
                                      );
                                  }}
                                    className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm"
                                >
                                  Message
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                          `Are you sure you want to ${
                                            student.isDisabled
                                              ? "enable"
                                              : "disable"
                                          } ${student.username}'s account?`
                                      )
                                    ) {
                                      handleDisableUser(student._id);
                                    }
                                  }}
                                    className={`px-3 py-1 ${
                                      student.isDisabled
                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                                    } text-white rounded-lg shadow-sm`}
                                  >
                                    {student.isDisabled
                                      ? "Enable Account"
                                      : "Disable Account"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveUser(
                                      student._id,
                                      student.username
                                    )
                                  }
                                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-sm flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No students found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No students match your search criteria"
                      : "No students have registered yet"}
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Notifications</h2>

              <form onSubmit={handleSendNotification} className="max-w-2xl">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Recipients</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={notification.recipients}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        recipients: e.target.value,
                      })
                    }
                  >
                    <option value="all">All Students</option>
                    <option value="selected">Selected Students</option>
                  </select>
                </div>

                {notification.recipients === "selected" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Select Students
                    </label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                      {students.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center mb-2"
                        >
                          <input
                            type="checkbox"
                            id={`student-${student._id}`}
                            className="mr-2"
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setNotification((prev) => {
                                const selectedIds = Array.isArray(
                                  prev.recipients
                                )
                                  ? [...prev.recipients]
                                  : [];

                                if (isChecked) {
                                  // Add to selected
                                  return {
                                    ...prev,
                                    recipients: [...selectedIds, student._id],
                                  };
                                } else {
                                  // Remove from selected
                                  return {
                                    ...prev,
                                    recipients: selectedIds.filter(
                                      (id) => id !== student._id
                                    ),
                                  };
                                }
                              });
                            }}
                          />
                          <label htmlFor={`student-${student._id}`}>
                            {student.username} ({student.email})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={notification.type || "system"}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="system">System</option>
                    <option value="message">Message</option>
                    <option value="content">Content</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Notification Title"
                    value={notification.title}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Message</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 h-32"
                    placeholder="Notification Message"
                    value={notification.message}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        message: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Notification
                </button>

                {notificationSent && (
                  <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-lg">
                    Notification sent successfully!
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === "content" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Content Management
              </h2>

              <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Upload New Document
                </h3>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Title
                      </label>
                      <input
                        type="text"
                        value={uploadDetails.title}
                        onChange={(e) =>
                          setUploadDetails({
                            ...uploadDetails,
                            title: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter document title"
                        required
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Group (Optional)
                      </label>
                      <select
                        value={uploadDetails.groupId}
                        onChange={(e) =>
                          setUploadDetails({
                            ...uploadDetails,
                            groupId: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">All Students</option>
                        {groups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                  </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={uploadDetails.description}
                      onChange={(e) =>
                        setUploadDetails({
                          ...uploadDetails,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows="2"
                      placeholder="Enter document description"
                    />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              ref={fileInputRef}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, Word, PowerPoint, and image files up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingFile}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {uploadingFile ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      "Upload Document"
                    )}
                  </button>
                </form>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Content Library</h3>

                {studyMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studyMaterials.map((material) => {
                      // Determine file type icon and color
                      let FileIcon = File;
                      let iconColorClass = "text-blue-600";
                      let bgColorClass = "bg-blue-100";

                      const fileType = material.fileUrl
                        ?.split(".")
                        .pop()
                        ?.toLowerCase();

                      if (
                        ["jpg", "jpeg", "png", "gif", "svg"].includes(fileType)
                      ) {
                        FileIcon = ImageIcon;
                        iconColorClass = "text-purple-600";
                        bgColorClass = "bg-purple-100";
                      } else if (["pdf"].includes(fileType)) {
                        FileIcon = FileText;
                        iconColorClass = "text-red-600";
                        bgColorClass = "bg-red-100";
                      } else if (["doc", "docx"].includes(fileType)) {
                        FileIcon = FileText;
                        iconColorClass = "text-blue-600";
                        bgColorClass = "bg-blue-100";
                      } else if (["ppt", "pptx"].includes(fileType)) {
                        FileIcon = FileText;
                        iconColorClass = "text-amber-600";
                        bgColorClass = "bg-amber-100";
                      }

                      return (
                        <div
                          key={material._id}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                          <div className="p-6">
                            <div
                              className={`w-12 h-12 ${bgColorClass} ${iconColorClass} rounded-full flex items-center justify-center mb-4`}
                            >
                              <FileIcon className="h-6 w-6" />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {material.title}
                            </h4>
                            {material.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {material.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              <span>
                                By {material.uploadedBy?.username || "Admin"}
                              </span>
                              <span>
                                {new Date(
                                  material.createdAt
                                ).toLocaleDateString()}
                              </span>
                          </div>

                            <div className="flex space-x-2">
                              <a
                                href={`${API_URL}/${material.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center py-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                View
                              </a>
                              <button
                                onClick={() =>
                                  handleDeleteDocument(material._id)
                                }
                                className="py-2 px-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No documents available
                    </h3>
                    <p className="text-gray-500">
                      Upload your first document using the form above
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">System Settings</h2>
              <form className="space-y-6" onSubmit={handleSaveSettings}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={systemSettings.platformName}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        platformName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Group Size
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={systemSettings.maxGroupSize}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxGroupSize: parseInt(e.target.value),
                      })
                    }
                    min="2"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File Upload Limit (MB)
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={systemSettings.fileUploadLimit}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        fileUploadLimit: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Enable Chat Features
                  </label>
                  <div className="mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        checked={true}
                        readOnly
                      />
                      <span className="ml-2">Enabled</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {activeTab === "quizzes" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Quiz Management</h2>

              <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Create New Quiz</h3>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quiz Title
                      </label>
                      <input
                        type="text"
                        value={newQuiz.title}
                        onChange={(e) =>
                          setNewQuiz({ ...newQuiz, title: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Target Group (Optional)
                      </label>
                      <select
                        value={newQuiz.groupId}
                        onChange={(e) =>
                          setNewQuiz({ ...newQuiz, groupId: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">All Students</option>
                        {groups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={newQuiz.description}
                      onChange={(e) =>
                        setNewQuiz({ ...newQuiz, description: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows="2"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Questions</h4>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        Add Question
                      </button>
                    </div>

                    {newQuiz.questions.map((question, qIndex) => (
                      <div
                        key={qIndex}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">Question {qIndex + 1}</h5>
                          {newQuiz.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="mb-3">
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "question",
                                e.target.value
                              )
                            }
                            placeholder="Enter question text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Options:
                          </p>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-answer-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() =>
                                  handleQuestionChange(
                                    qIndex,
                                    "correctAnswer",
                                    oIndex
                                  )
                                }
                                className="mr-2"
                                required
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  handleQuestionChange(qIndex, "option", [
                                    oIndex,
                                    e.target.value,
                                  ])
                                }
                                placeholder={`Option ${oIndex + 1}`}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Quiz
                  </button>
                </form>
              </div>

              <h3 className="text-lg font-semibold mb-3">Existing Quizzes</h3>
              {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <h4 className="font-semibold">{quiz.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {quiz.description}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{quiz.questions.length} questions</span>
                        <span>
                          {quiz.groupId
                            ? "For specific group"
                            : "For all students"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No quizzes available yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "groups" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Group Management
              </h2>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    All Study Groups
                  </h3>

                    {groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groups.map((group) => (
                        <div
                          key={group._id}
                          className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
                        >
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                            <h4 className="font-semibold text-lg text-gray-900">
                            {group.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {group.description || "No description"}
                            </p>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-gray-500">
                                {group.members?.length || 0} members
                              </span>
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {new Date(group.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewGroupDetails(group)}
                                className="flex-1 text-sm py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group._id)}
                                className="text-sm py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No groups created yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = e.target.groupName.value;
                    const description = e.target.groupDescription.value;

                    if (!name.trim()) {
                      alert("Group name is required");
                      return;
                    }

                    // Create group
                    axios
                      .post(
                        `${API_URL}/groups`,
                        { name, description },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      )
                      .then(() => {
                        // Reset form and refresh groups
                        e.target.reset();
                        fetchGroups();
                        alert("Group created successfully");
                      })
                      .catch((error) => {
                        console.error("Error creating group:", error);
                        alert("Failed to create group");
                      });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="groupName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Group Name
                    </label>
                    <input
                      type="text"
                      id="groupName"
                      name="groupName"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="groupDescription"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="groupDescription"
                      name="groupDescription"
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Group
                  </button>
                </form>
              </div>
            </div>
          )}
              </div>
            </div>

      {deleteModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm User Deletion
              </h3>
              <p className="text-gray-500 mb-6">
                This will permanently delete{" "}
                <span className="font-bold text-red-600">
                  {userToDelete?.username}
                </span>{" "}
                and ALL their data. To confirm, please type the username below:
              </p>

              <input
                type="text"
                value={deletionConfirmInput}
                onChange={(e) => setDeletionConfirmInput(e.target.value)}
                disabled={deletionInProgress}
                placeholder={`Type "${userToDelete?.username}" to confirm`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-4 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />

              <div className="flex space-x-4">
                <button
                  onClick={resetDeletionState}
                  disabled={deletionInProgress}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={executeUserDeletion}
                  disabled={
                    deletionInProgress ||
                    deletionConfirmInput !== userToDelete?.username
                  }
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    deletionConfirmInput === userToDelete?.username
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      : "bg-red-300 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {deletionInProgress ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
        </div>
      </div>
          </div>
        </div>
      )}

      {deletionSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          User successfully deleted!
        </div>
      )}

      {groupDetailModalVisible && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedGroup.name}
              </h3>
              <button
                onClick={() => setGroupDetailModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                {selectedGroup.description || "No description provided"}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <p>
                  Created:{" "}
                  {new Date(selectedGroup.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Created by: {selectedGroup.creator?.username || "Unknown"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-2">
                Members ({selectedGroup.members?.length || 0})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedGroup.members?.map((member) => (
                  <div
                    key={member._id || member}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    {typeof member === "object" && member.profileImage ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <img
                          src={`${API_URL}/${member.profileImage}`}
                          alt={member.username}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${
                              member.username || "User"
                            }&background=random&color=fff&size=100`;
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold mr-3 text-white ${
                          typeof member === "object"
                            ? generateAvatarColor(member.username)
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {typeof member === "object"
                          ? member.username?.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {typeof member === "object" ? member.username : member}
                      </p>
                      {typeof member === "object" && member.email && (
                        <p className="text-xs text-gray-500">{member.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setGroupDetailModalVisible(false);
                  if (
                    window.confirm(
                      `Are you sure you want to delete group "${selectedGroup.name}"? This cannot be undone.`
                    )
                  ) {
                    handleDeleteGroup(selectedGroup._id);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete Group
              </button>
              <button
                onClick={() => setGroupDetailModalVisible(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
