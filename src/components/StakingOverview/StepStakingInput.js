import React from 'react';
import { Box, Card, CardContent, TextField, Typography, Button, LinearProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';

function StepStakingInput({
  stake,
  handleStakeChange,
  numericStake,
  withdrawalAddress,
  secretPhrase,
  handleSecretPhraseChange,
  blocksToValidate,
  handleBlocksToValidateChange,
  generateRandao,
  isAnimating,
  currentStep,
  randaoSteps,
  validationCode,
  generateValidationCode,
  handleStake,
}) {
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

  return (
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
  );
}

export default StepStakingInput;
