import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import sidebarContent from '../sidebarContent.json';

function Conclusion() {
  const content = sidebarContent.conclusion;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ width: '70%', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {content.title}
        </Typography>
        {content.content.map((paragraph, index) => (
          <Typography key={index} paragraph>
            {paragraph}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
}

export default Conclusion;
