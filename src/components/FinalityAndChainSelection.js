import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Stepper, Step, StepLabel } from '@mui/material';
import ForksAndDivergingChains from './FinalityAndChainSelection/ForksAndDivergingChains';
import ChainSelectionAndFinality from './FinalityAndChainSelection/ChainSelectionAndFinality';
import ValidatorBettingOverview from './FinalityAndChainSelection/ValidatorBettingOverview';
import sidebarContent from '../sidebarContent.json';
import { useNavigate } from 'react-router-dom';

const steps = ['Forks & Diverging Chains', 'Validator Betting Overview', 'Chain Selection & Finality'];

function FinalityAndChainSelection() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [chainData, setChainData] = useState(null);
  const [validatorData, setValidatorData] = useState(null);
  const [blockAggregationData, setBlockAggregationData] = useState(null);

  useEffect(() => {
    // Load data from local storage
    const storedChainData = JSON.parse(localStorage.getItem('singleChain') || '[]');
    const storedValidatorData = JSON.parse(localStorage.getItem('validatorData') || '{}');
    const storedBlockAggregationData = JSON.parse(localStorage.getItem('blockAggregationData') || '{}');

    setChainData(storedChainData);
    setValidatorData(storedValidatorData);
    setBlockAggregationData(storedBlockAggregationData);
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNextSection = () => {
    navigate('/economics-fees-and-penalties');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <ForksAndDivergingChains chainData={chainData} validatorData={validatorData} />;
      case 1:
        return <ValidatorBettingOverview />;
      case 2:
        return <ChainSelectionAndFinality chainData={chainData} validatorData={validatorData} blockAggregationData={blockAggregationData} />;
      default:
        return null;
    }
  };

  const renderSidebarContent = (content) => {
    let sidebarItems = content.map((item, index) => {
      if (typeof item === 'string') {
        return <Typography key={index} variant="body1" sx={{ mb: 2 }}>{item}</Typography>;
      } else if (item.type === 'list' || item.type === 'orderedList') {
        const ListComponent = item.type === 'list' ? 'ul' : 'ol';
        return (
          <ListComponent key={index}>
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex}>
                <Typography variant="body1">{listItem}</Typography>
              </li>
            ))}
          </ListComponent>
        );
      }
      return null;
    });

    // Add constants with definitions to sidebar for Validator Betting Overview step
    if (activeStep === 1) {
      sidebarItems.push(
        <Box key="constants" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Constants:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            FINALITY_REWARD_COEFFICIENT: 6e-10
            <br />
            <em>The scaling factor that influences the base reward according to network size</em>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            BLOCK_TIME: 4 seconds
            <br />
            <em>The average time between proposed blocks</em>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            bet_coeff: 1
            <br />
            <em>Coefficient used in betting calculations</em>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            total_validating_ether: 4045 ETH
            <br />
            <em>Total amount of ETH staked by all validators</em>
          </Typography>
        </Box>
      );
    }

    return sidebarItems;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      width: '90%', 
      maxWidth: '1600px',
      margin: '0 auto', 
      mt: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ 
        width: { xs: '100%', md: '25%' }, 
        mb: { xs: 4, md: 0 }, 
        mr: { md: 4 } 
      }}>
        <Typography variant="h6" gutterBottom>
          {sidebarContent.finalityAndChainSelection[Object.keys(sidebarContent.finalityAndChainSelection)[activeStep]].title}
        </Typography>
        {renderSidebarContent(sidebarContent.finalityAndChainSelection[Object.keys(sidebarContent.finalityAndChainSelection)[activeStep]].content)}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '75%' } }}>
        <Typography variant="h4" gutterBottom>
          Finality & Chain Selection
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
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

export default FinalityAndChainSelection;
