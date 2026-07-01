import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Stack, Typography } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../../services/ai.service';
import AIResultDisplay from '../components/AIResultDisplay';
import AILoadingSkeleton from '../components/AILoadingSkeleton';

const PLACEHOLDER = `e.g.
Project: Website Redesign
Deadline: 2 weeks
Team: 5 members
Tasks: 24 total — 10 done, 6 in progress, 5 blocked, 3 overdue
Notes: Backend API integration is delayed, waiting on design sign-off...`;

const AIAnalystTool: React.FC = () => {
  const [context, setContext] = useState('');

  const mutation = useMutation({
    mutationFn: () => aiService.analyzeProject(context.trim()),
  });

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Paste a summary of your project — tasks, statuses, deadlines, and team workload — and the
        AI Analyst will assess health, flag bottlenecks, and surface high-risk tasks.
      </Typography>

      <TextField
        label="Project context"
        placeholder={PLACEHOLDER}
        multiline
        minRows={8}
        maxRows={16}
        fullWidth
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />

      <Box>
        <Button
          variant="contained"
          startIcon={<InsightsIcon />}
          disabled={!context.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Analyzing…' : 'Analyze Project'}
        </Button>
      </Box>

      {mutation.isError && (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
          {(mutation.error as any)?.response?.data?.message || 'Something went wrong. Please try again.'}
        </Alert>
      )}

      {mutation.isPending && <AILoadingSkeleton />}
      {mutation.isSuccess && <AIResultDisplay text={mutation.data} />}
    </Stack>
  );
};

export default AIAnalystTool;
