// StakingOverviewMain.js - Main file that connects the components for Staking Overview
import React from 'react';
import StepOverview from './StepOverview';
import StepStakingInput from './StepStakingInput';
import StepSummary from './StepSummary';
import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const steps = ['Overview', 'Staking Input', 'Summary'];

function StakingOverviewMain() {
  const [activeStep, setActiveStep] = React.useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNextSection = () => {
    navigate('/validator-selection');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <StepOverview />;
      case 1:
        return <StepStakingInput />;
      case 2:
        return <StepSummary />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStepContent()}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="contained" onClick={handleBack} disabled={activeStep === 0}>
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
  );
}

export default StakingOverviewMain;
