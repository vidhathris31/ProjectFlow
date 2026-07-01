import React, { useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import { DayData } from './types';
import ActivityFeed from './ActivityFeed';
import { Task } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  todo: '#f59e0b',
  in_progress: '#3b82f6',
  review: '#8b5cf6',
  testing: '#0288d1',
  completed: '#10b981',
};

const getStatusColor = (status: string) => STATUS_COLORS[status] || '#6b7280';

const getAssigneeName = (assignees: Array<Task['assignees'][number]>): string => {
  const assignee = assignees?.find((item) => typeof item !== 'string' && item?._id) as Task['assignees'][number] | undefined;
  if (!assignee || typeof assignee === 'string') return 'Unassigned';
  return `${assignee.firstName} ${assignee.lastName}`;
};

interface Props {
  open: boolean;
  date: string;
  dayData?: DayData;
  onClose: () => void;
}

const ActivityDrawer: React.FC<Props> = ({ open, date, dayData, onClose }) => {
  const formattedDate = date ? dayjs(date).format('dddd, MMM D, YYYY') : 'No date selected';

  const taskEntries = useMemo(() => {
    if (!dayData) return [];
    const taskMap = new Map<string, Task>();
    dayData.activities.forEach((activity) => {
      if (activity.task) {
        const task = activity.task as Task;
        taskMap.set(task._id, task);
      }
    });
    return Array.from(taskMap.values());
  }, [dayData]);

  const fileActivities = dayData?.activities.filter(
    (activity) => activity.type === 'file_uploaded' && activity.meta?.attachment
  ) || [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 520 },
            borderRadius: 0,
          },
        },
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box mb={3}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {formattedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review tasks, activity updates, files, milestones, and budget changes for the day.
          </Typography>
        </Box>

        {dayData ? (
          <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Tasks
              </Typography>
              {taskEntries.length > 0 ? (
                <Stack spacing={1}>
                  {taskEntries.map((task) => (
                    <Box
                      key={task._id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" gap={1} alignItems="center">
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status.replace('_', ' ')}
                          size="small"
                          sx={{
                            textTransform: 'capitalize',
                            bgcolor: `${getStatusColor(task.status)}20`,
                            color: getStatusColor(task.status),
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                        Priority: {task.priority}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Assigned: {getAssigneeName(task.assignees)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Due: {task.dueDate ? dayjs(task.dueDate).format('MMM D, YYYY') : 'No due date'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No task activity found for this day.
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Activity Feed
              </Typography>
              <ActivityFeed activities={dayData.activities} />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Files
              </Typography>
              {fileActivities.length > 0 ? (
                <Stack spacing={1}>
                  {fileActivities.map((activity) => {
                    const attachment = activity.meta?.attachment as { name: string; uploadedAt?: string };
                    return (
                      <Box
                        key={activity.id}
                        sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                      >
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {attachment?.name || 'Uploaded file'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {activity.task ? `Task: ${(activity.task as Task).title}` : 'File uploaded'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {attachment?.uploadedAt ? dayjs(attachment.uploadedAt).format('MMM D, YYYY') : 'Unknown date'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No files uploaded on this date.
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Milestones
              </Typography>
              {dayData.milestones.length > 0 ? (
                <Stack spacing={1}>
                  {dayData.milestones.map((milestone) => (
                    <Box
                      key={milestone._id}
                      sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {milestone.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {milestone.isCompleted ? 'Completed' : 'Due'} • {dayjs(milestone.dueDate).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No milestone updates for this day.
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Budget
              </Typography>
              {dayData.expenses.length > 0 ? (
                <Stack spacing={1}>
                  {dayData.expenses.map((expense) => (
                    <Box
                      key={expense._id}
                      sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {expense.description || 'Expense item'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Amount: ${expense.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {expense.date ? dayjs(expense.date).format('MMM D, YYYY') : 'Unknown date'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No budget updates for this day.
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Select a date to inspect detailed activity for the project.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default ActivityDrawer;
