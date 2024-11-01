import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Button, Typography, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sha3_256 } from 'js-sha3';
import { useNavigate } from 'react-router-dom';
import RandaoUnrolling from './RandaoUnrolling';
import XorCalculation from './XorCalculation';
import ValidatorSelectionVisualization from './ValidatorSelectionVisualization';
import sidebarContent from '../../sidebarContent_new.json';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

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

    // Update the validators array with the user's randaoReveal
    const updatedValidators = validators.map(validator => 
      validator.id === updatedUserValidatorData.id 
        ? { ...validator, randaoReveal: finalHash }
        : validator
    );
    setValidators(updatedValidators);
    localStorage.setItem('validators', JSON.stringify(updatedValidators));
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
    if (!content) return null;
    
    // Convert array of content items to markdown string
    const markdownContent = content.map(item => {
      if (typeof item === 'string') {
        return item;
      } else if (item.type === 'list') {
        return item.items.map(listItem => `- ${listItem}`).join('\n');
      } else if (item.type === 'orderedList') {
        return item.items.map((listItem, index) => `${index + 1}. ${listItem}`).join('\n');
      } else if (item.type === 'formula') {
        return `$$${item.content}$$`;
      }
      return '';
    }).join('\n\n');

    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({node, ...props}) => <Typography variant="body1" sx={{ mb: 2 }} {...props} />,
          li: ({node, ...props}) => (
            <li>
              <Typography variant="body1" component="span" {...props} />
            </li>
          )
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    );
  };

  const renderSidebar = () => {
    const stepKeyMap = {
      'RANDao Unrolling': 'Step_RandaoUnrolling',
      'Global XOR Calculation': 'Step_XorCalculation',
      'Validator Selection': 'Step_ValidatorSelectionVisualization'
    };
    const stepKey = stepKeyMap[steps[currentStep]];
    const stepContent = sidebarContent.Section_ValidatorSelection.steps[stepKey];
    if (!stepContent) return null;

    return (
      <Box sx={{ p: 2, fontFamily: 'Inter, sans-serif' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {stepContent.title}
        </Typography>
        {renderSidebarContent(stepContent.content)}
      </Box>
    );
  };

  const handleNextSection = () => {
    navigate('/block-creation');
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
            color="primary"
            onClick={currentStep === steps.length - 1 ? handleNextSection : handleNext}
            disabled={!isStepComplete(currentStep)}
          >
            {currentStep === steps.length - 1 ? 'Go to Next Section' : 'Next'}
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
