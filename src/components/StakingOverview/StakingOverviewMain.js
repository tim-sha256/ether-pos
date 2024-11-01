import React, { useState, useEffect, useCallback } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StepOverview from './StepOverview';
import StepStakingInput from './StepStakingInput';
import StepSummary from './StepSummary';
import sidebarContent from '../../sidebarContent_new.json';
import { sha3_256 } from 'js-sha3';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

function StakingOverviewMain() {
  const navigate = useNavigate();
  const [stake, setStake] = useState('');
  const [validators, setValidators] = useState([]);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [blocksToValidate, setBlocksToValidate] = useState(1);
  const [randaoSteps, setRandaoSteps] = useState([]);
  const [validationCode, setValidationCode] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Overview', 'Staking Input', 'Summary'];
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF67A1', '#FF6D00', '#A2FF67', '#67F7FF', '#FFD700'];

  useEffect(() => {
    // Clear localStorage when component mounts
    localStorage.clear();

    // Generate 15 random validators on component mount
    const generateValidators = () => {
      const newValidators = Array.from({ length: 15 }, (_, index) => {
        const randaoReveal = `0x${sha3_256(Math.random().toString()).substring(0, 64)}`;
        return {
          id: index + 1,
          stake: Math.floor(Math.random() * (500 - 32) + 32),
          validationCode: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`,
          randaoReveal: randaoReveal,
          randaoCommitment: `0x${sha3_256(randaoReveal)}`,
          withdrawalAddress: `0x${sha3_256(Math.random().toString()).substring(0, 40)}`
        };
      });
      setValidators(newValidators);
      localStorage.setItem('validators', JSON.stringify(newValidators));
    };

    generateValidators();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

  const handleStakeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStake(value);
      if (parseFloat(value) >= 32) {
        generateWithdrawalAddress();
      } else {
        setWithdrawalAddress('');
      }
    }
  };

  const generateWithdrawalAddress = () => {
    const address = `0x${sha3_256(Math.random().toString()).substring(0, 40)}`;
    setWithdrawalAddress(address);
  };

  const handleSecretPhraseChange = (e) => {
    setSecretPhrase(e.target.value.slice(0, 16));
  };

  const handleBlocksToValidateChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setBlocksToValidate(Math.min(Math.max(value, 1), 32));
  };

  const generateRandao = useCallback(() => {
    setIsAnimating(true);
    setCurrentStep(0);
    setRandaoSteps([]);

    const animateStep = (step, previousHash) => {
      if (step < blocksToValidate) {
        setTimeout(() => {
          setCurrentStep(step);
          const currentHash = step === 0 ? secretPhrase : previousHash;
          const newHash = `0x${sha3_256(currentHash)}`;
          setRandaoSteps(prev => [...prev, { step: step + 1, hash: newHash }]);
          animateStep(step + 1, newHash);
        }, 1000); // Always animate with a delay for visibility
      } else {
        setIsAnimating(false);
      }
    };

    animateStep(0, secretPhrase);
  }, [secretPhrase, blocksToValidate]);

  const generateValidationCode = () => {
    const code = `0x${sha3_256(Math.random().toString()).substring(0, 40)}`;
    setValidationCode(code);
  };

  const handleStake = () => {
    const newValidator = {
      id: validators.length + 1,
      stake: parseFloat(stake),
      validationCode,
      randaoCommitment: randaoSteps[randaoSteps.length - 1].hash,
      withdrawalAddress,
      secretPhrase,
      hashSteps: blocksToValidate,
      timestamp: new Date().toISOString()
    };

    const updatedValidators = [...validators, newValidator];
    setValidators(updatedValidators);
    localStorage.setItem('validators', JSON.stringify(updatedValidators));

    const userValidatorData = {
      ...newValidator,
      hashSteps: blocksToValidate
    };
    localStorage.setItem('userValidatorData', JSON.stringify(userValidatorData));

    setActiveStep(2);
  };

  const numericStake = parseFloat(stake) || 0;

  const allValidators = validators;

  const pieData = allValidators.map((validator) => ({
    name: `v${validator.id}`,
    value: validator.stake,
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${pieData[index].name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNextSection = () => {
    navigate('/validator-selection');
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
    const stepContent = sidebarContent.Section_StakingOverview.steps[`Step_${steps[activeStep].replace(/\s+/g, '')}`];
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
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <StepOverview
            validators={validators}
            allValidators={allValidators}
            pieData={pieData}
            COLORS={COLORS}
            renderCustomizedLabel={renderCustomizedLabel}
          />
        )}
        {activeStep === 1 && (
          <StepStakingInput
            stake={stake}
            setStake={setStake}
            handleStakeChange={handleStakeChange}
            numericStake={numericStake}
            withdrawalAddress={withdrawalAddress}
            generateWithdrawalAddress={generateWithdrawalAddress}
            secretPhrase={secretPhrase}
            setSecretPhrase={setSecretPhrase}
            blocksToValidate={blocksToValidate}
            setBlocksToValidate={setBlocksToValidate}
            randaoSteps={randaoSteps}
            setRandaoSteps={setRandaoSteps}
            validationCode={validationCode}
            setValidationCode={setValidationCode}
            isAnimating={isAnimating}
            setIsAnimating={setIsAnimating}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            generateRandao={generateRandao}
            handleSecretPhraseChange={handleSecretPhraseChange}
            handleBlocksToValidateChange={handleBlocksToValidateChange}
            generateValidationCode={generateValidationCode}
            handleStake={handleStake}
          />
        )}
        {activeStep === 2 && (
          <StepSummary
            validators={validators}
            allValidators={allValidators}
            pieData={pieData}
            COLORS={COLORS}
            renderCustomizedLabel={renderCustomizedLabel}
            stake={stake}
            numericStake={numericStake}
            validationCode={validationCode}
            randaoSteps={randaoSteps}
            withdrawalAddress={withdrawalAddress}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
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

export default StakingOverviewMain;
