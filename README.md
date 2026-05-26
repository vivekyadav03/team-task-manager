# ⚡ TaskFlow — Team Task Manager

A production-ready full-stack team task management application with role-based access control, real-time dashboards, and smart priority detection.

---

## 🚀 Live Demo

| Layer | URL |
|-------|-----|
| **Frontend** | `https://your-app.vercel.app` *(deploy to get URL)* |
| **Backend API** | `https://your-api.railway.app` *(deploy to get URL)* |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@taskflow.com | admin123 |
| **Member** | member@taskflow.com | member123 |

> ⚠️ Create these accounts after deploying using the Signup page.

---

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** — Signup, Login, Protected Routes, Logout
- 👥 **Role-Based Access Control** — Admin & Member roles with different permissions
- 📁 **Project Management** — Create, edit, delete, view projects with team members
- ✅ **Task Management** — Create, assign, update, and delete tasks
- 📊 **Dashboard** — Stats cards, bar charts, pie charts, progress indicators
- 🔍 **Search & Filter** — Filter tasks by status, priority, or keyword
- ⏰ **Overdue Detection** — Red highlights and warnings for overdue tasks
- 📝 **Activity Log** — Every task change is tracked with a timestamp
- 🧠 **Smart Priority** — AI-like keyword detection suggests High priority

### Admin Permissions
- ✅ Create, edit, delete projects
- ✅ Add/manage team members
- ✅ Create, assign, delete tasks
- ✅ View all tasks and projects
- ✅ Access full team analytics

### Member Permissions
- ✅ View projects they belong to
- ✅ View tasks assigned to them
- ✅ Update task status

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS, React Router DOM, Axios |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Notifications** | React Hot Toast |
| **Deployment** | Railway (backend) + Vercel (frontend) |

---

## 📁 Project Structure

```
team-task-manager/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI components
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   └── layout/         # Layout components
│   │   │       ├── Sidebar.jsx
│   │   │       └── Header.jsx
│   │   ├── pages/              # All page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectFormPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TaskFormPage.jsx
│   │   │   ├── TaskDetailPage.jsx
│   │   │   ├── TeamPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── context/            # React Context (Auth)
│   │   ├── services/           # Axios API calls
│   │   ├── routes/             # Route protection components
│   │   ├── layouts/            # Page layouts
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Root component with routes
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
└── server/                     # Express backend
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   ├── projectController.js
    │   └── taskController.js
    ├── middleware/
    │   ├── auth.js             # JWT protect + authorize
    │   └── errorHandler.js     # Global error handler
    ├── models/
    │   ├── User.js
    │   ├── Project.js
    │   └── Task.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── projectRoutes.js
    │   └── taskRoutes.js
    ├── utils/
    │   └── generateToken.js
    ├── server.js               # Entry point
    └── railway.toml            # Railway deployment config
```

---

## ⚙️ Local Setup Guide

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier works)
- Git installed

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username + password)
4. Under "Network Access", add `0.0.0.0/0` (allow all IPs)
5. Click "Connect" → "Connect your application" → copy the connection string
6. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Step 3: Set Up Backend

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_random_string_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 4: Set Up Frontend

```bash
# In a new terminal
cd client

# Install dependencies
npm install

# Create environment file (optional for development — Vite proxy handles API calls)
cp .env.example .env
# Leave VITE_API_URL empty for local dev (Vite proxy forwards /api to localhost:5000)
```

Start the frontend:
```bash
npm run dev
# App runs on http://localhost:5173
```

### Step 5: Create Demo Accounts

Open the app at `http://localhost:5173/signup` and create:

1. **Admin account** — email: `admin@taskflow.com`, password: `admin123`, role: `Admin`
2. **Member account** — email: `member@taskflow.com`, password: `member123`, role: `Member`

---

## 🌐 Deployment

### Backend → Railway

1. Create a [Railway](https://railway.app) account
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo → set root directory to `server`
4. Add environment variables in Railway dashboard:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<your long random secret>
   CLIENT_URL=https://your-app.vercel.app
   ```
5. Railway auto-deploys. Copy the generated URL (e.g. `https://your-api.railway.app`)

### Frontend → Vercel

1. Create a [Vercel](https://vercel.com) account
2. Click **New Project** → import your GitHub repo
3. Set **Root Directory** to `client`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-api.railway.app/api
   ```
5. Click **Deploy**

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    Register new user
POST   /api/auth/login       Login user
GET    /api/auth/profile     Get current user profile  [Protected]
PUT    /api/auth/profile     Update profile            [Protected]
GET    /api/auth/users       Get all users             [Admin only]
```

### Projects
```
GET    /api/projects         Get all projects (filtered by role)  [Protected]
POST   /api/projects         Create project                       [Admin only]
GET    /api/projects/:id     Get project by ID                    [Protected]
PUT    /api/projects/:id     Update project                       [Admin only]
DELETE /api/projects/:id     Delete project + all tasks           [Admin only]
POST   /api/projects/:id/members  Add members to project          [Admin only]
```

### Tasks
```
GET    /api/tasks                     Get tasks (filtered by role)   [Protected]
POST   /api/tasks                     Create task                    [Admin only]
GET    /api/tasks/dashboard/stats     Get dashboard statistics       [Protected]
GET    /api/tasks/:id                 Get task by ID                 [Protected]
PUT    /api/tasks/:id                 Update task                    [Protected]
DELETE /api/tasks/:id                 Delete task                    [Admin only]
```

### Query Parameters for GET /api/tasks
```
?status=Todo|In Progress|Completed
?priority=Low|Medium|High
?project=<projectId>
?search=<keyword>
?assignedTo=<userId>   (admin only)
```

---

## 🧪 API Testing Examples (using curl)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Admin","email":"admin@test.com","password":"admin123","role":"admin"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
# Copy the "token" from response
```

### Create Project (with token)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title":"My Project","description":"Test project","color":"#6366f1"}'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title":"Fix critical bug","priority":"High","project":"<PROJECT_ID>","status":"Todo"}'
```

---

## 🔒 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret (keep long & random) | `abc123xyz...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`client/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.railway.app/api` |

---

## 🧠 Smart Priority Detection

When creating a task, if the title or description contains any of these keywords:
`urgent`, `critical`, `production`, `emergency`, `asap`, `blocker`

The app automatically suggests setting priority to **High** via a banner alert. The user can click "Set High" to apply it, or ignore the suggestion.

---

## 📸 Screenshots

> Add screenshots here after deployment:
## Dashboard

![Dashboard](./Screenshots/dashboard.png)

## Projects

![Projects](./Screenshots/project-list.png)

## Tasks

![Tasks](./Screenshots/tasks-list.png)

## Create Task

![Create Task](./Screenshots/create-task-form.png)

## Team Members

![Team Members](./Screenshots/team-members.png)

## 🐙 GitHub Commands

### First time push
```bash
# Initialize git in the project root
git init
git add .
git commit -m "Initial commit: Complete TaskFlow application"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/team-task-manager.git
git branch -M main
git push -u origin main
```

### Subsequent pushes
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 🙋 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MongoDB connection failed` | Check your `MONGODB_URI` and whitelist your IP in Atlas |
| `CORS error` | Make sure `CLIENT_URL` in backend `.env` matches frontend URL |
| `JWT invalid` | Clear localStorage in browser and log in again |
| `Vercel 404 on refresh` | Make sure `vercel.json` exists in `client/` folder |
| `Railway deploy fails` | Set root directory to `server` in Railway settings |

---

## 👨‍💻 Author

Vivek Yadav

---

## 📄 License

Vivek Yadav