import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Stepper, Step, StepLabel, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import sidebarContent from '../../sidebarContent_new.json'; // Updated import
import TransactionFees from './TransactionFees';
import BlockRewards from './BlockRewards';
import PenaltiesAndSlashing from './PenaltiesAndSlashing';
import { InlineMath } from 'react-katex'; // Import for formula rendering

const steps = ['Introduction', 'Transaction Fees', 'Block Rewards', 'Penalties and Slashing'];

function EconomicsFeesAndPenalties() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>Introduction</Typography>
              <Typography variant="body1" paragraph>
                That's very cool, but I haven't seen anybody earning anything yet. Are the validators acting as charities?
              </Typography>
              <Typography variant="body1" paragraph>
                No. It's time to talk money!
              </Typography>
              <Typography variant="body1" paragraph>
                In this section, we'll break down all fees and penalties which are present in the Ethereum network.
                For the reasons of clean visualization and simpler explanations, we didn't include this before.
                After understanding the fees, you might see more clearly how voting works, why everybody can't just produce their own blocks, and why they sign up for this at all.
              </Typography>
            </CardContent>
          </Card>
        );
      case 1:
        return <TransactionFees />;
      case 2:
        return <BlockRewards />;
      case 3:
        return <PenaltiesAndSlashing />;
      default:
        return null;
    }
  };

  const renderSidebarContent = (content) => {
    if (!content) return null;
    return content.map((item, index) => {
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
      } else if (item.type === 'formula') {
        return (
          <Box key={index} sx={{ my: 2, textAlign: 'center' }}>
            <InlineMath>{item.content}</InlineMath>
          </Box>
        );
      }
      return null;
    });
  };

  // Mapping between step labels and JSON keys
  const stepKeyMap = {
    'Introduction': 'Step_Introduction',
    'Transaction Fees': 'Step_TransactionFees',
    'Block Rewards': 'Step_BlockRewards',
    'Penalties and Slashing': 'Step_PenaltiesAndSlashing'
  };

  const stepKey = stepKeyMap[steps[activeStep]];
  const currentStepContent = sidebarContent.Section_EconomicsFeesAndPenalties.steps[stepKey];

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
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {currentStepContent?.title || `Step ${activeStep + 1}`}
        </Typography>
        {renderSidebarContent(currentStepContent?.content)}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '75%' } }}>
        <Typography variant="h4" gutterBottom>
          Economics, Fees and Penalties
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
            onClick={activeStep === steps.length - 1 ? () => navigate('/light-client-syncing') : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Go to the next section' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default EconomicsFeesAndPenalties;