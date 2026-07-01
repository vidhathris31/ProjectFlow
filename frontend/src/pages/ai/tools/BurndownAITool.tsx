import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Stack, Typography } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../../services/ai.service';
import AIResultDisplay from '../components/AIResultDisplay';
import AILoadingSkeleton from '../components/AILoadingSkeleton';

const PLACEHOLDER = `e.g.
Sprint: Sprint 14 (10 working days, day 6 today)
Total story points: 42
Completed: 22
In progress: 12 (of which 4 have had no updates in 3+ days)
Not started: 8
Notable blockers: waiting on 3rd-party API credentials...`;

const BurndownAITool: React.FC = () => {
  const [context, setContext] = useState('');

  const mutation = useMutation({
    mutationFn: () => aiService.analyzeBurndown(context.trim()),
  });

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Paste your current sprint data — story points, progress, and blockers — to get a burndown
        analysis, a completion prediction, and a recovery plan if you're behind.
      </Typography>

      <TextField
        label="Sprint data"
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
          startIcon={<TrendingDownIcon />}
          disabled={!context.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Analyzing…' : 'Analyze Burndown'}
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

export default BurndownAITool;
