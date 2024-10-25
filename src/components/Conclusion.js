import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import sidebarContent from '../sidebarContent_new.json'; // Updated import

function Conclusion() {
  const content = sidebarContent.Section_Conclusion; // Updated to use Section_Conclusion

  const renderContent = (contentArray) => {
    return contentArray.map((item, index) => {
      if (typeof item === 'string') {
        return (
          <Typography key={index} paragraph>
            {item}
          </Typography>
        );
      } else if (item.type === 'list') {
        return (
          <ul key={index}>
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex}>
                <Typography variant="body1">{listItem}</Typography>
              </li>
            ))}
          </ul>
        );
      } else if (item.type === 'orderedList') {
        return (
          <ol key={index}>
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex}>
                <Typography variant="body1">{listItem}</Typography>
              </li>
            ))}
          </ol>
        );
      }
      return null;
    });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ width: '70%', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {content.title}
        </Typography>
        {renderContent(content.content)}
      </Paper>
    </Box>
  );
}

export default Conclusion;
