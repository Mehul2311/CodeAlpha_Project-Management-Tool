import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarColor: string;
  phone?: string;
  role?: string;
  createdAt: string;
}

export interface ProjectDoc {
  id: string;
  name: string;
  key: string;
  description: string;
  budget?: number;
  ownerId: string;
  members: { userId: string; role: 'owner' | 'member'; joinedAt: string }[];
  columns: { id: string; title: string; order: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskDoc {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  order: number;
  assigneeId?: string | null;
  dueDate?: string | null;
  labels: string[];
  checklist: { id: string; text: string; completed: boolean }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDoc {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_moved' | 'comment_added' | 'project_invite' | 'general';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserDoc[];
  projects: ProjectDoc[];
  tasks: TaskDoc[];
  comments: CommentDoc[];
  notifications: NotificationDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'kaamboard_db.json');

class DatabaseEngine {
  private data: DatabaseSchema = {
    users: [],
    projects: [],
    tasks: [],
    comments: [],
    notifications: [],
  };
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.seedInitialData();
      }
    } catch {
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // In-memory fallback if disk is read-only
    }
  }

  public seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('kaam1234', salt);
    const now = new Date().toISOString();

    const uAarav: UserDoc = {
      id: 'usr_aarav',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@mumbai-tech.in',
      passwordHash: defaultPasswordHash,
      avatarColor: 'bg-amber-600',
      phone: '+91 98201 45678',
      role: 'Founder & Tech Lead',
      createdAt: now,
    };

    const uPriya: UserDoc = {
      id: 'usr_priya',
      name: 'Priya Nair',
      email: 'priya.nair@bengaluru-devs.in',
      passwordHash: defaultPasswordHash,
      avatarColor: 'bg-emerald-600',
      phone: '+91 98450 12345',
      role: 'Senior Full Stack Engineer',
      createdAt: now,
    };

    const uRohan: UserDoc = {
      id: 'usr_rohan',
      name: 'Rohan Verma',
      email: 'rohan.verma@delhi-design.in',
      passwordHash: defaultPasswordHash,
      avatarColor: 'bg-blue-600',
      phone: '+91 98110 98765',
      role: 'Lead UI/UX Designer',
      createdAt: now,
    };

    const uAnanya: UserDoc = {
      id: 'usr_ananya',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@chennai-coders.in',
      passwordHash: defaultPasswordHash,
      avatarColor: 'bg-indigo-600',
      phone: '+91 98401 54321',
      role: 'Backend Architect',
      createdAt: now,
    };

    const uKabir: UserDoc = {
      id: 'usr_kabir',
      name: 'Kabir Singh',
      email: 'kabir.singh@pune-ventures.in',
      passwordHash: defaultPasswordHash,
      avatarColor: 'bg-rose-600',
      phone: '+91 98220 87654',
      role: 'DevOps & Cloud Lead',
      createdAt: now,
    };

    const uSneha: UserDoc = {
      id: 'usr_sneha',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@hyderabad-ai.in',
      passwordHash: defaultPasswordHash,
      avatarColor: 'bg-teal-600',
      phone: '+91 98490 32109',
      role: 'Product Manager',
      createdAt: now,
    };

    const users = [uAarav, uPriya, uRohan, uAnanya, uKabir, uSneha];

    const defaultColumns = [
      { id: 'col_todo', title: 'To Do', order: 0 },
      { id: 'col_inprog', title: 'In Progress', order: 1 },
      { id: 'col_review', title: 'In Review', order: 2 },
      { id: 'col_done', title: 'Done', order: 3 },
    ];

    // Projects
    const p1: ProjectDoc = {
      id: 'prj_startup_mvp',
      name: 'Startup MVP Launch',
      key: 'MVP26',
      description: 'Building and launching the B2B SaaS MVP for Bangalore accelerator cohort.',
      budget: 1200000, // ₹12,00,000
      ownerId: uAarav.id,
      members: [
        { userId: uAarav.id, role: 'owner', joinedAt: now },
        { userId: uPriya.id, role: 'member', joinedAt: now },
        { userId: uRohan.id, role: 'member', joinedAt: now },
        { userId: uAnanya.id, role: 'member', joinedAt: now },
        { userId: uSneha.id, role: 'member', joinedAt: now },
      ],
      columns: [...defaultColumns],
      createdAt: now,
      updatedAt: now,
    };

    const p2: ProjectDoc = {
      id: 'prj_gst_module',
      name: 'GST Invoice & E-Way Bill Module',
      key: 'GSTINV',
      description: 'Indian tax compliance engine with HSN lookup, GSTR-1 export and NIC portal sync.',
      budget: 320000, // ₹3,20,000
      ownerId: uAarav.id,
      members: [
        { userId: uAarav.id, role: 'owner', joinedAt: now },
        { userId: uAnanya.id, role: 'member', joinedAt: now },
        { userId: uPriya.id, role: 'member', joinedAt: now },
      ],
      columns: [...defaultColumns],
      createdAt: now,
      updatedAt: now,
    };

    const p3: ProjectDoc = {
      id: 'prj_tech_fest',
      name: 'College Tech Fest 2026',
      key: 'CTF26',
      description: 'Annual inter-college hackathon, sponsorships, stage events and portal registration.',
      budget: 180000, // ₹1,80,000
      ownerId: uAarav.id,
      members: [
        { userId: uAarav.id, role: 'owner', joinedAt: now },
        { userId: uRohan.id, role: 'member', joinedAt: now },
        { userId: uKabir.id, role: 'member', joinedAt: now },
      ],
      columns: [...defaultColumns],
      createdAt: now,
      updatedAt: now,
    };

    const p4: ProjectDoc = {
      id: 'prj_diwali_sale',
      name: 'Diwali Sale Campaign 2026',
      key: 'DIWALI',
      description: 'Festive promotion, early bird discounts, UPI cashback integration, and landing banners.',
      budget: 550000, // ₹5,50,000
      ownerId: uSneha.id,
      members: [
        { userId: uSneha.id, role: 'owner', joinedAt: now },
        { userId: uAarav.id, role: 'member', joinedAt: now },
        { userId: uRohan.id, role: 'member', joinedAt: now },
      ],
      columns: [...defaultColumns],
      createdAt: now,
      updatedAt: now,
    };

    const projects = [p1, p2, p3, p4];

    // Tasks for Startup MVP Launch
    const tasks: TaskDoc[] = [
      {
        id: 'tsk_101',
        projectId: p1.id,
        columnId: 'col_todo',
        title: 'Razorpay & UPI Webhook Integration',
        description: 'Implement auto-renewal webhook handlers for Indian UPI QR and credit cards.',
        priority: 'high',
        order: 0,
        assigneeId: uPriya.id,
        dueDate: '2026-10-25',
        labels: ['Payments', 'Backend'],
        checklist: [
          { id: 'chk_1', text: 'Generate test webhook secret in Razorpay dashboard', completed: true },
          { id: 'chk_2', text: 'Verify SHA256 signature in Express middleware', completed: true },
          { id: 'chk_3', text: 'Handle payment.captured and order.paid events', completed: false },
          { id: 'chk_4', text: 'Support instant UPI QR generation on checkout', completed: false },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_102',
        projectId: p1.id,
        columnId: 'col_todo',
        title: 'Design Dark Mode Dashboard UI',
        description: 'Provide high-contrast dark slate palette respecting WCAG AA guidelines.',
        priority: 'medium',
        order: 1,
        assigneeId: uRohan.id,
        dueDate: '2026-10-28',
        labels: ['Design', 'UI/UX'],
        checklist: [
          { id: 'chk_5', text: 'Create Tailwind color tokens for slate-900 surface', completed: true },
          { id: 'chk_6', text: 'Check contrast ratio of amber accents', completed: false },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_103',
        projectId: p1.id,
        columnId: 'col_inprog',
        title: 'Real-time WebSocket Kanban Board Sync',
        description: 'Ensure drag-drop events and card ordering updates reflect across all active browsers without reload.',
        priority: 'high',
        order: 0,
        assigneeId: uAnanya.id,
        dueDate: '2026-10-18',
        labels: ['Realtime', 'WebSockets'],
        checklist: [
          { id: 'chk_7', text: 'Attach Socket.IO to Express HTTP server', completed: true },
          { id: 'chk_8', text: 'Configure room routing by projectId', completed: true },
          { id: 'chk_9', text: 'Broadcast task:moved with optimistic rollback fallback', completed: true },
          { id: 'chk_10', text: 'Add presence indicators for active board viewers', completed: false },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_104',
        projectId: p1.id,
        columnId: 'col_inprog',
        title: 'Customer Feedback Session with Bangalore Beta Cohort',
        description: 'Schedule 4 user interview calls with early stage founders in Koramangala & HSR Layout.',
        priority: 'medium',
        order: 1,
        assigneeId: uSneha.id,
        dueDate: '2026-10-22',
        labels: ['User Research', 'Product'],
        checklist: [
          { id: 'chk_11', text: 'Prepare 10-point question rubric', completed: true },
          { id: 'chk_12', text: 'Record session notes and task pain-points', completed: false },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_105',
        projectId: p1.id,
        columnId: 'col_review',
        title: 'Auth System with httpOnly JWT & Bcrypt',
        description: 'Verify token expiration, remember me toggle, and secure cookie credentials transport.',
        priority: 'high',
        order: 0,
        assigneeId: uPriya.id,
        dueDate: '2026-10-15',
        labels: ['Security', 'Auth'],
        checklist: [
          { id: 'chk_13', text: 'Bcrypt salt rounds set to 10', completed: true },
          { id: 'chk_14', text: 'httpOnly cookie flag configured', completed: true },
          { id: 'chk_15', text: 'Protected route redirection tested', completed: true },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_106',
        projectId: p1.id,
        columnId: 'col_done',
        title: 'Setup Domain & Cloud Infrastructure',
        description: 'Configure DNS, SSL certificates, environment secrets, and CI build pipeline.',
        priority: 'medium',
        order: 0,
        assigneeId: uKabir.id,
        dueDate: '2026-10-10',
        labels: ['DevOps', 'Infra'],
        checklist: [
          { id: 'chk_16', text: 'Node.js 22 LTS container configured', completed: true },
          { id: 'chk_17', text: 'Port 3000 mapped and verified', completed: true },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },

      // Tasks for GST Module
      {
        id: 'tsk_201',
        projectId: p2.id,
        columnId: 'col_todo',
        title: 'HSN / SAC Code Auto-complete API',
        description: 'Provide Indian Goods and Services Tax 4-digit and 6-digit classification dataset lookup.',
        priority: 'medium',
        order: 0,
        assigneeId: uAnanya.id,
        dueDate: '2026-10-24',
        labels: ['Tax', 'Compliance'],
        checklist: [
          { id: 'chk_18', text: 'Import central GST tax rate slabs (5%, 12%, 18%, 28%)', completed: true },
          { id: 'chk_19', text: 'Build fuzzy search index for trade descriptions', completed: false },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_202',
        projectId: p2.id,
        columnId: 'col_inprog',
        title: 'E-Way Bill Generation JSON Schema Validation',
        description: 'Validate consignor, consignee, and vehicle transport distance for NIC portal export.',
        priority: 'high',
        order: 0,
        assigneeId: uPriya.id,
        dueDate: '2026-10-19',
        labels: ['Validation', 'GST'],
        checklist: [
          { id: 'chk_20', text: 'Zod validation for 15-digit GSTIN regex', completed: true },
          { id: 'chk_21', text: 'Calculate CGST and SGST splits for intra-state sales', completed: true },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },

      // Tasks for Tech Fest
      {
        id: 'tsk_301',
        projectId: p3.id,
        columnId: 'col_todo',
        title: 'Finalize Sponsorship Deck for Tech Startups',
        description: 'Reach out to venture funds and tech firms in Mumbai and Bengaluru.',
        priority: 'high',
        order: 0,
        assigneeId: uRohan.id,
        dueDate: '2026-10-29',
        labels: ['Sponsorship', 'Events'],
        checklist: [
          { id: 'chk_22', text: 'Draft Title Sponsor package at ₹50,000', completed: true },
          { id: 'chk_23', text: 'Send proposals to 15 alumni startups', completed: false },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tsk_302',
        projectId: p3.id,
        columnId: 'col_inprog',
        title: 'Hackathon Problem Statements Release',
        description: 'Publish AI, Fintech, and Agritech themes for student teams across India.',
        priority: 'medium',
        order: 0,
        assigneeId: uKabir.id,
        dueDate: '2026-10-21',
        labels: ['Hackathon', 'Content'],
        checklist: [
          { id: 'chk_24', text: 'Get evaluation rubric approved by faculty', completed: true },
        ],
        createdBy: uAarav.id,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Comments
    const comments: CommentDoc[] = [
      {
        id: 'cmt_1',
        taskId: 'tsk_101',
        projectId: p1.id,
        userId: uPriya.id,
        content: 'I verified the webhook signature flow with test UPI transactions. Working smoothly!',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'cmt_2',
        taskId: 'tsk_101',
        projectId: p1.id,
        userId: uAarav.id,
        content: 'Badiya kaam Priya! Please make sure failure retries do not trigger duplicate credits.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
      },
      {
        id: 'cmt_3',
        taskId: 'tsk_103',
        projectId: p1.id,
        userId: uAnanya.id,
        content: 'Tested Socket.IO room isolation with two browser tabs. State updates instantly on card drop.',
        createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
      },
    ];

    // Notifications
    const notifications: NotificationDoc[] = [
      {
        id: 'notif_1',
        userId: uAarav.id,
        type: 'comment_added',
        title: 'New comment from Priya Nair',
        message: 'I verified the webhook signature flow with test UPI transactions on "Razorpay & UPI Webhook Integration".',
        link: `/projects/${p1.id}?task=tsk_101`,
        read: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: 'notif_2',
        userId: uAarav.id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: 'Sneha Reddy assigned you to "Customer Feedback Session with Bangalore Beta Cohort".',
        link: `/projects/${p1.id}?task=tsk_104`,
        read: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      },
      {
        id: 'notif_3',
        userId: uPriya.id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: 'Aarav Mehta assigned you to "Razorpay & UPI Webhook Integration".',
        link: `/projects/${p1.id}?task=tsk_101`,
        read: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      },
    ];

    this.data = {
      users,
      projects,
      tasks,
      comments,
      notifications,
    };

    this.persist();
    this.isLoaded = true;
  }

  // Model accessors
  public users = {
    find: async (filter?: (u: UserDoc) => boolean) => {
      return filter ? this.data.users.filter(filter) : [...this.data.users];
    },
    findById: async (id: string) => {
      return this.data.users.find((u) => u.id === id) || null;
    },
    findOne: async (filter: (u: UserDoc) => boolean) => {
      return this.data.users.find(filter) || null;
    },
    create: async (doc: Omit<UserDoc, 'id' | 'createdAt'> & { id?: string }) => {
      const newUser: UserDoc = {
        ...doc,
        id: doc.id || `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(newUser);
      this.persist();
      return newUser;
    },
    findByIdAndUpdate: async (id: string, update: Partial<UserDoc>) => {
      const idx = this.data.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      this.data.users[idx] = { ...this.data.users[idx], ...update };
      this.persist();
      return this.data.users[idx];
    },
  };

  public projects = {
    find: async (filter?: (p: ProjectDoc) => boolean) => {
      return filter ? this.data.projects.filter(filter) : [...this.data.projects];
    },
    findById: async (id: string) => {
      return this.data.projects.find((p) => p.id === id) || null;
    },
    create: async (doc: Omit<ProjectDoc, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newPrj: ProjectDoc = {
        ...doc,
        id: `prj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
        updatedAt: now,
      };
      this.data.projects.push(newPrj);
      this.persist();
      return newPrj;
    },
    findByIdAndUpdate: async (id: string, update: Partial<ProjectDoc>) => {
      const idx = this.data.projects.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      this.data.projects[idx] = {
        ...this.data.projects[idx],
        ...update,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return this.data.projects[idx];
    },
    findByIdAndDelete: async (id: string) => {
      const idx = this.data.projects.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      this.data.projects.splice(idx, 1);
      // Cascade delete tasks, comments
      this.data.tasks = this.data.tasks.filter((t) => t.projectId !== id);
      this.data.comments = this.data.comments.filter((c) => c.projectId !== id);
      this.persist();
      return true;
    },
  };

  public tasks = {
    find: async (filter?: (t: TaskDoc) => boolean) => {
      return filter ? this.data.tasks.filter(filter) : [...this.data.tasks];
    },
    findById: async (id: string) => {
      return this.data.tasks.find((t) => t.id === id) || null;
    },
    create: async (doc: Omit<TaskDoc, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTask: TaskDoc = {
        ...doc,
        id: `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
        updatedAt: now,
      };
      this.data.tasks.push(newTask);
      this.persist();
      return newTask;
    },
    findByIdAndUpdate: async (id: string, update: Partial<TaskDoc>) => {
      const idx = this.data.tasks.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      this.data.tasks[idx] = {
        ...this.data.tasks[idx],
        ...update,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return this.data.tasks[idx];
    },
    findByIdAndDelete: async (id: string) => {
      const idx = this.data.tasks.findIndex((t) => t.id === id);
      if (idx === -1) return false;
      this.data.tasks.splice(idx, 1);
      this.data.comments = this.data.comments.filter((c) => c.taskId !== id);
      this.persist();
      return true;
    },
  };

  public comments = {
    find: async (filter?: (c: CommentDoc) => boolean) => {
      return filter ? this.data.comments.filter(filter) : [...this.data.comments];
    },
    findById: async (id: string) => {
      return this.data.comments.find((c) => c.id === id) || null;
    },
    create: async (doc: Omit<CommentDoc, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newComment: CommentDoc = {
        ...doc,
        id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
        updatedAt: now,
      };
      this.data.comments.push(newComment);
      this.persist();
      return newComment;
    },
    findByIdAndUpdate: async (id: string, update: Partial<CommentDoc>) => {
      const idx = this.data.comments.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      this.data.comments[idx] = {
        ...this.data.comments[idx],
        ...update,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return this.data.comments[idx];
    },
    findByIdAndDelete: async (id: string) => {
      const idx = this.data.comments.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.data.comments.splice(idx, 1);
      this.persist();
      return true;
    },
  };

  public notifications = {
    find: async (filter?: (n: NotificationDoc) => boolean) => {
      return filter ? this.data.notifications.filter(filter) : [...this.data.notifications];
    },
    findById: async (id: string) => {
      return this.data.notifications.find((n) => n.id === id) || null;
    },
    create: async (doc: Omit<NotificationDoc, 'id' | 'createdAt'>) => {
      const now = new Date().toISOString();
      const newNotif: NotificationDoc = {
        ...doc,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
      };
      this.data.notifications.unshift(newNotif);
      this.persist();
      return newNotif;
    },
    findByIdAndUpdate: async (id: string, update: Partial<NotificationDoc>) => {
      const idx = this.data.notifications.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      this.data.notifications[idx] = { ...this.data.notifications[idx], ...update };
      this.persist();
      return this.data.notifications[idx];
    },
    markAllReadForUser: async (userId: string) => {
      this.data.notifications = this.data.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      );
      this.persist();
    },
  };
}

export const db = new DatabaseEngine();
