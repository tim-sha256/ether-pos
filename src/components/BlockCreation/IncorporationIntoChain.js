import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import { motion } from 'framer-motion';

function IncorporationIntoChain({ proposedBlock, attestedValidators }) {
  const [aggregatedBlock, setAggregatedBlock] = useState(null);
  const [incorporationStatus, setIncorporationStatus] = useState('pending');

  useEffect(() => {
    // Simulate block aggregation
    const timer = setTimeout(() => {
      const aggregated = {
        ...proposedBlock,
        attestations: attestedValidators.filter(v => v.approved).length,
        finalizedAt: new Date().toISOString()
      };
      setAggregatedBlock(aggregated);
    }, 2000);

    return () => clearTimeout(timer);
  }, [proposedBlock, attestedValidators]);

  const handleIncorporation = () => {
    // Simulate incorporation process
    setIncorporationStatus('in_progress');
    setTimeout(() => {
      setIncorporationStatus('completed');
    }, 3000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <Typography variant="h5" gutterBottom>Incorporation into Chain</Typography>
      
      {aggregatedBlock && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 4, width: '100%' }}>
          <Typography variant="h6" gutterBottom>Aggregated Block Details</Typography>
          <List>
            <ListItem>
              <ListItemText primary="Block Number" secondary={aggregatedBlock.blockNumber} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Block Hash" secondary={aggregatedBlock.hash} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attestations" secondary={aggregatedBlock.attestations} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Finalized At" secondary={aggregatedBlock.finalizedAt} />
            </ListItem>
          </List>
        </Paper>
      )}
      
      <Paper elevation={3} sx={{ p: 2, mt: 2, width: '100%' }}>
        <Typography variant="h6" gutterBottom>Incorporation Process</Typography>
        <Typography variant="body1">
          The aggregated block is now ready to be incorporated into the blockchain. This process involves:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="1. Verifying the block's integrity" />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. Updating the local chain state" />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. Broadcasting the new block to other nodes" />
          </ListItem>
        </List>
        {incorporationStatus === 'pending' && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleIncorporation}
            sx={{ mt: 2 }}
          >
            Start Incorporation
          </Button>
        )}
        {incorporationStatus === 'in_progress' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="body1" color="info.main" sx={{ mt: 2 }}>
              Incorporation in progress...
            </Typography>
          </motion.div>
        )}
        {incorporationStatus === 'completed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
              Block successfully incorporated into the chain!
            </Typography>
          </motion.div>
        )}
      </Paper>
    </Box>
  );
}

export default IncorporationIntoChain;