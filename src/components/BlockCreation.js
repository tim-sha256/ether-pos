import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import sha256 from 'js-sha256';

// Import sub-components (we'll create these next)
import BlockProposal from './BlockCreation/BlockProposal';
import BlockAttestation from './BlockCreation/BlockAttestation';
import BlockAggregation from './BlockCreation/BlockAggregation';
import IncorporationIntoChain from './BlockCreation/IncorporationIntoChain';

function BlockCreation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [validatorData, setValidatorData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [proposedBlock, setProposedBlock] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  const navigate = useNavigate();
  
  const steps = ['Block Proposal', 'Block Attestation', 'Block Aggregation', 'Incorporation into Chain'];

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('validatorSelectionData'));
    if (storedData && storedData.length > 0) {
      setValidatorData(storedData[storedData.length - 1]);
    } else {
      setOpenDialog(true);
    }
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate('/validator-selection');
  };

  const generateTransactions = () => {
    const numTransactions = Math.floor(Math.random() * 16) + 5; // 5 to 20 transactions
    const newTransactions = [];

    for (let i = 0; i < numTransactions; i++) {
      const transaction = {
        hash: '0x' + sha256(Math.random().toString()).slice(0, 64),
        from: '0x' + sha256(Math.random().toString()).slice(0, 40),
        to: '0x' + sha256(Math.random().toString()).slice(0, 40),
        value: (Math.random() * 9.99 + 0.01).toFixed(2), // 0.01 to 10 ETH
        fee: (Math.random() * 1.9 + 0.1).toFixed(1), // 0.1 to 2 Gwei
        gasUsed: Math.floor(Math.random() * 79000) + 21000, // 21,000 to 100,000 units
        timestamp: Date.now() - Math.floor(Math.random() * 60000) // Within the last minute
      };
      newTransactions.push(transaction);
    }

    setTransactions(newTransactions);
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

  const renderSidebar = () => {
    // Implement sidebar content based on currentStep
    return null; // Placeholder return
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
        width: { xs: '100%', md: '30%' }, 
        mb: { xs: 4, md: 0 }, 
        mr: { md: 4 } 
      }}>
        {renderSidebar()}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '70%' } }}>
        <Typography variant="h4" gutterBottom>Block Creation</Typography>
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {currentStep === 0 && (
          <BlockProposal 
            validator={validatorData?.selectedValidator}
            transactions={transactions}
            onPropose={setProposedBlock}
          />
        )}
        {currentStep === 1 && (
          <BlockAttestation 
            proposedBlock={proposedBlock}
          />
        )}
        {currentStep === 2 && (
          <BlockAggregation 
            proposedBlock={proposedBlock}
          />
        )}
        {currentStep === 3 && (
          <IncorporationIntoChain 
            proposedBlock={proposedBlock}
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
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
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