import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Card, CardContent, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function IncorporationIntoChain() {
  const [newBlock, setNewBlock] = useState(null);
  const [incorporationStatus, setIncorporationStatus] = useState('pending');
  const [showProcess, setShowProcess] = useState(false);
  const [blockchain, setBlockchain] = useState([]);

  useEffect(() => {
    const proposedBlock = JSON.parse(localStorage.getItem('proposedBlock') || '{}');
    const aggregationData = JSON.parse(localStorage.getItem('blockAggregationData') || '{}');
    const userValidatorData = JSON.parse(localStorage.getItem('userValidatorData') || '{}');

    if (proposedBlock) {
      const newBlockData = {
        ...proposedBlock,
        attestationResults: {
          totalAttestations: aggregationData.totalAttestations,
          approvals: aggregationData.approvals,
          aggregatedCommitment: aggregationData.aggregatedCommitment
        },
        feeRecipient: userValidatorData.selectedValidator?.withdrawalAddress || proposedBlock.feeRecipient
      };
      setNewBlock(newBlockData);

      // Generate previous blocks with correct parent hashes
      const previousBlocks = [];
      for (let i = 3; i >= 1; i--) {
        const block = {
          blockNumber: newBlockData.blockNumber - i,
          hash: i === 1 ? newBlockData.parentHash : `0x${Math.random().toString(36).substr(2, 64)}`,
          parentHash: i === 3 ? `0x${Math.random().toString(36).substr(2, 64)}` : ''
        };
        if (i < 3) {
          block.parentHash = previousBlocks[previousBlocks.length - 1].hash;
        }
        previousBlocks.push(block);
      }
      setBlockchain([...previousBlocks, newBlockData]);
    }
  }, []);

  const handleIncorporation = () => {
    setIncorporationStatus('in_progress');
    setShowProcess(true);
    setTimeout(() => {
      setIncorporationStatus('completed');
      // Save the blockchain to local storage
      const singleChain = [...blockchain];
      localStorage.setItem('singleChain', JSON.stringify(singleChain));
    }, 3000);
  };

  const renderIncorporationProcess = () => {
    const steps = [
      "Verifying the block's integrity",
      "Updating the local chain state",
      "Broadcasting the new block to other nodes"
    ];

    return (
      <AnimatePresence>
        {showProcess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Typography variant="h6" gutterBottom>Incorporation Process</Typography>
            <List>
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.5 }}
                >
                  <ListItem>
                    <ListItemText primary={`${index + 1}. ${step}`} />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderBlockchain = () => {
    return (
      <Grid container spacing={2} alignItems="center">
        {blockchain.map((block, index) => (
          <React.Fragment key={block.blockNumber}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: index === blockchain.length - 1 ? 'success.light' : 'background.paper',
                  transition: 'background-color 0.3s'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>Block {block.blockNumber}</Typography>
                  <Typography variant="body2">Hash: {block.hash.slice(0, 10)}...</Typography>
                  <Typography variant="body2">Parent: {block.parentHash.slice(0, 10)}...</Typography>
                </CardContent>
              </Card>
            </Grid>
            {index < blockchain.length - 1 && (
              <Grid item xs={12} sm={6} md={1}>
                <ArrowForwardIcon />
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      {/* <Typography variant="h5" gutterBottom>Incorporation into Chain</Typography> */}
      
      {newBlock && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 4, width: '100%' }}>
          <Typography variant="h6" gutterBottom>New Block Details</Typography>
          <List>
            <ListItem>
              <ListItemText primary="Block Number" secondary={newBlock.blockNumber} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Block Hash" secondary={newBlock.hash} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Parent Hash" secondary={newBlock.parentHash} />
            </ListItem>
            <ListItem>
              <ListItemText primary="State Root" secondary={newBlock.stateRoot} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transactions Root" secondary={newBlock.transactionsRoot} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Receipts Root" secondary={newBlock.receiptsRoot} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Withdrawals Root" secondary={newBlock.withdrawalsRoot} />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Fee Recipient" 
                secondary={newBlock.feeRecipient} 
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Total Attestations" secondary={newBlock.attestationResults?.totalAttestations || 'N/A'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Approvals" secondary={newBlock.attestationResults?.approvals || 'N/A'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Aggregated Commitment" secondary={newBlock.attestationResults?.aggregatedCommitment || 'N/A'} />
            </ListItem>
          </List>
        </Paper>
      )}
      
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

      {showProcess && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 4, width: '100%' }}>
          {renderIncorporationProcess()}
        </Paper>
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
            Block {newBlock?.blockNumber} has been successfully incorporated into the chain!
          </Typography>
        </motion.div>
      )}

      {incorporationStatus === 'completed' && (
        <Paper elevation={3} sx={{ p: 2, mt: 4, mb: 4, width: '100%' }}>
          <Typography variant="h6" gutterBottom>Blockchain Visualization</Typography>
          {renderBlockchain()}
          {/* <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            The blockchain has been saved to local storage under the key "singleChain".
          </Typography> */}
        </Paper>
      )}
    </Box>
  );
}

export default IncorporationIntoChain;