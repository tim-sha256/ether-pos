import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Button, Typography, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sha3_256 } from 'js-sha3';
import { useNavigate } from 'react-router-dom';
import RandaoUnrolling from './RandaoUnrolling';
import XorCalculation from './XorCalculation';
import ValidatorSelectionVisualization from './ValidatorSelectionVisualization';
import sidebarContent from '../sidebarContent.json';
import { InlineMath } from 'react-katex';

function ValidatorSelection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [validatorData, setValidatorData] = useState(null);
  const [validators, setValidators] = useState([]);
  const [randaoResult, setRandaoResult] = useState('');
  const [xorResult, setXorResult] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [globalRandao, setGlobalRandao] = useState('');

  const navigate = useNavigate();
  
  const steps = ['RANDao Unrolling', 'Global XOR Calculation', 'Validator Selection'];

  useEffect(() => {
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    const storedValidatorData = JSON.parse(localStorage.getItem('userValidatorData') || 'null');
    
    if (storedValidators.length >= 16 && storedValidatorData) {
      setValidators(storedValidators);
      setValidatorData(storedValidatorData);
    } else {
      setOpenDialog(true);
    }

    const storedGlobalRandao = localStorage.getItem('globalRandao') || `0x${sha3_256(Math.random().toString()).substring(0, 64)}`;
    setGlobalRandao(storedGlobalRandao);
    localStorage.setItem('globalRandao', storedGlobalRandao);
  }, []);

  const handleDialogClose = (option) => {
    setOpenDialog(false);
    if (option === 'goBack') {
      navigate('/');
    } else if (option === 'generate') {
      generateRandomUserValidator();
    }
  };

  const generateRandomUserValidator = () => {
    const randomSecretPhrase = Math.random().toString(36).substring(2, 10);
    const randomBlocks = Math.floor(Math.random() * 32) + 1;
    const newUserValidator = {
      secretPhrase: randomSecretPhrase,
      hashSteps: randomBlocks,
      id: validators.length + 1,
      stake: 32,
      validationCode: '0x' + sha3_256(randomSecretPhrase).substring(0, 40),
      randaoCommitment: '0x' + sha3_256(randomSecretPhrase.repeat(randomBlocks)).substring(0, 64),
      withdrawalAddress: '0x' + sha3_256(Math.random().toString()).substring(0, 40)
    };
    setValidatorData(newUserValidator);
    localStorage.setItem('validatorData', JSON.stringify(newUserValidator));
    
    const updatedValidators = [...validators, newUserValidator];
    setValidators(updatedValidators);
    localStorage.setItem('validators', JSON.stringify(updatedValidators));
  };

  const handleRandaoUnrolling = (finalHash) => {
    setRandaoResult(finalHash);
    const updatedUserValidatorData = {
      ...validatorData,
      unrolledRandao: finalHash
    };
    setValidatorData(updatedUserValidatorData);
    localStorage.setItem('userValidatorData', JSON.stringify(updatedUserValidatorData));
  };

  const handleXorCalculation = (result) => {
    setXorResult(result);
    setGlobalRandao(result);
    localStorage.setItem('globalRandao', result);
  };

  const handleValidatorSelection = (selectedValidator) => {
    localStorage.setItem('selectedValidatorID', selectedValidator.id.toString());
    const updatedValidatorData = {
      ...validatorData,
      selectedValidator,
      timestamp: new Date().toISOString()
    };
    setValidatorData(updatedValidatorData);
    localStorage.setItem('userValidatorData', JSON.stringify(updatedValidatorData));
  };

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  const renderUserValidatorDetails = () => (
    <Accordion expanded={expanded} onChange={handleAccordionChange} sx={{ mb: 4 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="validator-details-content"
        id="validator-details-header"
      >
        <Typography variant="h6">Your Validator Details</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>Stake Amount: {validatorData.stake} ETH</Typography>
        <Typography>Validation Code: {validatorData.validationCode}</Typography>
        <Typography>Randao Commitment: {validatorData.randaoCommitment}</Typography>
        <Typography>Withdrawal Address: {validatorData.withdrawalAddress}</Typography>
        <Typography>Secret Phrase: {validatorData.secretPhrase}</Typography>
        <Typography>Number of Blocks: {validatorData.hashSteps}</Typography>
      </AccordionDetails>
    </Accordion>
  );

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
    const content = sidebarContent[`validatorSelection${currentStep}`];
    return (
      <Box sx={{ p: 2, fontFamily: 'Inter, sans-serif' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>{content.title}</Typography>
        {renderSidebarContent(content.content)}
      </Box>
    );
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return !!randaoResult;
      case 1:
        return !!xorResult;
      case 2:
        return !!validatorData?.selectedValidator;
      default:
        return false;
    }
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
        {renderSidebar()}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '75%' } }}>
        <Typography variant="h4" gutterBottom>Validator Selection Process</Typography>
        {validatorData && renderUserValidatorDetails()}
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            {currentStep === 0 && (
              <RandaoUnrolling 
                secretPhrase={validatorData?.secretPhrase}
                hashSteps={validatorData?.hashSteps}
                onComplete={handleRandaoUnrolling}
              />
            )}
            {currentStep === 1 && (
              <XorCalculation 
                randaoResult={randaoResult}
                globalRandao={globalRandao}
                onComplete={handleXorCalculation}
              />
            )}
            {currentStep === 2 && (
              <ValidatorSelectionVisualization 
                validators={validators}
                xorResult={xorResult}
                onSelect={handleValidatorSelection}
              />
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1 || !isStepComplete(currentStep)}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Validator Data Missing</DialogTitle>
          <DialogContent>
            <Typography>
              It seems you haven't completed the Staking Overview section or the data is incomplete. Would you like to go back and complete it, or generate random data for this demonstration?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogClose('goBack')}>Go to Staking Overview</Button>
            <Button onClick={() => handleDialogClose('generate')}>Generate Random Data</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default ValidatorSelection;
