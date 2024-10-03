import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme, useMediaQuery } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { sha3_256 } from 'js-sha3';

function StakingOverview() {
  const [stake, setStake] = useState(0);
  const [validators, setValidators] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    // Generate 15 random validators on component mount
    const generateValidators = () => {
      return Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        stake: Math.floor(Math.random() * (500 - 32) + 32), // Random stake between 32 and 500 ETH
        validationCode: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`,
        randaoCommitment: `0x${sha3_256(Math.random().toString()).substring(0, 64)}`,
        withdrawalAddress: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`
      }));
    };

    setValidators(generateValidators());
  }, []);

  const handleInputChange = (e) => {
    setStake(parseFloat(e.target.value) || 0);
  };

  // Add user as the 16th validator if staking amount is > 0
  const userValidator = stake > 0 ? {
    id: validators.length + 1,
    stake: stake,
    validationCode: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`,
    randaoCommitment: `0x${sha3_256(Math.random().toString()).substring(0, 64)}`,
    withdrawalAddress: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`
  } : null;

  const allValidators = userValidator ? [...validators, userValidator] : validators;

  const totalStaked = allValidators.reduce((acc, val) => acc + val.stake, 0);

  // Pie chart data
  const pieData = allValidators.map((validator) => ({
    name: `v${validator.id}`,
    value: validator.stake,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF67A1', '#FF6D00', '#A2FF67', '#67F7FF', '#FFD700'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${pieData[index].name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 600, p: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Staking Overview
          </Typography>
          <TextField
            label="Amount of ETH to Stake"
            type="number"
            value={stake}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <Typography variant="body1">
            You have staked: <strong>{stake} ETH</strong>
          </Typography>
          <Typography variant="body2" color={stake >= 32 ? "success.main" : "error.main"}>
            {stake >= 32 ? 'Congratulations! You are eligible to be a validator.' : 'You need at least 32 ETH to be eligible as a validator.'}
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ width: '100%', maxWidth: 800, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Validator ID</TableCell>
              <TableCell>Validation Code</TableCell>
              <TableCell>Randao Commitment</TableCell>
              <TableCell>Withdrawal Address</TableCell>
              <TableCell>Stake (ETH)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allValidators.map((validator) => (
              <TableRow key={validator.id}>
                <TableCell>{validator.id}</TableCell>
                <TableCell>{validator.validationCode.substring(0, 10)}...</TableCell>
                <TableCell>{validator.randaoCommitment.substring(0, 10)}...</TableCell>
                <TableCell>{validator.withdrawalAddress.substring(0, 10)}...</TableCell>
                <TableCell>{validator.stake}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ width: '100%', height: 600, maxWidth: 900, minWidth: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderCustomizedLabel}
              outerRadius={isSmallScreen ? 120 : 225}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label value="Validator Stakes" position="center" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default StakingOverview;