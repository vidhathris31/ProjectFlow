import React, { useMemo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import CalendarDay from './CalendarDay';
import { DayData } from './types';
import dayjs from 'dayjs';

interface Props {
  dayMap: Map<string, DayData>;
  currentMonth: dayjs.Dayjs;
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ActivityCalendar: React.FC<Props> = ({ dayMap, currentMonth, onDateClick, onPrevMonth, onNextMonth }) => {
  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week');
    const end = currentMonth.endOf('month').endOf('week');
    const totalDays = end.diff(start, 'day') + 1;
    return Array.from({ length: totalDays }, (_, index) => start.add(index, 'day'));
  }, [currentMonth]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarMonth color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {currentMonth.format('MMMM YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Project activity calendar
            </Typography>
          </Box>
        </Box>

        <Box>
          <IconButton size="small" onClick={onPrevMonth}>
            <ChevronLeft />
          </IconButton>
          <IconButton size="small" onClick={onNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(7, minmax(0, 1fr))" gap={1} mb={1}>
        {WEEK_LABELS.map((label) => (
          <Box
            key={label}
            sx={{ textAlign: 'center', py: 1, color: 'text.secondary', fontWeight: 700, fontSize: 12 }}
          >
            {label}
          </Box>
        ))}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(7, minmax(0, 1fr))" gap={1}>
        {calendarDays.map((day) => {
          const dateStr = day.format('YYYY-MM-DD');

          return (
            <CalendarDay
              key={dateStr}
              day={dayMap.get(dateStr)}
              dateStr={dateStr}
              isCurrentMonth={day.month() === currentMonth.month()}
              onClick={onDateClick}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default ActivityCalendar;
