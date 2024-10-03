import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import StakingOverview from './components/StakingOverview';
import ValidatorSelection from './components/ValidatorSelection';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ethereum PoS MVP
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Staking Overview
          </Button>
          <Button color="inherit" component={Link} to="/validator-selection">
            Validator Selection
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4, mb: 4 }}> {/* Added mb: 4 for bottom margin */}
        <Routes>
          <Route path="/" element={<StakingOverview />} />
          <Route path="/validator-selection" element={<ValidatorSelection />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
