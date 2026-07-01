import React from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import FilterList from '@mui/icons-material/FilterList';
import ClearAll from '@mui/icons-material/ClearAll';
import { User } from '../../types';
import { CalendarFiltersState } from './types';

interface Props {
  filters: CalendarFiltersState;
  onChange: (f: CalendarFiltersState) => void;
  members: User[];
}

const STATUSES = ['todo', 'in_progress', 'review', 'testing', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const ACTIVITY_TYPES = [
  { value: 'task_created',      label: 'Task Created' },
  { value: 'task_completed',    label: 'Task Completed' },
  { value: 'task_overdue',      label: 'Task Overdue' },
  { value: 'comment_added',     label: 'Comment Added' },
  { value: 'file_uploaded',     label: 'File Uploaded' },
  { value: 'time_logged',       label: 'Time Logged' },
  { value: 'milestone_reached', label: 'Milestone' },
  { value: 'budget_updated',    label: 'Budget Update' },
  { value: 'member_assigned',   label: 'Member Assigned' },
];

const EMPTY: CalendarFiltersState = {
  memberId: '', taskStatus: '', priority: '', activityType: '', dateFrom: '', dateTo: '',
};

const CalendarFilters: React.FC<Props> = ({ filters, onChange, members }) => {
  const set = (key: keyof Omit<CalendarFiltersState, 'dateFrom' | 'dateTo'>) => (e: any) =>
    onChange({ ...filters, [key]: e.target.value });

  const setDate = (key: 'dateFrom' | 'dateTo') => (newValue: Dayjs | null) =>
    onChange({ ...filters, [key]: newValue ? newValue.format('YYYY-MM-DD') : '' });

  const isDirty = Object.values(filters).some(Boolean);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        p: 2,
        mb: 2,
        borderRadius: 3,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <FilterList fontSize="small" color="action" />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Team Member</InputLabel>
        <Select value={filters.memberId} onChange={set('memberId')} label="Team Member">
          <MenuItem value="">All Members</MenuItem>
          {members.map((m) => (
            <MenuItem key={m._id} value={m._id}>
              {m.firstName} {m.lastName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Task Status</InputLabel>
        <Select value={filters.taskStatus} onChange={set('taskStatus')} label="Task Status">
          <MenuItem value="">All Statuses</MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
              {s.replace('_', ' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select value={filters.priority} onChange={set('priority')} label="Priority">
          <MenuItem value="">All</MenuItem>
          {PRIORITIES.map((p) => (
            <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Activity Type</InputLabel>
        <Select value={filters.activityType} onChange={set('activityType')} label="Activity Type">
          <MenuItem value="">All Activities</MenuItem>
          {ACTIVITY_TYPES.map((a) => (
            <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <DatePicker
        label="From"
        value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
        onChange={setDate('dateFrom')}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
      />
      <DatePicker
        label="To"
        value={filters.dateTo ? dayjs(filters.dateTo) : null}
        onChange={setDate('dateTo')}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
      />

      {isDirty && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<ClearAll />}
          onClick={() => onChange(EMPTY)}
          sx={{ ml: 'auto' }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );
};

export default CalendarFilters;
