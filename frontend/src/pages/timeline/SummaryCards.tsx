import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Warning from '@mui/icons-material/Warning';
import Assignment from '@mui/icons-material/Assignment';
import Flag from '@mui/icons-material/Flag';
import AccessTime from '@mui/icons-material/AccessTime';
import AttachMoney from '@mui/icons-material/AttachMoney';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Comment from '@mui/icons-material/Comment';
import AttachFile from '@mui/icons-material/AttachFile';
import { CalendarSummary } from './types';

interface CardDef {
  label: string;
  key: keyof CalendarSummary;
  icon: React.ReactNode;
  color: string;
  format?: (v: number) => string;
}

const CARDS: CardDef[] = [
  { label: 'Total Tasks',        key: 'totalTasks',        icon: <Assignment />,            color: '#4f46e5' },
  { label: 'Completed',          key: 'completedTasks',    icon: <CheckCircle />,           color: '#10b981' },
  { label: 'Pending',            key: 'pendingTasks',      icon: <RadioButtonUnchecked />,  color: '#f59e0b' },
  { label: 'Overdue',            key: 'overdueTasks',      icon: <Warning />,               color: '#ef4444' },
  { label: 'Milestones',         key: 'milestones',        icon: <Flag />,                  color: '#d97706' },
  { label: 'Hours Logged',       key: 'hoursLogged',       icon: <AccessTime />,            color: '#3b82f6', format: (v) => `${v}h` },
  { label: 'Budget Used',        key: 'budgetUsed',        icon: <AttachMoney />,           color: '#0d9488', format: (v) => `$${v.toLocaleString()}` },
  { label: 'Budget Remaining',   key: 'budgetRemaining',   icon: <AccountBalanceWallet />,  color: '#059669', format: (v) => `$${v.toLocaleString()}` },
  { label: 'Comments',           key: 'commentsThisMonth', icon: <Comment />,               color: '#8b5cf6' },
  { label: 'Files Uploaded',     key: 'filesUploaded',     icon: <AttachFile />,            color: '#6366f1' },
];

interface Props {
  summary: CalendarSummary;
}

const SummaryCards: React.FC<Props> = ({ summary }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 2,
        mb: 3,
      }}
    >
      {CARDS.map(({ label, key, icon, color, format }) => (
        <Card
          key={key}
          sx={{
            p: 2,
            borderRadius: 3,
            borderTop: `3px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              mb: 0.5,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { fontSize: 'small' })}
          </Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {format ? format(summary[key] as number) : summary[key]}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </Card>
      ))}
    </Box>
  );
};

export default SummaryCards;
