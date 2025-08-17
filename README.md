# Project Collaboration Tool

A full-stack web application for team project management with real-time updates, task tracking, and email notifications.

## Features

- **User Authentication** - JWT-based login/signup with role-based access
- **Team Management** - Create teams, add members, manage projects
- **Project Management** - Create projects within teams, track progress
- **Task Management** - Kanban-style task board with status updates
- **Real-time Updates** - Live notifications using Socket.io
- **Email Notifications** - Automated emails for task assignments and updates
- **Activity Logging** - Complete audit trail of all actions
- **Role-based Access** - Admin, Project Manager, and Team Member roles

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Passport.js for authentication (JWT + Local strategies)
- Socket.io for real-time communication
- Nodemailer for email notifications

### Frontend
- React.js with React Router
- Axios for API calls
- Socket.io-client for real-time updates
- Responsive CSS design

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Gmail account for email notifications (or other SMTP service)

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   - Install and start MongoDB
   - Database will be created automatically

3. **Environment Configuration:**
   Update the `.env` file with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/collaboration_tool
   
   # JWT
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=7d
   
   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

### Running Both Servers

From the root directory, you can run both servers simultaneously:
```bash
npm run dev:full
```

## Usage

### Getting Started

1. **Register an Account:**
   - Visit `http://localhost:3000`
   - Click "Register" and create an account
   - Choose your role: Admin, Project Manager, or Team Member

2. **Create a Team:**
   - Only Admins and Project Managers can create teams
   - Go to Teams page and click "Create Team"
   - Add team members by selecting from the user list

3. **Create a Project:**
   - Navigate to Projects page
   - Click "Create Project" and select a team
   - Projects are automatically linked to the selected team

4. **Manage Tasks:**
   - Open a project to see the Kanban board
   - Create tasks and assign them to team members
   - Drag tasks between columns or update status from "My Tasks" page
   - Assigned users receive email notifications

### User Roles

- **Admin:** Full access to all features
- **Project Manager:** Can create teams, projects, and manage tasks
- **Team Member:** Can view assigned tasks and update their status

### Real-time Features

- Task status updates appear instantly across all connected users
- New task assignments trigger immediate notifications
- Activity timeline shows all project changes in real-time

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (for team management)

### Teams
- `POST /api/teams` - Create new team
- `GET /api/teams` - Get user's teams
- `GET /api/teams/:id` - Get team details

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details

### Tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/my-tasks` - Get user's assigned tasks
- `GET /api/tasks/activity/:projectId` - Get project activity logs

## Database Schema

### Users
- id (UUID, Primary Key)
- name (String)
- email (String, Unique)
- password (String, Hashed)
- role (Enum: admin, project_manager, team_member)

### Teams
- id (UUID, Primary Key)
- name (String)
- description (Text)
- createdBy (UUID, Foreign Key to Users)

### Projects
- id (UUID, Primary Key)
- name (String)
- description (Text)
- status (Enum: active, completed, on_hold)
- teamId (UUID, Foreign Key to Teams)

### Tasks
- id (UUID, Primary Key)
- title (String)
- description (Text)
- status (Enum: todo, in_progress, completed)
- priority (Enum: low, medium, high)
- dueDate (Date)
- projectId (UUID, Foreign Key to Projects)

### Activity Logs
- id (UUID, Primary Key)
- action (String)
- entityType (Enum: task, project, team, user)
- entityId (UUID)
- details (JSON)
- userId (UUID, Foreign Key to Users)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.