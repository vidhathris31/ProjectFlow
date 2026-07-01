import React from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';
import dayjs from 'dayjs';
import { CalendarActivity } from './types';
import { User } from '../../types';

const ACTIVITY_ICONS: Record<string, string> = {
  task_completed:    '✔',
  task_created:      '📋',
  task_overdue:      '⚠',
  task_status_changed: '🔄',
  comment_added:     '💬',
  file_uploaded:     '📎',
  time_logged:       '⏱',
  milestone_reached: '🎯',
  budget_updated:    '💰',
  member_assigned:   '👤',
};

const ACTIVITY_COLORS: Record<string, string> = {
  task_completed:    '#10b981',
  task_created:      '#4f46e5',
  task_overdue:      '#ef4444',
  comment_added:     '#8b5cf6',
  file_uploaded:     '#6366f1',
  time_logged:       '#3b82f6',
  milestone_reached: '#d97706',
  budget_updated:    '#0d9488',
  member_assigned:   '#f59e0b',
};

interface Props {
  activities: CalendarActivity[];
}

const ActivityFeed: React.FC<Props> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        No activities on this day.
      </Typography>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      {activities.map((act) => {
        const user = act.user as User | undefined;
        const color = ACTIVITY_COLORS[act.type] || '#6366f1';
        const icon = ACTIVITY_ICONS[act.type] || '•';

        return (
          <Box
            key={act.id}
            display="flex"
            gap={1.5}
            alignItems="flex-start"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}0d`,
              border: '1px solid',
              borderColor: `${color}25`,
            }}
          >
            {user ? (
              <Avatar
                src={user.avatar}
                sx={{ width: 32, height: 32, fontSize: 13, bgcolor: color, flexShrink: 0 }}
              >
                {user.firstName?.[0]}
              </Avatar>
            ) : (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: `${color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}

            <Box flex={1} minWidth={0}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                {user && (
                  <Typography variant="caption" fontWeight={700}>
                    {user.firstName} {user.lastName}
                  </Typography>
                )}
                <Chip
                  label={act.type.replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 600,
                    bgcolor: `${color}20`,
                    color,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {act.description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActivityFeed;
