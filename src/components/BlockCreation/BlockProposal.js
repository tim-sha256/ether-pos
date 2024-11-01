import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Tooltip, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { sha3_256 } from 'js-sha3'; // Import sha3_256 function directly

function BlockProposal({ validator, onPropose }) {
  const [transactions, setTransactions] = useState([]);
  const [proposedBlock, setProposedBlock] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [merkleTree, setMerkleTree] = useState([]);
  const [merkleRoot, setMerkleRoot] = useState(null);
  const [feeRecipient, setFeeRecipient] = useState(null);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('proposedBlockTransactions') || '[]');
    if (storedTransactions.length > 0) {
      setTransactions(storedTransactions);
      setCurrentStep(1);
    }

    const selectedValidatorID = localStorage.getItem('selectedValidatorID');
    const validators = JSON.parse(localStorage.getItem('validators') || '[]');
    const selectedValidator = validators.find(v => v.id.toString() === selectedValidatorID);
    if (selectedValidator) {
      setFeeRecipient(selectedValidator.withdrawalAddress);
    }
  }, []);

  const generateTransactions = () => {
    const numTransactions = Math.floor(Math.random() * 6) + 5; // 5 to 10 transactions
    const newTransactions = [];

    for (let i = 0; i < numTransactions; i++) {
      const transaction = {
        id: i + 1,
        from: '0x' + sha3_256(Math.random().toString()).slice(0, 40),
        to: '0x' + sha3_256(Math.random().toString()).slice(0, 40),
        value: (Math.random() * 9.99 + 0.01).toFixed(2), // 0.01 to 10 ETH
      };
      newTransactions.push(transaction);
    }

    setTransactions(newTransactions);
    localStorage.setItem('proposedBlockTransactions', JSON.stringify(newTransactions));
    setCurrentStep(1);
  };

  const calculateMerkleRoot = () => {
    if (transactions.length === 0) return null;
    if (transactions.length === 1) return transactions[0].hash;

    const tree = [transactions.map(tx => ({ hash: sha3_256(JSON.stringify(tx)) }))];
    
    while (tree[tree.length - 1].length > 1) {
      const currentLevel = tree[tree.length - 1];
      const newLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i].hash;
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1].hash : left;
        const combined = sha3_256(left + right);
        newLevel.push({ hash: combined, left, right });
      }
      tree.push(newLevel);
    }

    setMerkleTree(tree);
    setMerkleRoot('0x' + tree[tree.length - 1][0].hash);
    setCurrentStep(2);
  };

  const createBlock = () => {
    const block = {
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
      parentHash: '0x' + sha3_256(Math.random().toString()).slice(0, 64),
      stateRoot: '0x' + sha3_256(Math.random().toString()).slice(0, 64),
      transactionsRoot: merkleRoot,
      receiptsRoot: '0x' + sha3_256(Math.random().toString()).slice(0, 64),
      withdrawalsRoot: '0x' + sha3_256(Math.random().toString()).slice(0, 64),
      gasUsed: Math.floor(Math.random() * 15000000),
      gasLimit: 30000000,
      feeRecipient: feeRecipient,
      transactions: transactions,
    };

    block.hash = '0x' + sha3_256(JSON.stringify(block)).slice(0, 64);
    setProposedBlock(block);
    localStorage.setItem('proposedBlock', JSON.stringify(block));
    setCurrentStep(3);
    onPropose(block);
  };

  const renderTransactions = () => (
    <AnimatePresence>
      {transactions.map((tx, index) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ListItem>
            <ListItemText
              primary={`Transaction ${tx.id}`}
              secondary={`From: ${tx.from.slice(0, 10)}... To: ${tx.to.slice(0, 10)}... Value: ${tx.value} ETH`}
            />
          </ListItem>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  const renderMerkleTree = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Merkle Tree Calculation</Typography>
        {merkleTree.map((level, levelIndex) => (
          <Box key={levelIndex} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {level.map((node, nodeIndex) => (
              <Tooltip key={nodeIndex} title={`Full Hash: ${node.hash}`} arrow>
                <Box
                  sx={{
                    width: 120,
                    height: 40,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mx: 1,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  {levelIndex === 0 ? `Tx ${nodeIndex + 1}` : `Node ${nodeIndex + 1}`}
                  <Typography variant="caption">{`${node.hash.slice(0, 6)}...${node.hash.slice(-6)}`}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        ))}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Merkle Root: {merkleRoot}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* <Typography variant="h5" gutterBottom>Block Proposal</Typography> */}
      {currentStep === 0 && (
        <Button variant="contained" onClick={generateTransactions}>
          Generate Transactions
        </Button>
      )}
      {currentStep >= 1 && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Transactions</Typography>
          <List>
            {renderTransactions()}
          </List>
          {currentStep === 1 && (
            <Button variant="contained" onClick={calculateMerkleRoot}>
              Calculate Merkle Root
            </Button>
          )}
        </Paper>
      )}
      {currentStep >= 2 && renderMerkleTree()}
      {currentStep === 2 && (
        <Button variant="contained" onClick={createBlock} sx={{ mt: 2 }}>
          Create Block
        </Button>
      )}
      {proposedBlock && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Proposed Block</Typography>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Typography>Block Number: {proposedBlock.blockNumber}</Typography>
            <Typography>Timestamp: {new Date(proposedBlock.timestamp).toLocaleString()}</Typography>
            <Typography>Parent Hash: {proposedBlock.parentHash}</Typography>
            <Typography>State Root: {proposedBlock.stateRoot}</Typography>
            <Typography>Transactions Root: {proposedBlock.transactionsRoot}</Typography>
            <Typography>Receipts Root: {proposedBlock.receiptsRoot}</Typography>
            <Typography>Withdrawals Root: {proposedBlock.withdrawalsRoot}</Typography>
            <Typography>Gas Used: {proposedBlock.gasUsed}</Typography>
            <Typography>Gas Limit: {proposedBlock.gasLimit}</Typography>
            <Typography>Fee Recipient: {proposedBlock.feeRecipient}</Typography>
            <Typography>Block Hash: {proposedBlock.hash}</Typography>
          </motion.div>
        </Paper>
      )}
    </Box>
  );
}

export default BlockProposal;
