// StepSummary.js - Step 3: Staking Summary Component
import React from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function StepSummary({ validators, stake, validationCode, randaoCommitment, withdrawalAddress }) {
  const navigate = useNavigate();

  const handleNextSection = () => {
    navigate('/validator-selection');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Staking Summary</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Your Validator Details</Typography>
          <Typography>Stake Amount: {stake} ETH</Typography>
          <Typography>Validation Code: {validationCode}</Typography>
          <Typography>Randao Commitment: {randaoCommitment}</Typography>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextSection}
        >
          Go to Next Section
        </Button>
      </Box>
    </Box>
  );
}

export default StepSummary;
