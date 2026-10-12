# KaamBoard 🇮🇳

A full-stack collaborative sprint and project management tool designed for small teams, student groups, and startups in India. Inspired by Trello and Asana, but built to be lightweight, real-time, and localized for the Indian startup ecosystem.

---

## Highlights

- **Real-Time Kanban Sync**: Drag cards between custom columns with immediate live updates across connected teammates powered by WebSockets (Socket.IO).
- **Indian Financial & Date Localization**: Native ₹ (INR) budget tracking formatted in the Indian numbering system (`₹1,50,000`, `₹12,00,000`), `DD/MM/YYYY` deadline dates, and IST relative timestamps ("2 hours ago", "yesterday").
- **Auth & Protected Roles**: JWT in `httpOnly` cookies with bcrypt password hashing, session persistence, and role-based permissions (Project Owner vs Member).
- **Task Drawers & Checklists**: Rich task details drawer with animated checklist progress bars, priorities (Low/Medium/High), labels, and threaded discussions.
- **My Tasks Queue**: Dedicated personal queue with status tabs (To Do, In Progress, In Review, Done) and priority filtering.
- **Live Notifications & Presence**: Notification bell with unread badge counter, shake animation, and active board presence indicators.
- **Instant 1-Click Demo Logins**: Test multi-user collaboration and notifications immediately between Indian seed profiles (Aarav, Priya, Rohan, Sneha).

---

## Tech Stack

- **Frontend**: React 19 + Vite, React Router 7, Tailwind CSS v4, Motion (Framer Motion), `@dnd-kit`
- **Backend**: Node.js + Express.js REST API
- **Real-Time**: Socket.IO
- **Auth**: JWT (stored in httpOnly cookie) + Bcrypt.js
- **Database**: Embedded JSON/In-memory persistent engine with Mongoose compatibility and zero setup requirements
- **Validation & Network**: Zod, Axios

---

## Folder Structure

```
├── client (src/)
│   ├── assets/images/      # Generated high-fidelity visual assets
│   ├── components/
│   │   ├── board/          # KanbanBoard, KanbanColumn, TaskCard, TaskDrawer, CommentsSection
│   │   ├── layout/         # Navbar (Top Bar Contract), Sidebar
│   │   └── modals/         # NewProjectModal, InviteMemberModal, ConfirmDialog
│   ├── context/            # AuthContext, ThemeContext, ToastContext
│   ├── pages/              # LandingPage, DashboardPage, ProjectBoardPage, MyTasksPage, ProfilePage, LoginPage, SignupPage
│   ├── services/           # Axios client instance, Socket.IO client helper
│   ├── types/              # Core TypeScript interfaces (User, Project, Task, Comment, etc.)
│   └── utils/              # formatINR, formatDateIST, timeAgo, avatar helpers
├── server/
│   ├── controllers/        # auth, project, task, comment, notification controllers
│   ├── middleware/         # authMiddleware, requireProjectMember, requireProjectOwner
│   ├── routes/             # Express API routes
│   ├── sockets/            # Socket.IO room and presence broadcast handlers
│   ├── data/               # Persistent database JSON store
│   ├── db.ts               # Embedded Mongoose-compatible database engine with auto-persistence
│   └── seed.ts             # Demo data seed script
├── server.ts               # Express entry point with Vite middleware on port 3000
└── vite.config.ts          # Vite configuration
```

---

## Getting Started Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Demo Seed Data (Optional)
The server seeds itself automatically on first launch, but you can explicitly re-seed demo data at any time:
```bash
npx tsx server/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts

All seed users share the password: `kaam1234` (or use the 1-click login buttons on the login screen):

1. **Aarav Mehta** (`aarav.mehta@mumbai-tech.in`) — Founder & Tech Lead
2. **Priya Nair** (`priya.nair@bengaluru-devs.in`) — Senior Full Stack Engineer
3. **Rohan Verma** (`rohan.verma@delhi-design.in`) — Lead UI/UX Designer
4. **Ananya Iyer** (`ananya.iyer@chennai-coders.in`) — Backend Architect
5. **Kabir Singh** (`kabir.singh@pune-ventures.in`) — DevOps & Infra Lead
6. **Sneha Reddy** (`sneha.reddy@hyderabad-ai.in`) — Product Manager
