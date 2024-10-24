import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Label } from 'recharts';

function StepSummary({
  validators,
  allValidators,
  pieData,
  COLORS,
  renderCustomizedLabel,
  stake,
  numericStake,
  validationCode,
  randaoSteps,
  withdrawalAddress,
}) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Staking Summary</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Your Validator Details</Typography>
          <Typography>Stake Amount: {numericStake} ETH</Typography>
          <Typography>Validation Code: {validationCode}</Typography>
          <Typography>Randao Commitment: {randaoSteps.length > 0 ? randaoSteps[randaoSteps.length - 1].hash : 'Not generated'}</Typography>
          <Typography>Withdrawal Address: {withdrawalAddress}</Typography>
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <Card sx={{ flex: '0 0 30%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Updated Total Value Locked (TVL)</Typography>
            <Typography variant="h4">
              {validators.reduce((sum, validator) => sum + validator.stake, 0)} ETH
            </Typography>
            <Typography variant="subtitle1">
              Staked by {validators.length} validators
            </Typography>
          </CardContent>
        </Card>
        <Box sx={{ flex: '0 0 70%', height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomizedLabel}
                outerRadius={200}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke={index === validators.length - 1 ? '#000' : 'none'}
                    strokeWidth={index === validators.length - 1 ? 2 : 0}
                  />
                ))}
                <Label 
                  value="Updated Validator Stakes" 
                  position="center"
                  fill="white"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.5))'
                  }}
                />
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 4, maxWidth: '100%', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Validator ID</TableCell>
              <TableCell>Stake (ETH)</TableCell>
              <TableCell>Validation Code</TableCell>
              <TableCell>Randao Commitment</TableCell>
              <TableCell>Withdrawal Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {validators.map((validator, index) => (
              <TableRow 
                key={validator.id}
                sx={index === validators.length - 1 ? { backgroundColor: 'rgba(0, 255, 0, 0.1)' } : {}}
              >
                <TableCell>{validator.id}{index === validators.length - 1 ? ' (you)' : ''}</TableCell>
                <TableCell>{validator.stake}</TableCell>
                <TableCell>{validator.validationCode.substring(0, 10)}...</TableCell>
                <TableCell>{validator.randaoCommitment.substring(0, 10)}...</TableCell>
                <TableCell>{validator.withdrawalAddress.substring(0, 10)}...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StepSummary;
