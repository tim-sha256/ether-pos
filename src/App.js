import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Introduction from './components/Introduction';
import StakingOverview from './components/StakingOverview/StakingOverviewMain';
import ValidatorSelection from './components/ValidatorSelection/ValidatorSelection';
import BlockCreation from './components/BlockCreation/BlockCreation';
import FinalityAndChainSelection from './components/FinalityAndChainSelection/FinalityAndChainSelection';
import EconomicsFeesAndPenalties from './components/EconomicsFeesAndPenalties/EconomicsFeesAndPenalties';
import LightClientSyncing from './components/LightClientSyncing';
import ShardingAndCrossShard from './components/ShardingAndCrossShard';
import Conclusion from './components/Conclusion';

const navItems = [
  { name: 'Introduction', path: '/introduction' },
  { name: 'Staking Overview', path: '/staking-overview' },
  { name: 'Validator Selection', path: '/validator-selection' },
  { name: 'Block Creation', path: '/block-creation' },
  { name: 'Finality & Chain Selection', path: '/finality-and-chain-selection' },
  { name: 'Economics, Fees & Penalties', path: '/economics-fees-and-penalties' },
  { name: 'Light Client Syncing', path: '/light-client-syncing' },
  { name: 'Sharding & Cross-Shard', path: '/sharding-and-cross-shard' },
  { name: 'Conclusion and Reference List', path: '/conclusion' },
];

function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleStakingOverviewNavigation = () => {
    if (window.confirm("Are you sure you want to start over? This will reset all your progress.")) {
      window.location.href = '/';
    }
    setDrawerOpen(false);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.name} component={Link} to={item.path}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ethereum PoS MVP
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <Box sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/introduction" replace />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/staking-overview" element={<StakingOverview />} />
          <Route path="/validator-selection" element={<ValidatorSelection />} />
          <Route path="/block-creation" element={<BlockCreation />} />
          <Route path="/finality-and-chain-selection" element={<FinalityAndChainSelection />} />
          <Route path="/economics-fees-and-penalties" element={<EconomicsFeesAndPenalties />} />
          <Route path="/light-client-syncing" element={<LightClientSyncing />} />
          <Route path="/sharding-and-cross-shard" element={<ShardingAndCrossShard />} />
          <Route path="/conclusion" element={<Conclusion />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
