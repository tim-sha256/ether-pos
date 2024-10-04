import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Button, Typography, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { sha3_256 } from 'js-sha3';
import { useNavigate } from 'react-router-dom';
import RandaoUnrolling from './RandaoUnrolling';
import XorCalculation from './XorCalculation';
import ValidatorSelectionWheel from './ValidatorSelectionWheel';
import sidebarContent from '../sidebarContent.json';
import { InlineMath } from 'react-katex';

function ValidatorSelection() {
  const [validators, setValidators] = useState([]);
  const [globalRandao, setGlobalRandao] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [randaoSteps, setRandaoSteps] = useState([]);
  const [xorResult, setXorResult] = useState('');
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userValidator, setUserValidator] = useState(null);
  const [randaoResult, setRandaoResult] = useState('');

  const navigate = useNavigate();

  const steps = ['RANDao Unrolling', 'Global XOR Calculation', 'Validator Selection'];

  useEffect(() => {
    loadValidatorsData();
    setGlobalRandao(generateInitialGlobalRandao());
  }, []);

  const loadValidatorsData = () => {
    const savedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    setValidators(savedValidators);

    const userValidatorData = JSON.parse(localStorage.getItem('userValidator') || 'null');
    
    if (savedValidators.length >= 16 && userValidatorData && userValidatorData.secretPhrase && userValidatorData.hashSteps) {
      setUserValidator(userValidatorData);
    } else {
      setOpenDialog(true);
    }
  };

  const generateInitialGlobalRandao = () => {
    return '0x' + sha3_256(Math.random().toString());
  };

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
    setUserValidator(newUserValidator);
    localStorage.setItem('userValidator', JSON.stringify(newUserValidator));
    
    const updatedValidators = [...validators, newUserValidator];
    setValidators(updatedValidators);
    localStorage.setItem('validators', JSON.stringify(updatedValidators));
  };

  const handleRandaoUnrolling = (finalHash) => {
    setRandaoResult(finalHash);
  };

  const handleXorCalculation = (result) => {
    setXorResult(result);
  };

  const handleValidatorSelection = (validator) => {
    setSelectedValidator(validator);
  };

  const renderUserValidatorDetails = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Your Validator Details</Typography>
        <Typography>Stake Amount: {userValidator.stake} ETH</Typography>
        <Typography>Validation Code: {userValidator.validationCode}</Typography>
        <Typography>Randao Commitment: {userValidator.randaoCommitment}</Typography>
        <Typography>Withdrawal Address: {userValidator.withdrawalAddress}</Typography>
        <Typography>Secret Phrase: {userValidator.secretPhrase}</Typography>
        <Typography>Number of Blocks: {userValidator.hashSteps}</Typography>
      </CardContent>
    </Card>
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
        return !!selectedValidator;
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
        {userValidator && renderUserValidatorDetails()}
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            {currentStep === 0 && (
              <RandaoUnrolling 
                secretPhrase={userValidator?.secretPhrase}
                hashSteps={userValidator?.hashSteps}
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
              <ValidatorSelectionWheel 
                validators={validators}
                randomValue={xorResult}
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