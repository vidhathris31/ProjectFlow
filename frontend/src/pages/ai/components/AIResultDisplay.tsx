import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Chip, Fade } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface AIResultDisplayProps {
  text: string;
}

/**
 * Renders lightweight markdown-style AI output (##, **, -, numbered lists)
 * without pulling in a full markdown dependency, keeping bundle size small
 * and matching the app's existing MUI-driven visual language.
 */
const renderInline = (line: string, key: React.Key): React.ReactNode => {
  const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
  return (
    <React.Fragment key={key}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Typography key={i} component="strong" sx={{ fontWeight: 700 }}>
            {part.slice(2, -2)}
          </Typography>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </React.Fragment>
  );
};

const AIResultDisplay: React.FC<AIResultDisplayProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const blocks = useMemo(() => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];

    const flushList = (key: string) => {
      if (listBuffer.length === 0) return;
      elements.push(
        <Box component="ul" key={key} sx={{ pl: 3, my: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {listBuffer.map((item, i) => (
            <Typography component="li" variant="body2" key={i} sx={{ lineHeight: 1.7 }}>
              {renderInline(item, i)}
            </Typography>
          ))}
        </Box>
      );
      listBuffer = [];
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();

      if (!line) {
        flushList(`list-${idx}`);
        return;
      }

      if (line.startsWith('## ')) {
        flushList(`list-${idx}`);
        elements.push(
          <Typography key={idx} variant="subtitle1" sx={{ fontWeight: 700, mt: 2.5, mb: 1 }}>
            {renderInline(line.replace(/^##\s+/, ''), idx)}
          </Typography>
        );
      } else if (line.startsWith('# ')) {
        flushList(`list-${idx}`);
        elements.push(
          <Typography key={idx} variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
            {renderInline(line.replace(/^#\s+/, ''), idx)}
          </Typography>
        );
      } else if (/^[-*]\s+/.test(line)) {
        listBuffer.push(line.replace(/^[-*]\s+/, ''));
      } else if (/^\d+\.\s+/.test(line)) {
        listBuffer.push(line.replace(/^\d+\.\s+/, ''));
      } else {
        flushList(`list-${idx}`);
        elements.push(
          <Typography key={idx} variant="body2" sx={{ lineHeight: 1.7, mb: 1 }}>
            {renderInline(line, idx)}
          </Typography>
        );
      }
    });

    flushList('list-end');
    return elements;
  }, [text]);

  return (
    <Fade in>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          position: 'relative',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(129,140,248,0.06)' : 'rgba(79,70,229,0.03)'),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
            label="AI Result"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Tooltip title={copied ? 'Copied!' : 'Copy result'}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{blocks}</Box>
      </Paper>
    </Fade>
  );
};

export default AIResultDisplay;
