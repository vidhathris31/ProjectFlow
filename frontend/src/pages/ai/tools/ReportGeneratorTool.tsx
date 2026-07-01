import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Stack, Typography, MenuItem, Grid } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useMutation } from '@tanstack/react-query';
import { aiService, ReportType } from '../../../services/ai.service';
import AIResultDisplay from '../components/AIResultDisplay';
import AILoadingSkeleton from '../components/AILoadingSkeleton';

const REPORT_TYPES: ReportType[] = [
  'Project Status Report',
  'Sprint Summary',
  'Weekly Progress Report',
  'Risk Analysis Report',
  'Team Productivity Report',
  'Executive Summary',
];

const PLACEHOLDER = `e.g.
Project: Mobile App Revamp
Status: In progress, 65% complete, on track for the 20th
Key wins: New onboarding flow shipped, crash rate down 40%
Risks: App Store review may add a 5-7 day delay
Team: 6 members, 2 on PTO next week...`;

const ReportGeneratorTool: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('Project Status Report');
  const [context, setContext] = useState('');

  const mutation = useMutation({
    mutationFn: () => aiService.generateReport(reportType, context.trim()),
  });

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Pick a report type and provide the relevant project data — the AI will draft a
        polished, stakeholder-ready report.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Report type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            fullWidth
          >
            {REPORT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <TextField
        label="Project data"
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
          startIcon={<DescriptionIcon />}
          disabled={!context.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Generating…' : 'Generate Report'}
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

export default ReportGeneratorTool;
