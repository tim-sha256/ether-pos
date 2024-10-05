import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import sha256 from 'js-sha256';

function BlockProposal({ validator, transactions, onPropose }) {
  const [proposedBlock, setProposedBlock] = useState(null);

  useEffect(() => {
    if (validator && transactions.length > 0) {
      const block = createBlock(validator, transactions);
      setProposedBlock(block);
      onPropose(block);
    }
  }, [validator, transactions, onPropose]);

  const createBlock = (validator, transactions) => {
    const blockNumber = Math.floor(Math.random() * 1000000); // Mock block number
    const timestamp = Date.now();
    const parentHash = '0x' + sha256(Math.random().toString()).slice(0, 64);
    const stateRoot = '0x' + sha256(Math.random().toString()).slice(0, 64);
    const gasUsed = transactions.reduce((sum, tx) => sum + tx.gasUsed, 0);
    const gasLimit = 30000000;

    return {
      blockNumber,
      timestamp,
      hash: '0x' + sha256(blockNumber + timestamp + parentHash + stateRoot).slice(0, 64),
      parentHash,
      stateRoot,
      gasUsed,
      gasLimit,
      feeRecipient: validator.address,
      transactions
    };
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Block Proposal</Typography>
      {proposedBlock ? (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Proposed Block</Typography>
          <Typography>Block Number: {proposedBlock.blockNumber}</Typography>
          <Typography>Timestamp: {new Date(proposedBlock.timestamp).toLocaleString()}</Typography>
          <Typography>Hash: {proposedBlock.hash}</Typography>
          <Typography>Parent Hash: {proposedBlock.parentHash}</Typography>
          <Typography>State Root: {proposedBlock.stateRoot}</Typography>
          <Typography>Gas Used: {proposedBlock.gasUsed}</Typography>
          <Typography>Gas Limit: {proposedBlock.gasLimit}</Typography>
          <Typography>Fee Recipient: {proposedBlock.feeRecipient}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Transactions</Typography>
          <List>
            {proposedBlock.transactions.map((tx, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Transaction ${index + 1}`}
                  secondary={`From: ${tx.from.slice(0, 10)}... To: ${tx.to.slice(0, 10)}... Value: ${tx.value} ETH`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography>Preparing block proposal...</Typography>
      )}
    </Box>
  );
}

export default BlockProposal;