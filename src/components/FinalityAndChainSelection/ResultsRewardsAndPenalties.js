import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ResultsRewardsAndPenalties() {
  const [bettingResults, setBettingResults] = useState(null);
  const [validators, setValidators] = useState([]);
  const [stakeChanges, setStakeChanges] = useState([]);

  useEffect(() => {
    const storedBettingResults = JSON.parse(localStorage.getItem('bettingResults') || '{}');
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    setBettingResults(storedBettingResults);
    setValidators(storedValidators);

    // Calculate stake changes for the bar chart
    const changes = storedValidators.map(validator => {
      const betResult = storedBettingResults.validators.find(v => v.validatorId === validator.id);
      const initialStake = validator.stake;
      const isProposedChain = betResult?.chain === storedBettingResults.finalizedChain;
      const change = isProposedChain ? betResult?.vGain : -betResult?.vLoss;
      const finalStake = initialStake + change;
      return {
        id: validator.id,
        initialStake,
        finalStake,
        change,
        isProposedChain
      };
    });
    setStakeChanges(changes);
  }, []);

  const renderBettingResultBox = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Betting Result</Typography>
      <Typography>
        The {bettingResults?.finalizedChain} chain was finalized with a supermajority of 
        {' '}{((bettingResults?.proposedChainStake / (bettingResults?.proposedChainStake + bettingResults?.competingChainStake)) * 100).toFixed(2)} % 
        of the stake. The competing chain received 
        {' '}{((bettingResults?.competingChainStake / (bettingResults?.proposedChainStake + bettingResults?.competingChainStake)) * 100).toFixed(2)} % 
        of the stake.
      </Typography>
      {/* Add blockchain visualization here */}
    </Paper>
  );

  const renderStakeChangesChart = () => {
    return (
      <Box sx={{ height: 400, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stakeChanges}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
                      <p>{`Validator ID: ${data.id}`}</p>
                      <p>{`Initial Stake: ${data.initialStake.toFixed(4)} ETH`}</p>
                      <p>{`Change: ${data.change.toFixed(4)} ETH`}</p>
                      <p>{`Final Stake: ${data.finalStake.toFixed(4)} ETH`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="initialStake" stackId="a" fill="#8884d8" />
            <Bar 
              dataKey="change" 
              stackId="a" 
              fill={(data) => (data.change >= 0 ? "#82ca9d" : "#ff7f7f")}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderValidatorSummaryTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Validator ID</TableCell>
            <TableCell>Initial Stake</TableCell>
            <TableCell>Bet Amount</TableCell>
            <TableCell>Reward/Penalty</TableCell>
            <TableCell>Final Stake</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {validators.map(validator => {
            const betResult = bettingResults?.validators.find(v => v.validatorId === validator.id);
            const initialStake = validator.stake;
            const betAmount = betResult?.vLoss || 0;
            const isProposedChain = betResult?.chain === bettingResults?.finalizedChain;
            const rewardPenalty = isProposedChain ? betResult?.vGain : -betResult?.vLoss;
            const finalStake = initialStake + rewardPenalty;

            return (
              <TableRow key={validator.id}>
                <TableCell>{validator.id}</TableCell>
                <TableCell>{initialStake.toFixed(4)} ETH</TableCell>
                <TableCell>{betAmount.toFixed(4)} ETH</TableCell>
                <TableCell>{rewardPenalty.toFixed(4)} ETH</TableCell>
                <TableCell>{finalStake.toFixed(4)} ETH</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Results, Rewards, and Penalties</Typography>
      {renderBettingResultBox()}
      <Typography variant="h6" gutterBottom>Stake Changes</Typography>
      {renderStakeChangesChart()}
      <Typography variant="h6" gutterBottom>Validator Summary</Typography>
      {renderValidatorSummaryTable()}
    </Box>
  );
}

export default ResultsRewardsAndPenalties;
