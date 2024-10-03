import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme, useMediaQuery } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { sha3_256 } from 'js-sha3';

function StakingOverview() {
  const [stake, setStake] = useState('');
  const [validators, setValidators] = useState([]);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [blocksToValidate, setBlocksToValidate] = useState(1);
  const [randaoSteps, setRandaoSteps] = useState([]);
  const [validationCode, setValidationCode] = useState('');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF67A1', '#FF6D00', '#A2FF67', '#67F7FF', '#FFD700'];

  useEffect(() => {
    // Generate 15 random validators on component mount
    const generateValidators = () => {
      return Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        stake: Math.floor(Math.random() * (500 - 32) + 32),
        validationCode: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`,
        randaoCommitment: `0x${sha3_256(Math.random().toString()).substring(0, 64)}`,
        withdrawalAddress: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`
      }));
    };

    setValidators(generateValidators());
  }, []);

  const handleStakeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStake(value);
      if (parseFloat(value) >= 32) {
        generateWithdrawalAddress();
      } else {
        setWithdrawalAddress('');
      }
    }
  };

  const generateWithdrawalAddress = () => {
    const address = `0x${sha3_256(Math.random().toString()).substring(0, 40)}`;
    setWithdrawalAddress(address);
  };

  const handleSecretPhraseChange = (e) => {
    setSecretPhrase(e.target.value.slice(0, 16));
  };

  const handleBlocksToValidateChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setBlocksToValidate(Math.min(Math.max(value, 1), 32));
  };

  const generateRandao = () => {
    let currentHash = secretPhrase;
    const steps = [];

    for (let i = 0; i < blocksToValidate; i++) {
      currentHash = `0x${sha3_256(currentHash)}`;
      steps.push({ step: i + 1, hash: currentHash });
    }

    setRandaoSteps(steps);
  };

  const generateValidationCode = () => {
    const code = `0x${sha3_256(Math.random().toString()).substring(0, 40)}`;
    setValidationCode(code);
  };

  const handleStake = () => {
    if (numericStake >= 32 && withdrawalAddress && randaoSteps.length > 0 && validationCode) {
      const newValidator = {
        id: validators.length + 1,
        stake: numericStake,
        validationCode: validationCode,
        randaoCommitment: randaoSteps[randaoSteps.length - 1].hash,
        withdrawalAddress: withdrawalAddress
      };
      setValidators([...validators, newValidator]);
      // Reset form
      setStake('');
      setWithdrawalAddress('');
      setSecretPhrase('');
      setBlocksToValidate(1);
      setRandaoSteps([]);
      setValidationCode('');
    }
  };

  const numericStake = parseFloat(stake) || 0;

  const allValidators = validators;

  const pieData = allValidators.map((validator) => ({
    name: `v${validator.id}`,
    value: validator.stake,
  }));

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
            type="text"
            value={stake}
            onChange={handleStakeChange}
            fullWidth
            margin="normal"
          />
          <Typography variant="body1">
            You have staked: <strong>{numericStake} ETH</strong>
          </Typography>
          <Typography variant="body2" color={numericStake >= 32 ? "success.main" : "error.main"}>
            {numericStake >= 32 ? 'Congratulations! You are eligible to be a validator.' : 'You need at least 32 ETH to be eligible as a validator.'}
          </Typography>
          {withdrawalAddress && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Your Withdrawal Address: <strong>{withdrawalAddress}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ width: '100%', maxWidth: 600, p: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Randao Generation
          </Typography>
          <TextField
            label="Secret Phrase (max 16 characters)"
            value={secretPhrase}
            onChange={handleSecretPhraseChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Number of Blocks to Validate (1-32)"
            type="number"
            value={blocksToValidate}
            onChange={handleBlocksToValidateChange}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 32 } }}
          />
          <Button variant="contained" onClick={generateRandao} sx={{ mt: 2 }}>
            Generate Randao
          </Button>
          {randaoSteps.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Randao Generation Steps:</Typography>
              {randaoSteps.map((step, index) => (
                <Typography key={index} variant="body2">
                  Hash {step.step}: {step.hash.substring(0, 12)}...
                </Typography>
              ))}
              <Typography variant="body1" sx={{ mt: 1 }}>
                Final Randao Commitment: <strong>{randaoSteps[randaoSteps.length - 1].hash}</strong>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ width: '100%', maxWidth: 600, p: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Validation Code
          </Typography>
          <Button variant="contained" onClick={generateValidationCode} sx={{ mt: 2 }}>
            Generate Validation Code
          </Button>
          {validationCode && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Your Validation Code: <strong>{validationCode}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        onClick={handleStake}
        disabled={!(numericStake >= 32 && withdrawalAddress && randaoSteps.length > 0 && validationCode)}
        sx={{ mt: 2, mb: 4 }}
      >
        Stake
      </Button>

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