# CollabLearn - Collaborative Learning Platform

A feature-rich web-based platform for collaborative learning and knowledge sharing built with the MERN stack (MongoDB, Express.js, React, Node.js) with real-time capabilities.

![CollabLearn Platform](https://your-screenshot-url-here.png)

## 🌟 Key Features

### For Students

- **Personalized Profiles** - Custom profiles with photo uploads
- **Interactive Dashboard** - Progress tracking and activity feed
- **Study Groups** - Join, create, and manage collaborative learning groups
- **Real-time Chat** - Instant messaging with typing indicators and notifications
- **Study Materials** - Access, upload and download educational resources
- **Interactive Quizzes** - Take quizzes with instant feedback
- **Leaderboard System** - Gamification with rankings based on quiz performance
- **Notifications** - Real-time system and user-to-user notifications
- **Mobile-Responsive Design** - Seamless experience across devices

### For Administrators

- **Comprehensive Dashboard** - System overview with analytics
- **User Management** - Add, edit, disable, or remove student accounts
- **Group Administration** - Create, monitor, and manage study groups
- **Content Management** - Upload, organize, and delete learning materials
- **Quiz Creation** - Design custom quizzes with multiple-choice questions
- **Notification System** - Send targeted or global announcements
- **System Settings** - Configure platform parameters

## 💻 Technology Stack

- **Frontend**: React.js with modern Hooks and Context API
- **UI Framework**: Tailwind CSS with responsive design
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io
- **Authentication**: JWT with secure password hashing
- **File Storage**: Multer for file uploads with validation
- **State Management**: React Context API

## 📊 Advanced Features

- **Real-time Collaboration** - Instant updates and communication
- **Image Upload and Processing** - Profile pictures and content images
- **Document Management** - Upload, categorize, and share learning materials
- **Responsive UI/UX** - Tailwind CSS with modern design principles
- **Role-Based Access Control** - Different capabilities for students and admins
- **Intelligent Search** - Find users, groups, and content easily
- **Activity Tracking** - Monitor student engagement and progress
- **Interactive Quizzes** - Multiple choice questions with automatic scoring
- **User Interactions** - Direct messaging, group chat, and collaborative learning
- **Progress Visualization** - Visual indicators of learning progress

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SurajMandal14/CollabLearn.git
   cd CollabLearn
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/collab-learn
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the development server:

   ```bash
   # Run backend and frontend concurrently
   npm run dev

   # Or separately
   npm run server # Backend only
   npm run client # Frontend only
   ```

## 📂 Project Structure

```
CollabLearn/
├── server/              # Backend code
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # Uploaded files storage
│   └── server.js        # Main server file
├── src/                 # Frontend code
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   ├── config.js        # Configuration
│   └── App.js           # Main React component
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user (admin)
- `POST /api/users/disable/:id` - Disable user account
- `POST /api/users/upload-profile-image` - Upload profile image

### Groups

- `GET /api/groups` - Get user's groups
- `GET /api/groups/available` - Get available groups to join
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/join/:id` - Join a group

### Messages

- `GET /api/messages/:groupId` - Get messages for a group
- `POST /api/messages` - Send a message to group
- `POST /api/messages/direct` - Send direct message to user

### Content

- `GET /api/content` - Get all content
- `POST /api/content/upload` - Upload content
- `GET /api/content/:id` - Get content by ID
- `DELETE /api/content/:id` - Delete content

### Quizzes

- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quiz-results` - Submit quiz results

### Admin

- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/groups` - Admin view of all groups
- `DELETE /api/admin/groups/:id` - Delete group (admin)
- `POST /api/admin/settings` - Update system settings

### Notifications

- `GET /api/notifications/user` - Get user notifications
- `POST /api/notifications/read/:id` - Mark notification as read
- `POST /api/notifications/send` - Send notification (admin)

## 👥 Contributors

- Suraj Mandal - Project Lead & Developer
- Rajveer Singh Khanduja - Head of Frontend 

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Socket.io for real-time communication
- Tailwind CSS for the beautiful UI components
- MongoDB for the flexible database solution
- All the open-source libraries that made this project possible
