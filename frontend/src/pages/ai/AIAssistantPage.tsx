import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Fade,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import CodeIcon from '@mui/icons-material/Code';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BugReportIcon from '@mui/icons-material/BugReport';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import AIAnalystTool from './tools/AIAnalystTool';
import CodeReviewTool from './tools/CodeReviewTool';
import BurndownAITool from './tools/BurndownAITool';
import SprintPlannerTool from './tools/SprintPlannerTool';
import TechDebtScannerTool from './tools/TechDebtScannerTool';
import ReportGeneratorTool from './tools/ReportGeneratorTool';

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  component: React.ReactNode;
}

const TOOLS: AITool[] = [
  {
    id: 'analyst',
    title: 'AI Analyst',
    description: 'Project health, bottlenecks, high-risk tasks, and productivity insights.',
    icon: <InsightsIcon />,
    color: '#4f46e5',
    component: <AIAnalystTool />,
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Paste code to catch bugs, code smells, and get best-practice suggestions.',
    icon: <CodeIcon />,
    color: '#0ea5e9',
    component: <CodeReviewTool />,
  },
  {
    id: 'burndown',
    title: 'Burndown AI',
    description: 'Sprint progress analysis, completion predictions, and recovery plans.',
    icon: <TrendingDownIcon />,
    color: '#f59e0b',
    component: <BurndownAITool />,
  },
  {
    id: 'sprint-planner',
    title: 'Sprint Planner',
    description: 'Turn project goals into a task breakdown with estimates and priorities.',
    icon: <EventNoteIcon />,
    color: '#10b981',
    component: <SprintPlannerTool />,
  },
  {
    id: 'tech-debt',
    title: 'Tech Debt Scanner',
    description: 'Spot risky or outdated areas and get ranked refactoring priorities.',
    icon: <BugReportIcon />,
    color: '#ef4444',
    component: <TechDebtScannerTool />,
  },
  {
    id: 'report-generator',
    title: 'AI Report Generator',
    description: 'Generate polished status, sprint, risk, and executive-ready reports.',
    icon: <DescriptionIcon />,
    color: '#8b5cf6',
    component: <ReportGeneratorTool />,
  },
];

const AIAssistantPage: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const activeTool = TOOLS.find((t) => t.id === activeToolId) || null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #4f46e5 0%, #9c27b0 100%)',
          }}
        >
          <AutoAwesomeIcon />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            AI Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered tools to help you plan, analyze, and ship faster.
          </Typography>
        </Box>
      </Box>

      {activeTool && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => setActiveToolId(null)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 14 }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} /> AI Assistant
          </Link>
          <Typography color="text.primary" sx={{ fontSize: 14, fontWeight: 600 }}>
            {activeTool.title}
          </Typography>
        </Breadcrumbs>
      )}

      {!activeTool && (
        <Fade in>
          <Grid container spacing={2.5}>
            {TOOLS.map((tool) => (
              <Grid item xs={12} sm={6} md={4} key={tool.id}>
                <Card
                  className="hover-lift"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                >
                  <CardActionArea
                    onClick={() => setActiveToolId(tool.id)}
                    sx={{ height: '100%', p: 0.5 }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${tool.color}1a`,
                          color: tool.color,
                          width: 44,
                          height: 44,
                          mb: 1.5,
                        }}
                      >
                        {tool.icon}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {tool.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {tool.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {activeTool && (
        <Fade in key={activeTool.id}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <IconButton
                onClick={() => setActiveToolId(null)}
                size="small"
                sx={{ bgcolor: 'action.hover' }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Avatar
                sx={{
                  bgcolor: `${activeTool.color}1a`,
                  color: activeTool.color,
                  width: 36,
                  height: 36,
                }}
              >
                {activeTool.icon}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {activeTool.title}
              </Typography>
            </Box>
            {activeTool.component}
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default AIAssistantPage;
