import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, TextField, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stepper, Step, StepLabel, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Label } from 'recharts';
import { sha3_256 } from 'js-sha3';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import sidebarContent from '../sidebarContent.json';
import LockIcon from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function StakingOverview() {
  const navigate = useNavigate();
  const [stake, setStake] = useState('');
  const [validators, setValidators] = useState([]);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [blocksToValidate, setBlocksToValidate] = useState(1);
  const [randaoSteps, setRandaoSteps] = useState([]);
  const [validationCode, setValidationCode] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Overview', 'Staking Input', 'Summary'];
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF67A1', '#FF6D00', '#A2FF67', '#67F7FF', '#FFD700'];

  useEffect(() => {
    // Clear localStorage when component mounts
    localStorage.clear();

    // Generate 15 random validators on component mount
    const generateValidators = () => {
      const newValidators = Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        stake: Math.floor(Math.random() * (500 - 32) + 32),
        validationCode: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`,
        randaoCommitment: `0x${sha3_256(Math.random().toString()).substring(0, 64)}`,
        withdrawalAddress: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`
      }));
      setValidators(newValidators);
      localStorage.setItem('validators', JSON.stringify(newValidators));
    };

    generateValidators();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

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

  const generateRandao = useCallback(() => {
    setIsAnimating(true);
    setCurrentStep(0);
    setRandaoSteps([]);

    const animateStep = (step, previousHash) => {
      if (step < blocksToValidate) {
        setTimeout(() => {
          setCurrentStep(step);
          const currentHash = step === 0 ? secretPhrase : previousHash;
          const newHash = `0x${sha3_256(currentHash)}`;
          setRandaoSteps(prev => [...prev, { step: step + 1, hash: newHash }]);
          animateStep(step + 1, newHash);
        }, 1000); // Always animate with a delay for visibility
      } else {
        setIsAnimating(false);
      }
    };

    animateStep(0, secretPhrase);
  }, [secretPhrase, blocksToValidate]);

  const renderRandaoSection = () => (
    <Card sx={{ width: '100%', mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>RANDao Generation</Typography>
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
        <Button variant="contained" onClick={generateRandao} disabled={isAnimating} sx={{ mt: 2 }}>
          Generate RANDao
        </Button>
        {isAnimating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={(currentStep / blocksToValidate) * 100} />
          </Box>
        )}
        {randaoSteps.map((step) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
              <Typography variant="body2" sx={{ mr: 2, minWidth: 60 }}>
                Hash {step.step}:
              </Typography>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: 0 }}
              >
                <LockIcon color="primary" />
              </motion.div>
              <Typography variant="body2" sx={{ ml: 2, wordBreak: 'break-all' }}>
                {step.hash}
              </Typography>
            </Box>
          </motion.div>
        ))}
        {randaoSteps.length > 0 && (
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Final RANDao Commitment: {randaoSteps[randaoSteps.length - 1].hash}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const generateValidationCode = () => {
    const code = `0x${sha3_256(Math.random().toString()).substring(0, 40)}`;
    setValidationCode(code);
  };

  const handleStake = () => {
    const newValidator = {
      id: validators.length + 1,
      stake: parseFloat(stake),
      validationCode,
      randaoCommitment: randaoSteps[randaoSteps.length - 1].hash,
      withdrawalAddress,
      secretPhrase,
      hashSteps: blocksToValidate,
      timestamp: new Date().toISOString()
    };

    const updatedValidators = [...validators, newValidator];
    setValidators(updatedValidators);
    localStorage.setItem('validators', JSON.stringify(updatedValidators));

    const userValidatorData = {
      ...newValidator,
      hashSteps: blocksToValidate
    };
    localStorage.setItem('userValidatorData', JSON.stringify(userValidatorData));

    setActiveStep(2);
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderSidebarContent = (content) => {
    return content.map((item, index) => {
      if (typeof item === 'string') {
        return <Typography key={index} variant="body1" sx={{ mb: 2 }}>{item}</Typography>;
      } else if (item.type === 'list') {
        return (
          <ul key={index}>
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex}>
                <Typography variant="body1">{listItem}</Typography>
              </li>
            ))}
          </ul>
        );
      } else if (item.type === 'orderedList') {
        return (
          <ol key={index}>
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex}>
                <Typography variant="body1">{listItem}</Typography>
              </li>
            ))}
          </ol>
        );
      } else if (item.type === 'formula') {
        return (
          <Box key={index} sx={{ my: 2, textAlign: 'center' }}>
            <InlineMath>{item.content}</InlineMath>
          </Box>
        );
      }
      return null; // Add this line to satisfy the array-callback-return rule
    });
  };

  const renderSidebar = () => {
    const content = sidebarContent[`step${activeStep}`];
    return (
      <Box sx={{ p: 2, fontFamily: 'Inter, sans-serif' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>{content.title}</Typography>
        {renderSidebarContent(content.content)}
      </Box>
    );
  };

  const handleNextSection = () => {
    navigate('/validator-selection');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on small screens
      width: '90%', 
      maxWidth: '1600px', // Maximum width for very large screens
      margin: '0 auto', 
      mt: 4,
      px: { xs: 2, sm: 3, md: 4 } // Responsive padding on the sides
    }}>
      <Box sx={{ 
        width: { xs: '100%', md: '25%' }, 
        mb: { xs: 4, md: 0 }, 
        mr: { md: 4 } 
      }}>
        {renderSidebar()}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '75%' } }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
              <Card sx={{ flex: '0 0 30%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Total Value Locked (TVL)</Typography>
                  <Typography variant="h4">
                    {allValidators.reduce((sum, validator) => sum + validator.stake, 0)} ETH
                  </Typography>
                  <Typography variant="subtitle1">
                    Staked by {allValidators.length} validators
                  </Typography>
                </CardContent>
              </Card>
              <Box sx={{ width: '100%', height: { xs: 300, sm: 400, md: 500 } }}>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label 
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox;
                          return (
                            <g>
                              <rect x={cx - 70} y={cy - 15} width={140} height={30} fill="rgba(0,0,0,0.3)" rx={15} />
                              <text x={cx} y={cy} dy={5} textAnchor="middle" fill="white" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                Validator Stakes
                              </text>
                            </g>
                          );
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
                  {allValidators.map((validator) => (
                    <TableRow key={validator.id}>
                      <TableCell>{validator.id}</TableCell>
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
        )}
        {activeStep === 1 && (
          <Box>
            <Card sx={{ width: '100%', mb: 4 }}>
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

            {renderRandaoSection()}

            <Card sx={{ width: '100%', mb: 4 }}>
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
              sx={{ mb: 4 }}
            >
              Stake
            </Button>
          </Box>
        )}
        {activeStep === 2 && (
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
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? handleNextSection : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Go to Next Section' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default StakingOverview;