import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import sidebarContent from '../sidebarContent_new.json';

function Introduction() {
  const content = sidebarContent.Section_Introduction;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ width: '70%', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {content.title}
        </Typography>
        <ReactMarkdown rehypePlugins={[rehypeKatex]}>
          {content.content.join('\n\n')}
        </ReactMarkdown>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button component={Link} to="/staking-overview" variant="contained" color="primary">
            Start
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Introduction;
