import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Task, Milestone, TimeEntry, User, Comment } from '../../types';
import { Expense } from '../../services/expense.service';
import { CalendarActivity, CalendarFiltersState, CalendarSummary, DayData } from './types';

function toDateStr(d: string | Date | undefined): string {
  return d ? dayjs(d).format('YYYY-MM-DD') : '';
}

function intensity(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

function withinRange(date: string, filters: CalendarFiltersState): boolean {
  if (!date) return false;
  if (filters.dateFrom && date < filters.dateFrom) return false;
  if (filters.dateTo && date > filters.dateTo) return false;
  return true;
}

export function useCalendarData(
  tasks: Task[],
  timeLogs: TimeEntry[],
  expenses: Expense[],
  project: { milestones?: Milestone[]; budget?: number; spent?: number } | null,
  filters: CalendarFiltersState,
  currentMonth: dayjs.Dayjs,
  comments: Comment[]
) {
  const today = dayjs().format('YYYY-MM-DD');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.taskStatus && t.status !== filters.taskStatus) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.memberId) {
        const assigned = t.assignees.some((a) =>
          typeof a === 'string' ? a === filters.memberId : a._id === filters.memberId
        );
        if (!assigned) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const dayMap = useMemo(() => {
    const map = new Map<string, DayData>();
    const daysInMonth = currentMonth.daysInMonth();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = currentMonth.date(d).format('YYYY-MM-DD');
      map.set(dateStr, {
        date: dateStr,
        activities: [],
        tasks: [],
        milestones: [],
        expenses: [],
        timeLogs: [],
        activityCount: 0,
        intensity: 0,
      });
    }

    const addActivity = (date: string, activity: CalendarActivity, task?: Task) => {
      if (!withinRange(date, filters)) return;
      if (!map.has(date)) return;
      const day = map.get(date)!;
      if (task) day.tasks.push(task);
      day.activities.push(activity);
    };

    filteredTasks.forEach((task) => {
      const createdDate = toDateStr(task.createdAt);
      const dueDate = toDateStr(task.dueDate);
      const completedDate = toDateStr(task.completedAt);
      const reporter = task.reporter as User;

      if (createdDate) {
        addActivity(createdDate, {
          id: `task-created-${task._id}`,
          type: 'task_created',
          date: createdDate,
          user: reporter,
          task,
          description: `Created task "${task.title}"`,
        }, task);
      }

      if (completedDate) {
        addActivity(completedDate, {
          id: `task-completed-${task._id}`,
          type: 'task_completed',
          date: completedDate,
          task,
          description: `Completed task "${task.title}"`,
        });
      }

      if (dueDate && dueDate < today && task.status !== 'completed') {
        addActivity(dueDate, {
          id: `task-overdue-${task._id}`,
          type: 'task_overdue',
          date: dueDate,
          task,
          description: `Overdue: "${task.title}"`,
        });
      }

      if (createdDate) {
        task.assignees.forEach((a) => {
          const user = a as User;
          if (user?._id) {
            addActivity(createdDate, {
              id: `member-assigned-${task._id}-${user._id}`,
              type: 'member_assigned',
              date: createdDate,
              user,
              task,
              description: `${user.firstName} ${user.lastName} assigned to "${task.title}"`,
            });
          }
        });
      }

      if (task.attachments?.length > 0) {
        task.attachments.forEach((attachment) => {
          const attachmentDate = toDateStr(attachment.uploadedAt);
          if (!attachmentDate) return;
          addActivity(attachmentDate, {
            id: `file-uploaded-${attachment._id}`,
            type: 'file_uploaded',
            date: attachmentDate,
            task,
            description: `${attachment.name} uploaded`,
            meta: { attachment },
          });
        });
      }
    });

    (project?.milestones || []).forEach((ms) => {
      const msDate = toDateStr(ms.completedAt || ms.dueDate);
      if (!msDate) return;
      addActivity(msDate, {
        id: `milestone-${ms._id}`,
        type: 'milestone_reached',
        date: msDate,
        milestone: ms,
        description: ms.isCompleted ? `Milestone reached: "${ms.title}"` : `Milestone due: "${ms.title}"`,
      });
      if (map.has(msDate)) {
        map.get(msDate)!.milestones.push(ms);
      }
    });

    timeLogs.forEach((log) => {
      const logDate = toDateStr(log.date);
      if (!logDate) return;
      const user = log.user as User;
      const hours = log.duration ? (log.duration / 60).toFixed(1) : '?';
      addActivity(logDate, {
        id: `timelog-${log._id}`,
        type: 'time_logged',
        date: logDate,
        user,
        timeEntry: log,
        description: `${user?.firstName || 'Someone'} logged ${hours}h`,
      });
      if (map.has(logDate)) {
        map.get(logDate)!.timeLogs.push(log);
      }
    });

    expenses.forEach((exp) => {
      const expDate = toDateStr(exp.date);
      if (!expDate) return;
      addActivity(expDate, {
        id: `expense-${exp._id}`,
        type: 'budget_updated',
        date: expDate,
        expense: exp,
        description: `$${exp.amount} expense: ${exp.description}`,
      });
      if (map.has(expDate)) {
        map.get(expDate)!.expenses.push(exp);
      }
    });

    comments.forEach((comment) => {
      const commentDate = toDateStr(comment.createdAt);
      const task = tasks.find((task) => typeof comment.task !== 'string' ? task._id === comment.task._id : task._id === comment.task);
      addActivity(commentDate, {
        id: `comment-${comment._id}`,
        type: 'comment_added',
        date: commentDate,
        user: comment.author,
        task,
        description: `${comment.author.firstName} added a comment`,
        meta: { comment },
      });
    });

    map.forEach((day) => {
      if (filters.activityType) {
        day.activities = day.activities.filter((a) => a.type === filters.activityType);
      }
      day.activityCount = day.activities.length;
      day.intensity = intensity(day.activityCount);
    });

    return map;
  }, [filteredTasks, timeLogs, expenses, project, filters, currentMonth, today, comments]);

  const rangeFilter = (value: string) => {
    if (!value) return false;
    if (filters.dateFrom && value < filters.dateFrom) return false;
    if (filters.dateTo && value > filters.dateTo) return false;
    return true;
  };

  const summary = useMemo((): CalendarSummary => {
    const effectiveStart = filters.dateFrom || currentMonth.startOf('month').format('YYYY-MM-DD');
    const effectiveEnd = filters.dateTo || currentMonth.endOf('month').format('YYYY-MM-DD');

    const inRange = (value: string) => value >= effectiveStart && value <= effectiveEnd;

    const visibleTasks = filteredTasks.filter((t) => inRange(toDateStr(t.createdAt)));

    const overdue = filteredTasks.filter(
      (t) => t.dueDate && toDateStr(t.dueDate) < today && t.status !== 'completed' && inRange(toDateStr(t.dueDate))
    ).length;

    const hoursLogged = timeLogs
      .filter((l) => inRange(toDateStr(l.date)))
      .reduce((sum, l) => sum + (l.duration || 0) / 60, 0);

    const commentsThisMonth = comments.filter((comment) => inRange(toDateStr(comment.createdAt))).length;

    const filesUploaded = filteredTasks.reduce(
      (sum, task) =>
        sum + (task.attachments?.filter((attachment) => {
          const uploaded = toDateStr(attachment.uploadedAt);
          return uploaded ? inRange(uploaded) : false;
        }).length || 0),
      0
    );

    const budgetUsed = project?.spent || 0;
    const budgetTotal = project?.budget || 0;

    return {
      totalTasks: visibleTasks.length,
      completedTasks: visibleTasks.filter((t) => t.status === 'completed').length,
      pendingTasks: visibleTasks.filter((t) => t.status !== 'completed').length,
      overdueTasks: overdue,
      milestones: (project?.milestones || []).filter((m) => m.isCompleted && inRange(toDateStr(m.completedAt || m.dueDate))).length,
      hoursLogged: Math.round(hoursLogged * 10) / 10,
      budgetUsed,
      budgetRemaining: Math.max(0, budgetTotal - budgetUsed),
      commentsThisMonth,
      filesUploaded,
    };
  }, [filteredTasks, timeLogs, comments, project, currentMonth, filters, today]);

  return { dayMap, summary };
}
