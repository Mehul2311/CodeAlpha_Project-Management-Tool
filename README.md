# KaamBoard

A collaborative project management tool built for small teams, college groups and startups. Create projects, invite your teammates, track work on a Kanban board, assign tasks and talk about them right inside the task card. Everything updates live, so nobody has to keep refreshing the page.

Built as part of my internship (Task 3: Project Management Tool).

> Add a screenshot or a short GIF of the board here, e.g. `![KaamBoard board view](./docs/board.png)`

---

## What it does

- **Auth**: sign up, log in, log out, protected routes, JWT stored in an httpOnly cookie
- **Group projects**: create a project, invite members by email, Owner and Member roles
- **Boards**: Kanban columns (To Do, In Progress, In Review, Done) that you can add, rename and delete
- **Drag and drop**: move cards across columns, and the order is saved in the database
- **Task cards**: title, description, assignee, due date, priority, labels and a checklist
- **Assign tasks**: give a task to any project member, and see everything assigned to you on the "My Tasks" page
- **Comments**: discuss inside each task, and edit or delete your own comments
- **Real-time updates**: card moves, assignments and comments show up instantly for everyone on the board (Socket.IO)
- **Notifications**: bell icon with an unread count, a dropdown list and mark-as-read
- **Animations**: page transitions, staggered cards, drag effects, modal springs, skeleton loaders and more (Framer Motion)
- **Responsive**: works on phones, tablets and desktops, with light and dark mode
- **Indian context**: amounts in ₹ with Indian number formatting, DD/MM/YYYY dates and IST time

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React (Vite), React Router, Framer Motion, @dnd-kit, Axios |
| Styling | CSS Modules (or Tailwind) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO (WebSockets) |
| Validation | Zod |

---

## Folder structure

```
kaamboard/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── context/
│       ├── services/
│       └── utils/
├── server/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── sockets/
│   └── seed.js
├── .env.example
└── README.md
```

---

## Getting started

### What you need

- Node.js 18 or above
- MongoDB (local install or a free MongoDB Atlas cluster)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Mehul2311/kaamboard.git
cd kaamboard
```

### 2. Set up the environment variables

Copy the example file inside the `server` folder and fill in your values.

```bash
cd server
cp ../.env.example .env
```

Your `.env` should look something like this:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/kaamboard
JWT_SECRET=put_a_long_random_string_here
CLIENT_URL=http://localhost:5173
```

### 3. Install and run the backend

```bash
cd server
npm install
npm run dev
```

The API starts on `http://localhost:5000`.

### 4. Install and run the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

### 5. (Optional) Add demo data

To fill the app with sample projects, tasks and users:

```bash
cd server
npm run seed
```

Demo login after seeding:

```
Email:    aarav@example.com
Password: demo1234
```

---

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/projects` | List my projects |
| POST | `/api/projects` | Create a project |
| POST | `/api/projects/:id/invite` | Invite a member |
| GET | `/api/projects/:id/tasks` | Get all tasks of a project |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update or move a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/:id/comments` | Get comments of a task |
| POST | `/api/tasks/:id/comments` | Add a comment |
| GET | `/api/notifications` | Get my notifications |
| PATCH | `/api/notifications/:id/read` | Mark a notification as read |

Update this table if your routes are named differently.

---

## Real-time events

| Event | When it fires |
| --- | --- |
| `task:moved` | A card is dragged to another column or position |
| `task:assigned` | A task is assigned to someone |
| `comment:added` | A new comment is posted |
| `notification:new` | A new notification reaches a user |

Each user joins a room for the project they are viewing, so updates only reach the right people.

---

## Scripts

| Command | Where | What it does |
| --- | --- | --- |
| `npm run dev` | client / server | Start in development mode |
| `npm run build` | client | Create a production build |
| `npm run seed` | server | Load demo data |

---

## Things I want to add later

- File attachments on tasks
- Email reminders for due dates
- Activity log per project
- Calendar view

---

## Troubleshooting

- **MongoDB connection error**: check that MongoDB is running and `MONGO_URI` is correct.
- **CORS error in the browser**: make sure `CLIENT_URL` in `.env` matches the URL where the frontend runs.
- **Real-time updates not working**: confirm the backend is running and the Socket.IO client points to the correct server URL.

---

## Author

**Mehul Sharma**
GitHub: https://github.com/Mehul2311
---

## License

This project is made for learning and internship purposes. You can use the MIT License if you want to open-source it.
