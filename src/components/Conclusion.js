import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import sidebarContent from '../sidebarContent_new.json';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

function Conclusion() {
  const renderContent = (content) => {
    if (!content) return null;
    
    // Convert array of content items to markdown string
    const markdownContent = content.map(item => {
      if (typeof item === 'string') {
        return item;
      } else if (item.type === 'list') {
        return item.items.map(listItem => `- ${listItem}`).join('\n');
      } else if (item.type === 'orderedList') {
        return item.items.map((listItem, index) => `${index + 1}. ${listItem}`).join('\n');
      } else if (item.type === 'formula') {
        return `$$${item.content}$$`;
      }
      return '';
    }).join('\n\n');

    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({node, ...props}) => <Typography variant="body1" sx={{ mb: 2 }} {...props} />,
          li: ({node, ...props}) => (
            <li>
              <Typography variant="body1" component="span" {...props} />
            </li>
          ),
          a: ({node, ...props}) => (
            <Typography 
              component="a" 
              sx={{ 
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }} 
              {...props} 
              target="_blank"
              rel="noopener noreferrer"
            />
          )
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    );
  };

  const content = sidebarContent.Section_Conclusion;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      width: '95%',
      maxWidth: '1600px',
      margin: '0 auto', 
      mt: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ 
        width: { xs: '100%', md: '70%' },
        margin: '0 auto'
      }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {content.title}
          </Typography>
          {renderContent(content.content)}
        </Paper>
      </Box>
    </Box>
  );
}

export default Conclusion;
