/**
 * Seed script — run with: node seed.js
 * Requires MONGODB_URI in .env or set inline below.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI;

// ─── Schemas (inline, mirrors the TypeScript models) ────────────────────────

const UserSchema = new mongoose.Schema({ firstName: String, lastName: String, email: { type: String, unique: true }, password: String, role: String, isEmailVerified: { type: Boolean, default: true }, isActive: { type: Boolean, default: true }, bio: String, phone: String, department: String, jobTitle: String, timezone: { type: String, default: 'UTC' }, loginAttempts: { type: Number, default: 0 }, notifications: { email: Boolean, push: Boolean, taskAssigned: Boolean, taskUpdated: Boolean, projectUpdated: Boolean, mentions: Boolean } }, { timestamps: true });

const ProjectSchema = new mongoose.Schema({ name: String, description: String, key: String, status: String, priority: String, startDate: Date, endDate: Date, dueDate: Date, progress: Number, projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, members: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: String, joinedAt: Date }], milestones: [{ title: String, description: String, dueDate: Date, isCompleted: Boolean, completedAt: Date }], tags: [String], budget: Number, spent: Number, isArchived: { type: Boolean, default: false }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });

const TaskSchema = new mongoose.Schema({ title: String, description: String, project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, status: String, priority: String, assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, dueDate: Date, startDate: Date, estimatedHours: Number, actualHours: Number, labels: [String], checklist: [{ text: String, isCompleted: Boolean }], watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], order: Number, isArchived: { type: Boolean, default: false }, completedAt: Date }, { timestamps: true });

const CommentSchema = new mongoose.Schema({ content: String, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], isEdited: { type: Boolean, default: false } }, { timestamps: true });

const ExpenseSchema = new mongoose.Schema({ project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, amount: Number, category: String, description: String, date: Date, recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });

const NotificationSchema = new mongoose.Schema({ recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, type: String, title: String, message: String, link: String, isRead: { type: Boolean, default: false } }, { timestamps: true });

const TimeLogSchema = new mongoose.Schema({ task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, description: String, startTime: Date, endTime: Date, duration: Number, isManual: Boolean, date: Date }, { timestamps: true });

const User         = mongoose.model('User', UserSchema);
const Project      = mongoose.model('Project', ProjectSchema);
const Task         = mongoose.model('Task', TaskSchema);
const Comment      = mongoose.model('Comment', CommentSchema);
const Expense      = mongoose.model('Expense', ExpenseSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const TimeLog      = mongoose.model('TimeLog', TimeLogSchema);

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User, Project, Task, Comment, Expense, Notification, TimeLog].map(m => m.deleteMany({})));
  console.log('Cleared existing data');

  const hash = await bcrypt.hash('Password@123', 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await User.insertMany([
    { firstName: 'Alice', lastName: 'Morgan', email: 'alice@example.com', password: hash, role: 'admin', department: 'Engineering', jobTitle: 'CTO', bio: 'Oversees all technical operations.', phone: '+1-555-0101', notifications: { email: true, push: true, taskAssigned: true, taskUpdated: true, projectUpdated: true, mentions: true } },
    { firstName: 'Bob', lastName: 'Carter', email: 'bob@example.com', password: hash, role: 'project_manager', department: 'Product', jobTitle: 'Senior PM', bio: 'Manages cross-functional teams.', phone: '+1-555-0102', notifications: { email: true, push: true, taskAssigned: true, taskUpdated: true, projectUpdated: true, mentions: true } },
    { firstName: 'Carol', lastName: 'Singh', email: 'carol@example.com', password: hash, role: 'team_lead', department: 'Engineering', jobTitle: 'Tech Lead', bio: 'Leads the frontend team.', phone: '+1-555-0103', notifications: { email: true, push: false, taskAssigned: true, taskUpdated: true, projectUpdated: false, mentions: true } },
    { firstName: 'David', lastName: 'Kim', email: 'david@example.com', password: hash, role: 'developer', department: 'Engineering', jobTitle: 'Full Stack Developer', bio: 'Specialises in React and Node.js.', phone: '+1-555-0104', notifications: { email: true, push: true, taskAssigned: true, taskUpdated: false, projectUpdated: false, mentions: true } },
    { firstName: 'Eva', lastName: 'Patel', email: 'eva@example.com', password: hash, role: 'developer', department: 'Engineering', jobTitle: 'Backend Developer', bio: 'MongoDB and Express expert.', phone: '+1-555-0105', notifications: { email: false, push: true, taskAssigned: true, taskUpdated: true, projectUpdated: false, mentions: false } },
    { firstName: 'Frank', lastName: 'Lee', email: 'frank@example.com', password: hash, role: 'client', department: 'External', jobTitle: 'Product Owner', bio: 'Client stakeholder for CRM project.', phone: '+1-555-0106', notifications: { email: true, push: false, taskAssigned: false, taskUpdated: false, projectUpdated: true, mentions: false } },
  ]);

  const [alice, bob, carol, david, eva, frank] = users;
  console.log(`Inserted ${users.length} users  (password for all: Password@123)`);

  // ── Projects ───────────────────────────────────────────────────────────────
  const projects = await Project.insertMany([
    {
      name: 'Internal Portal Redesign', key: 'IPR', status: 'active', priority: 'high',
      description: 'Redesign the internal employee portal with a modern UI and improved UX.',
      startDate: new Date('2025-01-10'), endDate: new Date('2025-07-31'), dueDate: new Date('2025-07-15'),
      progress: 45, budget: 50000, spent: 22500,
      projectManager: bob._id, createdBy: alice._id,
      members: [
        { user: bob._id,   role: 'project_manager', joinedAt: new Date('2025-01-10') },
        { user: carol._id, role: 'team_lead',        joinedAt: new Date('2025-01-10') },
        { user: david._id, role: 'developer',        joinedAt: new Date('2025-01-12') },
        { user: eva._id,   role: 'developer',        joinedAt: new Date('2025-01-12') },
      ],
      tags: ['redesign', 'frontend', 'ux'],
      milestones: [
        { title: 'Design Approval',    dueDate: new Date('2025-02-28'), isCompleted: true,  completedAt: new Date('2025-02-25') },
        { title: 'Alpha Release',      dueDate: new Date('2025-05-01'), isCompleted: true,  completedAt: new Date('2025-04-30') },
        { title: 'Beta Testing',       dueDate: new Date('2025-06-15'), isCompleted: false },
        { title: 'Production Launch',  dueDate: new Date('2025-07-15'), isCompleted: false },
      ],
    },
    {
      name: 'CRM Integration', key: 'CRM', status: 'planning', priority: 'critical',
      description: 'Integrate Salesforce CRM with the internal data warehouse for real-time reporting.',
      startDate: new Date('2025-03-01'), endDate: new Date('2025-12-31'), dueDate: new Date('2025-11-30'),
      progress: 10, budget: 120000, spent: 8000,
      projectManager: bob._id, createdBy: alice._id,
      members: [
        { user: bob._id,   role: 'project_manager', joinedAt: new Date('2025-03-01') },
        { user: eva._id,   role: 'developer',        joinedAt: new Date('2025-03-05') },
        { user: frank._id, role: 'client',           joinedAt: new Date('2025-03-01') },
      ],
      tags: ['crm', 'integration', 'salesforce'],
      milestones: [
        { title: 'Requirements Sign-off', dueDate: new Date('2025-04-01'), isCompleted: true, completedAt: new Date('2025-03-28') },
        { title: 'API Prototype',         dueDate: new Date('2025-06-30'), isCompleted: false },
        { title: 'UAT',                   dueDate: new Date('2025-10-31'), isCompleted: false },
      ],
    },
    {
      name: 'Mobile App v2', key: 'MAV2', status: 'on_hold', priority: 'medium',
      description: 'Second major version of the mobile app with offline support and push notifications.',
      startDate: new Date('2024-11-01'), endDate: new Date('2025-08-31'), dueDate: new Date('2025-08-01'),
      progress: 30, budget: 75000, spent: 31000,
      projectManager: carol._id, createdBy: alice._id,
      members: [
        { user: carol._id, role: 'team_lead',  joinedAt: new Date('2024-11-01') },
        { user: david._id, role: 'developer',  joinedAt: new Date('2024-11-05') },
      ],
      tags: ['mobile', 'react-native', 'offline'],
      milestones: [
        { title: 'Offline Mode POC', dueDate: new Date('2025-01-31'), isCompleted: true, completedAt: new Date('2025-01-28') },
        { title: 'Push Notifications', dueDate: new Date('2025-05-31'), isCompleted: false },
      ],
    },
    {
      name: 'Data Analytics Dashboard', key: 'DAD', status: 'completed', priority: 'low',
      description: 'Build an executive-level analytics dashboard using Recharts and MongoDB aggregations.',
      startDate: new Date('2024-06-01'), endDate: new Date('2024-12-15'), dueDate: new Date('2024-12-01'),
      progress: 100, budget: 30000, spent: 28500,
      projectManager: bob._id, createdBy: alice._id,
      members: [
        { user: bob._id,   role: 'project_manager', joinedAt: new Date('2024-06-01') },
        { user: david._id, role: 'developer',        joinedAt: new Date('2024-06-03') },
        { user: eva._id,   role: 'developer',        joinedAt: new Date('2024-06-03') },
      ],
      tags: ['analytics', 'dashboard', 'reporting'],
      milestones: [
        { title: 'Schema Design',   dueDate: new Date('2024-07-01'), isCompleted: true, completedAt: new Date('2024-06-28') },
        { title: 'MVP Dashboard',   dueDate: new Date('2024-09-30'), isCompleted: true, completedAt: new Date('2024-09-25') },
        { title: 'Final Delivery',  dueDate: new Date('2024-12-01'), isCompleted: true, completedAt: new Date('2024-11-30') },
      ],
    },
  ]);

  const [ipr, crm, mav2, dad] = projects;
  // Add 4 more projects to reach 8 projects total
  const moreProjects = await Project.insertMany([
    {
      name: 'Website Relaunch', key: 'WR', status: 'active', priority: 'high',
      description: 'Full relaunch of the marketing website with CMS migration.',
      startDate: new Date('2026-06-20'), endDate: new Date('2026-09-01'), dueDate: new Date('2026-08-01'),
      progress: 25, budget: 60000, spent: 12000,
      projectManager: carol._id, createdBy: alice._id,
      members: [
        { user: carol._id, role: 'team_lead', joinedAt: new Date('2026-06-20') },
        { user: david._id, role: 'developer', joinedAt: new Date('2026-06-22') },
        { user: eva._id, role: 'developer', joinedAt: new Date('2026-06-22') },
      ],
      tags: ['website', 'cms', 'marketing'],
      milestones: [
        { title: 'Content freeze', dueDate: new Date('2026-07-10'), isCompleted: false },
        { title: 'Staging launch', dueDate: new Date('2026-07-25'), isCompleted: false },
        { title: 'Public launch', dueDate: new Date('2026-08-01'), isCompleted: false },
      ],
    },
    {
      name: 'Customer Onboarding', key: 'COB', status: 'planning', priority: 'medium',
      description: 'Improve the onboarding experience for new customers.',
      startDate: new Date('2026-07-01'), endDate: new Date('2026-10-01'), dueDate: new Date('2026-09-01'),
      progress: 5, budget: 40000, spent: 2000,
      projectManager: bob._id, createdBy: alice._id,
      members: [
        { user: bob._id, role: 'project_manager', joinedAt: new Date('2026-07-01') },
        { user: frank._id, role: 'client', joinedAt: new Date('2026-07-01') },
        { user: eva._id, role: 'developer', joinedAt: new Date('2026-07-03') },
      ],
      tags: ['onboarding', 'ux', 'customer'],
      milestones: [
        { title: 'Onboarding flow spec', dueDate: new Date('2026-07-15'), isCompleted: false },
        { title: 'First cohort test', dueDate: new Date('2026-08-10'), isCompleted: false },
      ],
    },
    {
      name: 'Security Hardening', key: 'SH', status: 'active', priority: 'critical',
      description: 'Security improvements and pen-testing remediation across products.',
      startDate: new Date('2026-06-01'), endDate: new Date('2026-09-30'), dueDate: new Date('2026-09-01'),
      progress: 40, budget: 90000, spent: 36000,
      projectManager: alice._id, createdBy: alice._id,
      members: [
        { user: alice._id, role: 'admin', joinedAt: new Date('2026-06-01') },
        { user: david._id, role: 'developer', joinedAt: new Date('2026-06-05') },
        { user: eva._id, role: 'developer', joinedAt: new Date('2026-06-05') },
      ],
      tags: ['security', 'pen-test', 'compliance'],
      milestones: [
        { title: 'Pen test', dueDate: new Date('2026-07-20'), isCompleted: false },
        { title: 'Remediation', dueDate: new Date('2026-08-31'), isCompleted: false },
      ],
    },
    {
      name: 'Marketing Sprint', key: 'MSP', status: 'active', priority: 'low',
      description: 'Two-week marketing sprint with focused campaigns and A/B testing.',
      startDate: new Date('2026-07-01'), endDate: new Date('2026-08-15'), dueDate: new Date('2026-08-15'),
      progress: 10, budget: 15000, spent: 1000,
      projectManager: frank._id, createdBy: frank._id,
      members: [
        { user: frank._id, role: 'client', joinedAt: new Date('2026-07-01') },
        { user: bob._id, role: 'project_manager', joinedAt: new Date('2026-07-01') },
      ],
      tags: ['marketing', 'ads', 'a-b'],
      milestones: [
        { title: 'Campaign A', dueDate: new Date('2026-07-14'), isCompleted: false },
        { title: 'Campaign B', dueDate: new Date('2026-07-28'), isCompleted: false },
      ],
    },
  ]);

  const [wr, cob, sh, msp] = moreProjects;
  console.log(`Inserted ${moreProjects.length} additional projects`);
  console.log(`Inserted ${projects.length} projects`);

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const tasks = await Task.insertMany([
    // IPR tasks
    { title: 'Wireframe homepage layout', project: ipr._id, status: 'completed', priority: 'high', reporter: bob._id, assignees: [carol._id], startDate: new Date('2025-01-15'), dueDate: new Date('2025-02-10'), estimatedHours: 16, actualHours: 14, labels: ['design'], order: 1, completedAt: new Date('2025-02-08'), checklist: [{ text: 'Desktop layout', isCompleted: true }, { text: 'Mobile layout', isCompleted: true }] },
    { title: 'Implement authentication flow', project: ipr._id, status: 'completed', priority: 'critical', reporter: carol._id, assignees: [david._id, eva._id], startDate: new Date('2025-02-01'), dueDate: new Date('2025-03-01'), estimatedHours: 40, actualHours: 38, labels: ['backend', 'auth'], order: 2, completedAt: new Date('2025-02-28') },
    { title: 'Build dashboard components', project: ipr._id, status: 'in_progress', priority: 'high', reporter: carol._id, assignees: [david._id], startDate: new Date('2025-03-10'), dueDate: new Date('2025-05-30'), estimatedHours: 60, actualHours: 30, labels: ['frontend'], order: 3, checklist: [{ text: 'Stats cards', isCompleted: true }, { text: 'Charts', isCompleted: true }, { text: 'Activity feed', isCompleted: false }] },
    { title: 'Write API documentation', project: ipr._id, status: 'todo', priority: 'low', reporter: bob._id, assignees: [eva._id], dueDate: new Date('2025-06-30'), estimatedHours: 12, actualHours: 0, labels: ['docs'], order: 4 },
    { title: 'Performance audit & optimisation', project: ipr._id, status: 'review', priority: 'medium', reporter: carol._id, assignees: [david._id, eva._id], dueDate: new Date('2025-06-15'), estimatedHours: 20, actualHours: 18, labels: ['performance'], order: 5 },

    // CRM tasks
    { title: 'Map Salesforce data schema', project: crm._id, status: 'completed', priority: 'critical', reporter: bob._id, assignees: [eva._id], startDate: new Date('2025-03-05'), dueDate: new Date('2025-03-25'), estimatedHours: 24, actualHours: 20, labels: ['architecture'], order: 1, completedAt: new Date('2025-03-24') },
    { title: 'Build OAuth2 connector', project: crm._id, status: 'in_progress', priority: 'high', reporter: eva._id, assignees: [eva._id], startDate: new Date('2025-04-01'), dueDate: new Date('2025-05-31'), estimatedHours: 48, actualHours: 20, labels: ['backend', 'oauth'], order: 2 },
    { title: 'Stakeholder demo preparation', project: crm._id, status: 'todo', priority: 'medium', reporter: bob._id, assignees: [bob._id, frank._id], dueDate: new Date('2025-06-15'), estimatedHours: 8, actualHours: 0, labels: ['presentation'], order: 3 },

    // MAV2 tasks
    { title: 'Offline data sync module', project: mav2._id, status: 'in_progress', priority: 'critical', reporter: carol._id, assignees: [david._id], startDate: new Date('2025-02-01'), dueDate: new Date('2025-05-01'), estimatedHours: 80, actualHours: 35, labels: ['mobile', 'offline'], order: 1 },
    { title: 'Push notification service', project: mav2._id, status: 'todo', priority: 'high', reporter: carol._id, assignees: [david._id], dueDate: new Date('2025-06-30'), estimatedHours: 32, actualHours: 0, labels: ['mobile', 'notifications'], order: 2 },

    // DAD tasks (all completed)
    { title: 'Design MongoDB aggregation pipelines', project: dad._id, status: 'completed', priority: 'high', reporter: bob._id, assignees: [eva._id], startDate: new Date('2024-06-05'), dueDate: new Date('2024-07-15'), estimatedHours: 30, actualHours: 28, labels: ['backend', 'db'], order: 1, completedAt: new Date('2024-07-12') },
    { title: 'Recharts integration', project: dad._id, status: 'completed', priority: 'medium', reporter: carol._id, assignees: [david._id], startDate: new Date('2024-07-20'), dueDate: new Date('2024-09-15'), estimatedHours: 40, actualHours: 42, labels: ['frontend', 'charts'], order: 2, completedAt: new Date('2024-09-10') },
  ]);

  console.log(`Inserted ${tasks.length} tasks`);

  // ── Generated tasks for July 1 – Aug 15, 2026 (60+ tasks spread across projects) ──
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const startWindow = new Date('2026-07-01T00:00:00Z');
  const endWindow = new Date('2026-08-15T23:59:59Z');
  function randomDateBetween(a, b) {
    return new Date(a.getTime() + Math.random() * (b.getTime() - a.getTime()));
  }

  const calendarProjects = [ipr, crm, mav2, dad, wr, cob, sh, msp];
  const statuses = ['todo', 'in_progress', 'completed', 'review', 'blocked'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const labelsPool = ['frontend', 'backend', 'design', 'qa', 'docs', 'ux', 'bug', 'infra'];

  const generated = [];
  const TOTAL = 62; // generate 62 tasks
  for (let i = 0; i < TOTAL; i++) {
    const proj = pick(calendarProjects);
    const title = `Sprint task ${i + 1} - ${proj.name}`;
    const start = randomDateBetween(startWindow, endWindow);
    // due date after start but not later than endWindow
    const due = new Date(Math.min(endWindow.getTime(), start.getTime() + rand(0, 10) * 24 * 60 * 60 * 1000));
    const status = pick(statuses);
    const assigneesCount = rand(1, 2);
    const assignees = [];
    for (let a = 0; a < assigneesCount; a++) assignees.push(pick([carol, david, eva, bob, alice, frank])._id);
    const reporter = pick([alice, bob, carol, david, eva, frank])._id;
    const est = rand(1, 16);
    const isCompleted = status === 'completed';
    generated.push({
      title,
      project: proj._id,
      status,
      priority: pick(priorities),
      reporter,
      assignees,
      startDate: start,
      dueDate: due,
      estimatedHours: est,
      actualHours: isCompleted ? Math.min(est, rand(1, 20)) : 0,
      labels: [pick(labelsPool)],
      order: i + 100,
      completedAt: isCompleted ? new Date(start.getTime() + rand(0, Math.max(1, (due.getTime() - start.getTime()) / (24*60*60*1000))) * 24*60*60*1000) : undefined,
    });
  }

  const generatedTasks = await Task.insertMany(generated);
  console.log(`Inserted ${generatedTasks.length} generated tasks (July 1–Aug 15, 2026)`);

  // ── Comments ───────────────────────────────────────────────────────────────
  await Comment.insertMany([
    { content: 'Wireframes look great! Approved for development.', author: bob._id, task: tasks[0]._id, project: ipr._id },
    { content: 'Auth flow is working on staging. Ready for review.', author: david._id, task: tasks[1]._id, project: ipr._id },
    { content: 'Can we add a dark mode toggle to the dashboard?', author: carol._id, task: tasks[2]._id, project: ipr._id, mentions: [david._id] },
    { content: 'OAuth2 connector is 50% done. Hitting rate limits on sandbox.', author: eva._id, task: tasks[6]._id, project: crm._id },
    { content: 'Please confirm the demo date with the client.', author: bob._id, task: tasks[7]._id, project: crm._id, mentions: [frank._id] },
    { content: 'Offline sync is tricky — need to handle conflict resolution.', author: david._id, task: tasks[8]._id, project: mav2._id },
  ]);
  console.log('Inserted comments');

  // ── Expenses ───────────────────────────────────────────────────────────────
  await Expense.insertMany([
    { project: ipr._id, amount: 8000,  category: 'consulting', description: 'UX agency for wireframe review',       date: new Date('2025-01-20'), recordedBy: bob._id },
    { project: ipr._id, amount: 4500,  category: 'software',   description: 'Figma enterprise licence (6 months)',  date: new Date('2025-01-25'), recordedBy: alice._id },
    { project: ipr._id, amount: 10000, category: 'consulting', description: 'Security audit — auth module',         date: new Date('2025-03-15'), recordedBy: bob._id },
    { project: crm._id, amount: 5000,  category: 'software',   description: 'Salesforce sandbox licence',           date: new Date('2025-03-10'), recordedBy: alice._id },
    { project: crm._id, amount: 3000,  category: 'travel',     description: 'Client on-site visit — flights+hotel', date: new Date('2025-04-05'), recordedBy: bob._id },
    { project: mav2._id, amount: 12000, category: 'software',  description: 'React Native enterprise tooling',      date: new Date('2024-11-10'), recordedBy: carol._id },
    { project: mav2._id, amount: 19000, category: 'consulting', description: 'Mobile UX specialist contract',       date: new Date('2024-12-01'), recordedBy: alice._id },
    { project: dad._id, amount: 9500,  category: 'software',   description: 'BI tooling licences',                  date: new Date('2024-07-01'), recordedBy: bob._id },
    { project: dad._id, amount: 19000, category: 'consulting', description: 'Data engineering contractor',          date: new Date('2024-08-15'), recordedBy: alice._id },
  ]);
  console.log('Inserted expenses');

  // ── Time Logs ──────────────────────────────────────────────────────────────
  await TimeLog.insertMany([
    { task: tasks[0]._id, project: ipr._id,  user: carol._id, description: 'Initial wireframe sketches',    startTime: new Date('2025-01-16T09:00:00Z'), endTime: new Date('2025-01-16T13:00:00Z'), duration: 240, isManual: false, date: new Date('2025-01-16') },
    { task: tasks[1]._id, project: ipr._id,  user: david._id, description: 'JWT implementation',            startTime: new Date('2025-02-03T10:00:00Z'), endTime: new Date('2025-02-03T18:00:00Z'), duration: 480, isManual: false, date: new Date('2025-02-03') },
    { task: tasks[1]._id, project: ipr._id,  user: eva._id,   description: 'Refresh token logic',           startTime: new Date('2025-02-05T09:00:00Z'), endTime: new Date('2025-02-05T17:00:00Z'), duration: 480, isManual: false, date: new Date('2025-02-05') },
    { task: tasks[2]._id, project: ipr._id,  user: david._id, description: 'Stats cards component',         startTime: new Date('2025-03-12T09:00:00Z'), endTime: new Date('2025-03-12T17:00:00Z'), duration: 480, isManual: false, date: new Date('2025-03-12') },
    { task: tasks[5]._id, project: crm._id,  user: eva._id,   description: 'Salesforce schema mapping',     startTime: new Date('2025-03-06T09:00:00Z'), endTime: new Date('2025-03-06T17:00:00Z'), duration: 480, isManual: false, date: new Date('2025-03-06') },
    { task: tasks[6]._id, project: crm._id,  user: eva._id,   description: 'OAuth2 token exchange',         startTime: new Date('2025-04-03T10:00:00Z'), endTime: new Date('2025-04-03T16:00:00Z'), duration: 360, isManual: false, date: new Date('2025-04-03') },
    { task: tasks[8]._id, project: mav2._id, user: david._id, description: 'SQLite local cache setup',      startTime: new Date('2025-02-10T09:00:00Z'), endTime: new Date('2025-02-10T17:00:00Z'), duration: 480, isManual: false, date: new Date('2025-02-10') },
    { task: tasks[10]._id, project: dad._id, user: eva._id,   description: 'Aggregation pipeline drafts',   startTime: new Date('2024-06-10T09:00:00Z'), endTime: new Date('2024-06-10T17:00:00Z'), duration: 480, isManual: true,  date: new Date('2024-06-10') },
    { task: tasks[11]._id, project: dad._id, user: david._id, description: 'Recharts bar + line charts',    startTime: new Date('2024-07-25T09:00:00Z'), endTime: new Date('2024-07-25T18:00:00Z'), duration: 540, isManual: false, date: new Date('2024-07-25') },
  ]);
  console.log('Inserted time logs');

  // ── Notifications ──────────────────────────────────────────────────────────
  await Notification.insertMany([
    { recipient: david._id, sender: carol._id, type: 'task_assigned',   title: 'New task assigned',         message: 'Carol assigned you "Build dashboard components"',    link: `/tasks/${tasks[2]._id}`,  isRead: false },
    { recipient: eva._id,   sender: bob._id,   type: 'task_assigned',   title: 'New task assigned',         message: 'Bob assigned you "Write API documentation"',         link: `/tasks/${tasks[3]._id}`,  isRead: false },
    { recipient: carol._id, sender: bob._id,   type: 'project_updated', title: 'Project status changed',    message: 'IPR project status updated to Active',               link: `/projects/${ipr._id}`,    isRead: true  },
    { recipient: frank._id, sender: bob._id,   type: 'mention',         title: 'You were mentioned',        message: 'Bob mentioned you in a comment on CRM project',      link: `/projects/${crm._id}`,    isRead: false },
    { recipient: david._id, sender: carol._id, type: 'comment_added',   title: 'New comment on your task',  message: 'Carol commented on "Build dashboard components"',    link: `/tasks/${tasks[2]._id}`,  isRead: false },
    { recipient: bob._id,   sender: alice._id, type: 'deadline_reminder', title: 'Deadline approaching',   message: 'CRM project due date is in 30 days',                 link: `/projects/${crm._id}`,    isRead: false },
    { recipient: eva._id,   sender: eva._id,   type: 'task_completed',  title: 'Task completed',            message: 'You completed "Map Salesforce data schema"',         link: `/tasks/${tasks[5]._id}`,  isRead: true  },
    { recipient: alice._id, type: 'system',    title: 'System maintenance',  message: 'Scheduled maintenance on Sunday 02:00–04:00 UTC',                                   isRead: false },
  ]);
  console.log('Inserted notifications');

  // ── Extra comments, time logs and small expenses for generated tasks ───────
  if (typeof generatedTasks !== 'undefined' && generatedTasks.length) {
    const extraComments = [];
    const extraTimeLogs = [];
    const extraExpenses = [];
    for (let i = 0; i < 20; i++) {
      const t = pick(generatedTasks);
      extraComments.push({
        content: `Automated comment ${i + 1} for ${t.title}`,
        author: pick([alice, bob, carol, david, eva, frank])._id,
        task: t._id,
        project: t.project,
      });
    }

    for (let i = 0; i < 20; i++) {
      const t = pick(generatedTasks);
      const user = pick([carol, david, eva, bob, alice, frank]);
      const date = randomDateBetween(startWindow, endWindow);
      const duration = rand(30, 480);
      const startTime = new Date(date.getTime());
      const endTime = new Date(date.getTime() + duration * 60 * 1000);
      extraTimeLogs.push({
        task: t._id,
        project: t.project,
        user: user._id,
        description: `Work on ${t.title}`,
        startTime,
        endTime,
        duration,
        isManual: false,
        date,
      });
    }

    for (let i = 0; i < 8; i++) {
      const proj = pick(calendarProjects);
      extraExpenses.push({
        project: proj._id,
        amount: rand(100, 2500),
        category: pick(['software', 'consulting', 'travel', 'ads']),
        description: `Sprint expense ${i + 1}`,
        date: randomDateBetween(startWindow, endWindow),
        recordedBy: pick([alice, bob, carol, david, eva])._id,
      });
    }

    await Comment.insertMany(extraComments);
    await TimeLog.insertMany(extraTimeLogs);
    await Expense.insertMany(extraExpenses);
    console.log('Inserted extra comments, time logs and expenses for generated tasks');
  }

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Login with any of these accounts (password: Password@123):');
  users.forEach(u => console.log(`  ${u.role.padEnd(18)} ${u.email}`));
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
