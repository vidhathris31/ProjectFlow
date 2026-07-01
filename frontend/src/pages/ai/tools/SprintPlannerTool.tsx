import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Stack, Typography, Grid } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../../services/ai.service';
import AIResultDisplay from '../components/AIResultDisplay';
import AILoadingSkeleton from '../components/AILoadingSkeleton';

const PLACEHOLDER = `e.g.
Launch a customer-facing analytics dashboard with real-time charts, CSV export,
and role-based access control. Must integrate with the existing auth system.`;

const SprintPlannerTool: React.FC = () => {
  const [goals, setGoals] = useState('');
  const [teamSize, setTeamSize] = useState<string>('');
  const [sprintLength, setSprintLength] = useState<string>('');

  const mutation = useMutation({
    mutationFn: () =>
      aiService.generateSprintPlan(
        goals.trim(),
        teamSize ? Number(teamSize) : undefined,
        sprintLength ? Number(sprintLength) : undefined
      ),
  });

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Describe your project goals and the AI Sprint Planner will break the work into tasks,
        estimate effort, assign priorities, and propose a timeline.
      </Typography>

      <TextField
        label="Project goals"
        placeholder={PLACEHOLDER}
        multiline
        minRows={6}
        maxRows={14}
        fullWidth
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Team size (optional)"
            type="number"
            fullWidth
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Sprint length in days (optional)"
            type="number"
            fullWidth
            value={sprintLength}
            onChange={(e) => setSprintLength(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Grid>
      </Grid>

      <Box>
        <Button
          variant="contained"
          startIcon={<EventNoteIcon />}
          disabled={!goals.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Planning…' : 'Generate Sprint Plan'}
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

export default SprintPlannerTool;
