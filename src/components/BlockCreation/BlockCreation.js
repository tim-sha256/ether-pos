import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const steps = ['Block Proposal', 'Block Attestation', 'Incorporation into Chain'];

function BlockCreation() {
  const [activeStep, setActiveStep] = useState(0);
  const [proposedBlock, setProposedBlock] = useState(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep === 0) {
      // Simulate block proposal
      const newBlock = {
        blockNumber: Math.floor(Math.random() * 1000000),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        parentHash: '0x' + Math.random().toString(16).substr(2, 64),
        stateRoot: '0x' + Math.random().toString(16).substr(2, 64),
        transactionsRoot: '0x' + Math.random().toString(16).substr(2, 64),
        receiptsRoot: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: Date.now(),
      };
      setProposedBlock(newBlock);
      navigate('/block-attestation', { state: { proposedBlock: newBlock } });
    } else if (activeStep === 1) {
      navigate('/incorporation-into-chain', { state: { proposedBlock } });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}

export default BlockCreation;