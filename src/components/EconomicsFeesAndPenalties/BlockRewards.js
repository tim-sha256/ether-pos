import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

function BlockRewards() {
  const [validator, setValidator] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [reward, setReward] = useState({ base: 0, priorityFees: 0, total: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const selectedValidatorID = localStorage.getItem('selectedValidatorID');
      console.log('Selected Validator ID:', selectedValidatorID, typeof selectedValidatorID);

      const validators = JSON.parse(localStorage.getItem('validators') || '[]');
      console.log('Validators:', validators);

      const proposedBlock = JSON.parse(localStorage.getItem('proposedBlock') || '{}');
      console.log('Proposed Block:', proposedBlock);

      const proposedBlockTransactions = JSON.parse(localStorage.getItem('proposedBlockTransactions') || '[]');
      console.log('Proposed Block Transactions:', proposedBlockTransactions);

      // Find selected validator
      let selectedValidator;
      if (selectedValidatorID !== null) {
        selectedValidator = validators.find(v => v.id.toString() === selectedValidatorID.toString());
      }
      console.log('Selected Validator:', selectedValidator);

      if (!selectedValidator) {
        throw new Error(`Selected validator not found. ID: ${selectedValidatorID}, Validators: ${JSON.stringify(validators)}`);
      }
      setValidator(selectedValidator);

      // Retrieve proposed block data
      if (!proposedBlock.blockNumber) {
        throw new Error('Proposed block data is missing');
      }
      setBlockData({ ...proposedBlock, transactions: proposedBlockTransactions });

      // Calculate block reward based on proposed block data
      const FINALITY_REWARD_COEFFICIENT = 3 / 1000000000;
      const BLOCK_TIME = 4;
      const totalValidatingEther = 4045;
      const PROPOSAL_REWARD_COEFFICIENT = FINALITY_REWARD_COEFFICIENT * 1000;
      const baseReward = PROPOSAL_REWARD_COEFFICIENT * BLOCK_TIME * totalValidatingEther;
      const priorityFees = proposedBlockTransactions.reduce((acc, tx) => acc + (parseFloat(tx.fee) || 0), 0);
      const totalReward = baseReward + priorityFees;

      setReward({
        base: baseReward,
        priorityFees: priorityFees,
        total: totalReward
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    }
  };

  const renderRewardFlow = () => {
    if (!blockData || !reward) return null;
  
    const totalFees = reward.priorityFees + reward.base;
    const burnedFees = reward.base;
  
    return (
      <Box sx={{ position: 'relative', height: 300, width: '100%', mt: 4 }}>
        <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
          <circle cx="50" cy="150" r="40" fill="#4CAF50" />
          <text x="50" y="150" textAnchor="middle" fill="white" dy=".3em">Block</text>
  
          <circle cx="750" cy="75" r="40" fill="#FFC107" />
          <text x="750" y="75" textAnchor="middle" fill="white" dy=".3em">Validator</text>
  
          <circle cx="750" cy="225" r="40" fill="#F44336" />
          <text x="750" y="225" textAnchor="middle" fill="white" dy=".3em">Burn</text>
  
          <line x1="90" y1="150" x2="710" y2="75" stroke="green" strokeWidth="2" />
          <text x="400" y="100" textAnchor="middle" fill="green">{`${reward.priorityFees.toFixed(4)} ETH (Priority Fees)`}</text>
  
          <line x1="90" y1="150" x2="710" y2="225" stroke="red" strokeWidth="2" />
          <text x="400" y="200" textAnchor="middle" fill="red">{`${burnedFees.toFixed(4)} ETH (Burned Fees)`}</text>
  
          <line x1="90" y1="150" x2="710" y2="150" stroke="blue" strokeWidth="2" strokeDasharray="5,5" />
          <text x="400" y="140" textAnchor="middle" fill="blue">{`${totalFees.toFixed(4)} ETH (Total Fees)`}</text>
        </svg>
      </Box>
    );
  };

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!validator || !blockData) {
    return <Typography>Loading reward data... Please make sure you have completed previous steps.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Block Rewards
      </Typography>
      <Typography variant="body1" paragraph>
        In Ethereum's Proof of Stake system, block rewards incentivize validators to participate in the network and maintain its security.
        Here, we'll explore how much the selected validator earned from proposing the block.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Validator Reward Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Validator ID:</strong> {validator.id}</Typography>
            <Typography><strong>Withdrawal Address:</strong> {validator.withdrawalAddress}</Typography>
            <Typography><strong>Stake:</strong> {validator.stake} ETH</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Block Number:</strong> {blockData.blockNumber}</Typography>
            <Typography><strong>Number of Transactions:</strong> {blockData.transactions.length}</Typography>
            <Typography><strong>Total Gas Used:</strong> {blockData.gasUsed} Gwei</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Block Reward Details
        </Typography>
        <Typography variant="body1">
          The validator earned the following rewards for proposing the block:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Box sx={{ p: 2, backgroundColor: '#e0f7fa', borderRadius: '8px', mr: 3 }}>
            <Typography variant="h3" color="primary">
              {reward.total.toFixed(4)} ETH
            </Typography>
          </Box>
          <Typography variant="body1">
            The total reward includes a base reward of <InlineMath math={`0.04854 \text{ ETH}`} /> plus priority fees collected from the proposed block.
          </Typography>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2">
          <strong>Reward Calculation:</strong>
          <br />
          <BlockMath>
            {`
              \\text{BASE\\_REWARD} = \\frac{3}{1000000000} \\times 1000 \\times 4 \\times 4045 = 0.04854 \\text{ ETH}
            `}
          </BlockMath>
          <br />
          Priority Fees: <InlineMath math={`${reward.priorityFees.toFixed(4)} \\text{ ETH}`} />
          <br />
          Total Reward: <InlineMath math={`0.04854 + ${reward.priorityFees.toFixed(4)} = ${reward.total.toFixed(4)} \\text{ ETH}`} />
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Reward Flow</Typography>
        {renderRewardFlow()}
      </Paper>
    </Box>
  );
}

export default BlockRewards;
