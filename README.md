# KaamKaro 🇮🇳

> Milke karo, time pe karo.

KaamKaro is a collaborative project management tool inspired by Trello and Asana. Teams can create group projects, organise work on Kanban boards, assign tasks to members and discuss everything right inside the task cards. Updates show up live for everyone on the board, so nobody has to keep refreshing the page.

I built this as part of my internship, and it covers the full stack: authentication, project boards, task cards, comments and real-time notifications.

## Features

- **Authentication**: signup and login with JWT and bcrypt-hashed passwords, plus protected routes
- **Group projects**: create projects, invite members, and manage roles (Owner / Member)
- **Kanban boards**: customisable columns with drag-and-drop task cards
- **Task management**: priorities, due dates, labels and multiple assignees
- **Comments**: threaded discussion inside each task, with @mentions
- **Real-time updates**: live board changes, comments and notifications using Socket.IO (WebSockets)
- **Notifications**: bell icon with unread count and mark-as-read
- **Smooth animations**: page transitions, card interactions, loaders and a little confetti when a task is done
- **Responsive design**: works on mobile, tablet and desktop, with dark/light mode
- **Desi touch**: Hinglish microcopy, Indian demo data, IST dates and an English / हिन्दी toggle for key labels

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React (Vite), HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO (WebSockets) |

## Getting Started

### Prerequisites
- Node.js (v18 or above)
- MongoDB (local or Atlas)

### Installation

```bash
# clone the repo
git clone https://github.com/Mehul2311/kaamkaro.git
cd kaamkaro

# backend
cd server
npm install
cp .env.example .env   # add your MongoDB URI and JWT secret
npm run dev

# frontend (in a new terminal)
cd client
npm install
npm run dev
```

To load the demo data:

```bash
cd server
npm run seed
```

## Project Structure
