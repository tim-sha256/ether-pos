return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      width: '95%',  // Changed from 90% to 95%
      maxWidth: '1600px',
      margin: '0 auto', 
      mt: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ 
        width: { xs: '100%', md: '30%' },  // Changed from 25% to 30%
        mb: { xs: 4, md: 0 }, 
        mr: { md: 4 } 
      }}>
        {renderSidebar()}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '70%' } }}>  // Changed from 75% to 70%
        {/* ... rest of the content ... */}
      </Box>
    </Box>
); 