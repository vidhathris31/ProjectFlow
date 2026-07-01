import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import ActivityTooltip from './ActivityTooltip';
import { DayData } from './types';

const INTENSITY_ALPHA = ['00', '18', '40', '70'];

const ACTIVITY_COLORS: Record<string, string> = {
  task_completed:    '#10b981',
  task_created:      '#4f46e5',
  task_overdue:      '#ef4444',
  task_status_changed: '#3b82f6',
  comment_added:     '#8b5cf6',
  file_uploaded:     '#6366f1',
  time_logged:       '#3b82f6',
  milestone_reached: '#d97706',
  budget_updated:    '#0d9488',
  member_assigned:   '#f59e0b',
};

const ACTIVITY_ICONS: Record<string, string> = {
  task_completed:    '✔',
  task_created:      '📋',
  task_overdue:      '⚠',
  comment_added:     '💬',
  file_uploaded:     '📎',
  time_logged:       '⏱',
  milestone_reached: '🎯',
  budget_updated:    '💰',
  member_assigned:   '👤',
};

interface Props {
  day: DayData | undefined;
  dateStr: string;
  isCurrentMonth: boolean;
  onClick: (dateStr: string) => void;
}

const CalendarDay: React.FC<Props> = ({ day, dateStr, isCurrentMonth, onClick }) => {
  const theme = useTheme();
  const today = dayjs().format('YYYY-MM-DD');
  const isToday = dateStr === today;
  const isPast = dateStr < today;
  const hasMilestone = (day?.milestones?.length || 0) > 0;
  const hasOverdue = day?.activities.some((a) => a.type === 'task_overdue');
  const activities = day?.activities || [];
  const visibleBadges = activities.slice(0, 3);
  const extraCount = activities.length - visibleBadges.length;
  const intensity = day?.intensity || 0;
  const baseColor = theme.palette.primary.main;

  if (!isCurrentMonth) {
    return (
      <Box
        sx={{
          minHeight: 80,
          p: 0.75,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          opacity: 0.24,
          pointerEvents: 'none',
        }}
      />
    );
  }

  const tooltipContent = day && day.activityCount > 0 ? (
    <Box sx={{ p: 0.5, minWidth: 160 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
        {dayjs(dateStr).format('MMM D, YYYY')}
      </Typography>
      {day.tasks.length > 0 && (
        <Typography variant="caption" display="block">📋 {day.tasks.length} task(s)</Typography>
      )}
      {day.activities.filter((a) => a.type === 'task_completed').length > 0 && (
        <Typography variant="caption" display="block" color="#10b981">
          ✔ {day.activities.filter((a) => a.type === 'task_completed').length} completed
        </Typography>
      )}
      {day.activities.filter((a) => a.type === 'task_overdue').length > 0 && (
        <Typography variant="caption" display="block" color="#ef4444">
          ⚠ {day.activities.filter((a) => a.type === 'task_overdue').length} overdue
        </Typography>
      )}
      {day.timeLogs.length > 0 && (
        <Typography variant="caption" display="block">
          ⏱ {(day.timeLogs.reduce((s, l) => s + (l.duration || 0), 0) / 60).toFixed(1)}h logged
        </Typography>
      )}
      {day.milestones.length > 0 && (
        <Typography variant="caption" display="block" color="#d97706">
          🎯 {day.milestones.length} milestone(s)
        </Typography>
      )}
      {day.expenses.length > 0 && (
        <Typography variant="caption" display="block" color="#0d9488">
          💰 ${day.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()} spent
        </Typography>
      )}
    </Box>
  ) : null;

  const cell = (
    <Box
      onClick={() => isCurrentMonth && onClick(dateStr)}
      sx={{
        minHeight: 80,
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isToday
          ? 'primary.main'
          : hasMilestone
          ? '#d97706'
          : hasOverdue
          ? '#ef444440'
          : 'divider',
        bgcolor: isToday
          ? `${baseColor}12`
          : intensity > 0
          ? `${baseColor}${INTENSITY_ALPHA[intensity]}`
          : 'transparent',
        cursor: isCurrentMonth ? 'pointer' : 'default',
        transition: 'all 0.15s',
        '&:hover': isCurrentMonth
          ? { bgcolor: `${baseColor}20`, borderColor: 'primary.main', transform: 'scale(1.02)' }
          : {},
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: 0.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Milestone gold bar */}
      {hasMilestone && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: '#d97706',
            borderRadius: '2px 2px 0 0',
          }}
        />
      )}

      {/* Date number */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          fontWeight={isToday ? 800 : 600}
          sx={{
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: isToday ? 'primary.main' : 'transparent',
            color: isToday ? 'primary.contrastText' : 'text.primary',
            fontSize: 12,
          }}
        >
          {dayjs(dateStr).date()}
        </Typography>
        {intensity > 0 && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: intensity === 3 ? '#ef4444' : intensity === 2 ? '#f59e0b' : '#10b981',
            }}
          />
        )}
      </Box>

      {/* Activity badges */}
      <Box display="flex" flexWrap="wrap" gap={0.3}>
        {visibleBadges.map((act) => (
          <Box
            key={act.id}
            sx={{
              fontSize: 10,
              px: 0.5,
              py: 0.1,
              borderRadius: 1,
              bgcolor: `${ACTIVITY_COLORS[act.type] || '#6366f1'}20`,
              color: ACTIVITY_COLORS[act.type] || '#6366f1',
              fontWeight: 600,
              lineHeight: 1.6,
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ACTIVITY_ICONS[act.type]} {act.type.replace(/_/g, ' ')}
          </Box>
        ))}
        {extraCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 600 }}>
            +{extraCount} more
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (!tooltipContent) return cell;

  return (
    <ActivityTooltip title={tooltipContent}>
      {cell}
    </ActivityTooltip>
  );
};

export default CalendarDay;
