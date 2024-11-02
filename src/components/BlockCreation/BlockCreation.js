import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sha3_256 } from 'js-sha3';
import sidebarContent from '../../sidebarContent_new.json';
import BlockProposal from './BlockProposal';
import BlockAttestation from './BlockAttestation';
import IncorporationIntoChain from './IncorporationIntoChain';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

function BlockCreation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [validatorData, setValidatorData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [proposedBlock, setProposedBlock] = useState(null);
  const [attestedValidators, setAttestedValidators] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  
  const navigate = useNavigate();
  
  const steps = ['Block Proposal', 'Block Attestation', 'Incorporation into Chain'];

  useEffect(() => {
    const storedValidatorData = JSON.parse(localStorage.getItem('userValidatorData'));
    if (storedValidatorData) {
      setValidatorData(storedValidatorData);
    } else {
      setOpenDialog(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate('/validator-selection');
  };

  const generateTransactions = () => {
    const numTransactions = Math.floor(Math.random() * 16) + 5; // 5 to 20 transactions
    const newTransactions = [];

    for (let i = 0; i < numTransactions; i++) {
      const transaction = {
        id: i + 1,
        hash: '0x' + sha3_256(Math.random().toString()),
        from: '0x' + sha3_256(Math.random().toString()).slice(0, 40),
        to: '0x' + sha3_256(Math.random().toString()).slice(0, 40),
        value: (Math.random() * 9.99 + 0.01).toFixed(2), // 0.01 to 10 ETH
        fee: (Math.random() * 1.9 + 0.1).toFixed(1), // 0.1 to 2 Gwei
        gasUsed: Math.floor(Math.random() * 79000) + 21000, // 21,000 to 100,000 units
        timestamp: Date.now() - Math.floor(Math.random() * 60000) // Within the last minute
      };
      newTransactions.push(transaction);
    }

    setTransactions(newTransactions);
    localStorage.setItem('proposedBlockTransactions', JSON.stringify(newTransactions));
  };

  const handleNext = () => {
    if (currentStep === 0 && !transactions.length) {
      generateTransactions();
    }
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleAttestationComplete = (validators) => {
    setAttestedValidators(validators);
    handleNext();
  };

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
      'Block Proposal': 'Step_BlockProposal',
      'Block Attestation': 'Step_BlockAttestation',
      'Incorporation into Chain': 'Step_IncorporationIntoChain'
    };
    const stepKey = stepKeyMap[steps[currentStep]];
    const stepContent = sidebarContent.Section_BlockCreation.steps[stepKey];
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
    navigate('/finality-and-chain-selection');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      width: '95%',
      maxWidth: '1600px',
      margin: '0 auto', 
      mt: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ 
        width: { xs: '100%', md: '30%' },
        mb: { xs: 4, md: 0 },
        mr: { md: 4 }
      }}>
        {renderSidebar()}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '70%' } }}>
        {/* <Typography variant="h4" gutterBottom>Block Creation</Typography> */}
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {currentStep === 0 && (
          <BlockProposal 
            validator={validatorData?.selectedValidator || validatorData}
            onPropose={setProposedBlock}
          />
        )}
        {currentStep === 1 && (
          <BlockAttestation 
            proposedBlock={proposedBlock}
            onComplete={handleAttestationComplete}
          />
        )}
        {currentStep === 2 && (
          <IncorporationIntoChain 
            proposedBlock={proposedBlock}
            attestedValidators={attestedValidators}
          />
        )}

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
          >
            {currentStep === steps.length - 1 ? 'Go to Next Section' : 'Next'}
          </Button>
        </Box>

        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>Validator Data Missing</DialogTitle>
          <DialogContent>
            <Typography>
              Please complete the Validator Selection process before proceeding to Block Creation.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Go to Validator Selection</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default BlockCreation;
