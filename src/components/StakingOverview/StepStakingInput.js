// StepStakingInput.js - Step 2: Staking Input Component
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Typography, Button, LinearProgress } from '@mui/material';
import { sha3_256 } from 'js-sha3';
import { motion } from 'framer-motion';

function StepStakingInput() {
  const [stake, setStake] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [blocksToValidate, setBlocksToValidate] = useState(1);
  const [randaoSteps, setRandaoSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
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
    setIsAnimating(true);
    setCurrentStep(0);
    setRandaoSteps([]);

    const animateStep = (step, previousHash) => {
      if (step < blocksToValidate) {
        setTimeout(() => {
          setCurrentStep(step);
          const currentHash = step === 0 ? secretPhrase : previousHash;
          const newHash = `0x${sha3_256(currentHash)}`;
          setRandaoSteps((prev) => [...prev, { step: step + 1, hash: newHash }]);
          animateStep(step + 1, newHash);
        }, 1000);
      } else {
        setIsAnimating(false);
      }
    };

    animateStep(0, secretPhrase);
  };

  return (
    <Card sx={{ width: '100%', mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Staking Input
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
          You have staked: <strong>{parseFloat(stake) || 0} ETH</strong>
        </Typography>
        <Typography variant="body2" color={parseFloat(stake) >= 32 ? 'success.main' : 'error.main'}>
          {parseFloat(stake) >= 32
            ? 'Congratulations! You are eligible to be a validator.'
            : 'You need at least 32 ETH to be eligible as a validator.'}
        </Typography>
        {withdrawalAddress && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Your Withdrawal Address: <strong>{withdrawalAddress}</strong>
          </Typography>
        )}

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
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: 0 }}>
                <Typography color="primary">🔒</Typography>
              </motion.div>
              <Typography variant="body2" sx={{ ml: 2, wordBreak: 'break-all' }}>
                {step.hash}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

export default StepStakingInput;
