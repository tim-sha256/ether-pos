import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Card, CardContent, LinearProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import CasinoIcon from '@mui/icons-material/Casino';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

function OtherValidatorsParticipate() {
  const [validators, setValidators] = useState([]);
  const [competingForkData, setCompetingForkData] = useState(null);
  const [proposedBlock, setProposedBlock] = useState(null);
  const [globalRandao, setGlobalRandao] = useState('');
  const [chainSupport, setChainSupport] = useState({ proposed: 0, competing: 0 });
  const [totalStakePerChain, setTotalStakePerChain] = useState({ proposed: 0, competing: 0 });
  const [currentValidatorIndex, setCurrentValidatorIndex] = useState(0);
  const [userFinalityBetting, setUserFinalityBetting] = useState(null);
  const componentRef = useRef(null);

  const FINALITY_REWARD_COEFFICIENT = 6e-10;
  const BLOCK_TIME = 4;
  const bet_coeff = 1;
  const total_validating_ether = 4045;

  const [totalTVL, setTotalTVL] = useState(0);

  useEffect(() => {
    loadData();
    if (componentRef.current) {
      componentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (validators.length > 0 && currentValidatorIndex < validators.length) {
      const timer = setTimeout(() => simulateValidatorBet(currentValidatorIndex), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentValidatorIndex, validators]);

  const loadData = () => {
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    const storedCompetingForkData = JSON.parse(localStorage.getItem('competingForkData') || '{}');
    const storedProposedBlock = JSON.parse(localStorage.getItem('proposedBlock') || '{}');
    const storedGlobalRandao = localStorage.getItem('globalRandao') || '';
    const storedUserFinalityBetting = JSON.parse(localStorage.getItem('userFinalityBetting') || '{}');

    // Sort validators by ID, keeping user's validator first
    const userValidator = storedValidators.find(v => v.id === storedUserFinalityBetting.validatorId);
    const otherValidators = storedValidators.filter(v => v.id !== storedUserFinalityBetting.validatorId)
                                            .sort((a, b) => a.id - b.id);
    const sortedValidators = [userValidator, ...otherValidators];
    
    // Calculate values for the competing fork validator
    const competingValidator = sortedValidators.find(v => v.id === storedCompetingForkData.validator.id);
    if (competingValidator) {
      const odds = 1.1 + Math.random() * 3.9; // Random odds between 1.1 and 5.0
      const baseReward = FINALITY_REWARD_COEFFICIENT * BLOCK_TIME * total_validating_ether;
      const vLoss = baseReward * odds * bet_coeff * competingValidator.stake;
      const vGain = baseReward * Math.log(odds) * bet_coeff * competingValidator.stake;

      competingValidator.odds = odds;
      competingValidator.vLoss = vLoss;
      competingValidator.vGain = vGain;
      competingValidator.chosenChain = 'competing';
    }

    setValidators(sortedValidators);
    setCompetingForkData(storedCompetingForkData);
    setProposedBlock(storedProposedBlock);
    setGlobalRandao(storedGlobalRandao);
    setUserFinalityBetting(storedUserFinalityBetting);

    // Initialize chain support with user's bet and competing fork validator
    setChainSupport({ proposed: 1, competing: 1 });
    setTotalStakePerChain({ 
      proposed: userValidator?.stake || 0, 
      competing: competingValidator?.stake || 0
    });

    // Calculate total TVL
    const totalTVL = sortedValidators.reduce((sum, validator) => sum + validator.stake, 0);
    setTotalTVL(totalTVL);
  };

  const simulateValidatorBet = (index) => {
    const validator = validators[index];
    if (!validator) return;

    // Skip user's validator and competing fork validator
    if (validator.id === userFinalityBetting.validatorId || validator.id === competingForkData.validator.id) {
      setCurrentValidatorIndex(prevIndex => prevIndex + 1);
      return;
    }

    // Randomly exclude one more validator
    if (Math.random() < 0.1) {
      setCurrentValidatorIndex(prevIndex => prevIndex + 1);
      return;
    }

    const odds = 1.1 + Math.random() * 3.9; // Random odds between 1.1 and 5.0
    const baseReward = FINALITY_REWARD_COEFFICIENT * BLOCK_TIME * total_validating_ether;
    const vLoss = baseReward * odds * bet_coeff * validator.stake;
    const vGain = baseReward * Math.log(odds) * bet_coeff * validator.stake;

    // Use XOR operation between global randao and validator's randaoReveal for randomness
    const randaoSeed = parseInt(globalRandao, 16) ^ parseInt(validator.randaoReveal, 16);
    const chosenChain = (randaoSeed % 2 === 0) ? 'proposed' : 'competing';

    // Calculate the current percentage of stake for the proposed chain
    const currentProposedStakePercentage = totalStakePerChain.proposed / (totalStakePerChain.proposed + totalStakePerChain.competing) * 100;

    // Adjust the probability to ensure the proposed chain always has at least 67% stake
    // and at least one other validator votes for the competing chain
    let finalChosenChain;
    if (currentProposedStakePercentage < 67) {
      finalChosenChain = 'proposed';
    } else if (chainSupport.competing === 1 && index === validators.length - 1) { // Ensure at least one other validator votes for competing
      finalChosenChain = 'competing';
    } else {
      // Allow some competing votes, but ensure we don't drop below 67%
      const maxCompetingStake = (totalStakePerChain.proposed + totalStakePerChain.competing + validator.stake) * 0.33 - totalStakePerChain.competing;
      finalChosenChain = (Math.random() < 0.2 && validator.stake <= maxCompetingStake) ? 'competing' : 'proposed';
    }

    const updatedValidator = {
      ...validator,
      vLoss,
      vGain,
      chosenChain: finalChosenChain,
      odds
    };

    setValidators(prevValidators => {
      const newValidators = [...prevValidators];
      newValidators[index] = updatedValidator;
      return newValidators;
    });

    setChainSupport(prevSupport => ({
      ...prevSupport,
      [finalChosenChain]: prevSupport[finalChosenChain] + 1
    }));

    setTotalStakePerChain(prevStake => ({
      ...prevStake,
      [finalChosenChain]: prevStake[finalChosenChain] + validator.stake
    }));

    setCurrentValidatorIndex(prevIndex => prevIndex + 1);
  };

  const calculateBetChain = (randaoReveal) => {
    const combinedHash = parseInt(globalRandao, 16) ^ parseInt(randaoReveal, 16);
    return combinedHash % 2 === 0 ? 'proposed' : 'competing';
  };

  const renderGlobalRandaoBanner = () => (
    <Card sx={{ mb: 2, bgcolor: 'primary.light' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Global Randao: {globalRandao.slice(0, 10)}...</Typography>
        <Typography variant="body2">
          The global randao value is used to add an unbiased randomness to validator bets, ensuring fairness in the chain finality process.
        </Typography>
      </CardContent>
    </Card>
  );

  const renderValidatorCard = (validator, index) => {
    const isUserValidator = validator.id === userFinalityBetting.validatorId;
    const isCompetingValidator = validator.id === competingForkData.validator.id;

    return (
      <motion.div
        key={validator.id}
        initial={{ opacity: 0, y: 50 }}
        animate={index <= currentValidatorIndex || isUserValidator || isCompetingValidator ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          width: 250, 
          bgcolor: isUserValidator 
            ? 'success.main'
            : isCompetingValidator || validator.chosenChain === 'competing'
              ? 'orange'
              : validator.chosenChain === 'proposed' 
                ? 'info.light'
                : 'grey.300'
        }}>
          <CardContent>
            <Typography variant="h6" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
              Validator {validator.id}
              {isUserValidator ? ' (You)' : ''}
            </Typography>
            {isCompetingValidator && (
              <Typography variant="body2" color="white" sx={{ fontStyle: 'italic' }}>
                Submitted competing chain
              </Typography>
            )}
            <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
              Stake: {validator.stake} ETH
            </Typography>
            <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
              Randao Reveal: {validator.randaoReveal.slice(0, 10)}...
            </Typography>
            {(validator.chosenChain || isUserValidator || isCompetingValidator) ? (
              <>
                <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                  Chain: {isUserValidator ? 'proposed' : isCompetingValidator ? 'competing' : validator.chosenChain}
                </Typography>
                {(isUserValidator || validator.odds !== undefined) && (
                  <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                    Odds: {isUserValidator ? userFinalityBetting.odds.toFixed(2) : validator.odds.toFixed(2)}
                  </Typography>
                )}
                {(isUserValidator || validator.vLoss !== undefined) && (
                  <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                    V_LOSS: {isUserValidator ? userFinalityBetting.V_LOSS.toFixed(4) : validator.vLoss.toFixed(4)} ETH
                  </Typography>
                )}
                {(isUserValidator || validator.vGain !== undefined) && (
                  <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                    V_GAIN: {isUserValidator ? userFinalityBetting.V_GAIN.toFixed(4) : validator.vGain.toFixed(4)} ETH
                  </Typography>
                )}
                <Tooltip title={`Bet Chain Selection: XOR(globalRandao, randaoReveal) % 2 == 0 ? "Proposed" : "Competing"`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CasinoIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Randomness Result: {isUserValidator ? 'Proposed' : isCompetingValidator ? 'Competing' : validator.chosenChain.charAt(0).toUpperCase() + validator.chosenChain.slice(1)}
                    </Typography>
                  </Box>
                </Tooltip>
              </>
            ) : (
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Abstained
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderChainSupportChart = () => (
    <Box sx={{ height: 300, mt: 4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            { name: 'Proposed Chain', value: totalStakePerChain.proposed },
            { name: 'Competing Chain', value: totalStakePerChain.competing },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );

  return (
    <Box ref={componentRef}>
      <Typography variant="h5" gutterBottom>
        Chain Selection & Finality - Other Validators Participate
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" paragraph>
          Now, other validators will also participate in the betting process. You will see their decisions in real-time.
          The betting outcome is influenced by the global randao and individual randao reveals, ensuring fairness in the selection process.
        </Typography>
        <LinearProgress variant="determinate" value={(currentValidatorIndex / validators.length) * 100} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2">Proposed Chain Support: {chainSupport.proposed}</Typography>
          <Typography variant="body2">Competing Chain Support: {chainSupport.competing}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2">
            Proposed Chain Stake: {totalStakePerChain.proposed.toFixed(2)} ETH 
            ({((totalStakePerChain.proposed / totalTVL) * 100).toFixed(2)}% of TVL)
          </Typography>
          <Typography variant="body2">
            Competing Chain Stake: {totalStakePerChain.competing.toFixed(2)} ETH
            ({((totalStakePerChain.competing / totalTVL) * 100).toFixed(2)}% of TVL)
          </Typography>
        </Box>
        {renderChainSupportChart()}
      </Paper>
      {renderGlobalRandaoBanner()}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {validators.map((validator, index) => renderValidatorCard(validator, index))}
      </Box>
    </Box>
  );
}

export default OtherValidatorsParticipate;
