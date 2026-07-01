import React from 'react';
import { Tooltip } from '@mui/material';

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
}

const ActivityTooltip: React.FC<Props> = ({ title, children }) => (
  <Tooltip title={title} arrow placement="top" enterDelay={300}>
    {children}
  </Tooltip>
);

export default ActivityTooltip;
