import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

const AILoadingSkeleton: React.FC = () => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
    <Skeleton variant="rounded" width={110} height={24} sx={{ mb: 2, borderRadius: 5 }} />
    <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="95%" />
    <Skeleton variant="text" width="88%" />
    <Skeleton variant="text" width="92%" />
    <Box sx={{ mt: 2 }}>
      <Skeleton variant="text" width="35%" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="85%" />
    </Box>
  </Paper>
);

export default AILoadingSkeleton;
