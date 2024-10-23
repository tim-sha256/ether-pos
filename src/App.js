import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import StakingOverview from './components/StakingOverview';
import ValidatorSelection from './components/ValidatorSelection';
import BlockCreation from './components/BlockCreation';
import FinalityAndChainSelection from './components/FinalityAndChainSelection';
import EconomicsFeesAndPenalties from './components/EconomicsFeesAndPenalties/EconomicsFeesAndPenalties';
import LightClientSyncing from './components/LightClientSyncing';
import ShardingAndCrossShard from './components/ShardingAndCrossShard';

function Navigation() {
  const handleStakingOverviewNavigation = () => {
    if (window.confirm("Are you sure you want to start over? This will reset all your progress.")) {
      window.location.href = '/';
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Ethereum PoS MVP
        </Typography>
        <Button color="inherit" onClick={handleStakingOverviewNavigation}>
          Staking Overview
        </Button>
        <Button color="inherit" component={Link} to="/validator-selection">
          Validator Selection
        </Button>
        <Button color="inherit" component={Link} to="/block-creation">
          Block Creation
        </Button>
        <Button color="inherit" component={Link} to="/finality-and-chain-selection">
          Finality & Chain Selection
        </Button>
        <Button color="inherit" component={Link} to="/economics-fees-and-penalties">
          Economics, Fees & Penalties
        </Button>
        <Button color="inherit" component={Link} to="/light-client-syncing">
          Light Client Syncing
        </Button>
        <Button color="inherit" component={Link} to="/sharding-and-cross-shard">
          Sharding & Cross-Shard
        </Button>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <Box sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<StakingOverview />} />
          <Route path="/validator-selection" element={<ValidatorSelection />} />
          <Route path="/block-creation" element={<BlockCreation />} />
          <Route path="/finality-and-chain-selection" element={<FinalityAndChainSelection />} />
          <Route path="/economics-fees-and-penalties" element={<EconomicsFeesAndPenalties />} />
          <Route path="/light-client-syncing" element={<LightClientSyncing />} />
          <Route path="/sharding-and-cross-shard" element={<ShardingAndCrossShard />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
