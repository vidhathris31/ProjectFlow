import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Stack, Typography } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../../services/ai.service';
import AIResultDisplay from '../components/AIResultDisplay';
import AILoadingSkeleton from '../components/AILoadingSkeleton';

const PLACEHOLDER = `e.g.
Backend: Node/Express + Mongoose, no automated tests, several controllers
directly query the DB with no service layer. Frontend: React 19, some class
components mixed with hooks, a few dependencies are 2+ major versions behind...

(You can also paste actual code here for a more targeted scan.)`;

const TechDebtScannerTool: React.FC = () => {
  const [context, setContext] = useState('');

  const mutation = useMutation({
    mutationFn: () => aiService.scanTechDebt(context.trim()),
  });

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Describe your codebase or architecture (or paste code) to get a technical debt
        assessment with ranked refactoring priorities.
      </Typography>

      <TextField
        label="Codebase / architecture description"
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
          startIcon={<BugReportIcon />}
          disabled={!context.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Scanning…' : 'Scan Tech Debt'}
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

export default TechDebtScannerTool;
