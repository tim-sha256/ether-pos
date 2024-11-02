import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Stepper, Step, StepLabel } from '@mui/material';
import ForksAndDivergingChains from './ForksAndDivergingChains';
import ValidatorBettingOverview from './ValidatorBettingOverview';
import OtherValidatorsParticipate from './OtherValidatorsParticipate';
import ResultsRewardsAndPenalties from './ResultsRewardsAndPenalties';
import sidebarContent from '../../sidebarContent_new.json';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

const steps = ['Forks & Diverging Chains', 'Validator Betting Overview', 'Other Validators Participate', 'Results, Rewards, and Penalties'];

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

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
        return <ValidatorBettingOverview onNextStep={handleNext} />;
      case 2:
        return <OtherValidatorsParticipate />;
      case 3:
        return <ResultsRewardsAndPenalties />;
      default:
        return null;
    }
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

  const getSidebarContent = (step) => {
    const stepKeyMap = {
      'Forks & Diverging Chains': 'Step_ForksAndDivergingChains',
      'Validator Betting Overview': 'Step_ValidatorBettingOverview',
      'Other Validators Participate': 'Step_OtherValidatorsParticipate',
      'Results, Rewards, and Penalties': 'Step_ResultsRewardsAndPenalties'
    };
    const stepKey = stepKeyMap[steps[step]];
    const stepContent = sidebarContent.Section_FinalityAndChainSelection.steps[stepKey];
    if (!stepContent) return { title: '', content: [] };
    return stepContent;
  };

  const sidebarContentData = getSidebarContent(activeStep);

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
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {sidebarContentData.title}
        </Typography>
        {renderSidebarContent(sidebarContentData.content)}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '70%' } }}>
        {/* <Typography variant="h4" gutterBottom>
          Finality & Chain Selection
        </Typography> */}
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
