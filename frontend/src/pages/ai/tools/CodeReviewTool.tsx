import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
  MenuItem,
  Grid,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../../../services/ai.service';
import AIResultDisplay from '../components/AIResultDisplay';
import AILoadingSkeleton from '../components/AILoadingSkeleton';

const LANGUAGES = [
  'Auto-detect',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Go',
  'Ruby',
  'PHP',
  'SQL',
];

const CodeReviewTool: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');

  const mutation = useMutation({
    mutationFn: () => aiService.reviewCode(code.trim(), language),
  });

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Paste a code snippet for an instant review — bugs, code smells, and best-practice
        suggestions, explained clearly.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            fullWidth
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <TextField
        label="Code to review"
        placeholder="Paste your code here…"
        multiline
        minRows={10}
        maxRows={20}
        fullWidth
        value={code}
        onChange={(e) => setCode(e.target.value)}
        sx={{ '& textarea': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13.5 } }}
      />

      <Box>
        <Button
          variant="contained"
          startIcon={<CodeIcon />}
          disabled={!code.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Reviewing…' : 'Review Code'}
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

export default CodeReviewTool;
