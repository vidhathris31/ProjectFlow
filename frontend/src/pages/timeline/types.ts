import { Task, User, Milestone } from '../../types';
import { Expense } from '../../services/expense.service';
import { TimeEntry } from '../../types';

export type ActivityType =
  | 'task_created'
  | 'task_completed'
  | 'task_overdue'
  | 'task_status_changed'
  | 'comment_added'
  | 'file_uploaded'
  | 'time_logged'
  | 'milestone_reached'
  | 'budget_updated'
  | 'member_assigned';

export interface CalendarActivity {
  id: string;
  type: ActivityType;
  date: string; // YYYY-MM-DD
  user?: User;
  task?: Task;
  milestone?: Milestone;
  expense?: Expense;
  timeEntry?: TimeEntry;
  description: string;
  meta?: Record<string, any>;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  activities: CalendarActivity[];
  tasks: Task[];
  milestones: Milestone[];
  expenses: Expense[];
  timeLogs: TimeEntry[];
  activityCount: number;
  intensity: 0 | 1 | 2 | 3; // 0=none, 1=light, 2=medium, 3=dark
}

export interface CalendarFiltersState {
  memberId: string;
  taskStatus: string;
  priority: string;
  activityType: string;
  dateFrom: string;
  dateTo: string;
}

export interface CalendarSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  milestones: number;
  hoursLogged: number;
  budgetUsed: number;
  budgetRemaining: number;
  commentsThisMonth: number;
  filesUploaded: number;
}
