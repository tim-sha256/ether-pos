import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Card, CardContent, LinearProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { BlockMath } from 'react-katex';
import CasinoIcon from '@mui/icons-material/Casino';

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

  useEffect(() => {
    loadData();
    // Scroll to the top when the component mounts
    if (componentRef.current) {
      componentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (validators.length > 0 && currentValidatorIndex < validators.length) {
      const timer = setTimeout(() => simulateValidatorBet(currentValidatorIndex), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentValidatorIndex, validators]);

  const loadData = () => {
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    const storedCompetingForkData = JSON.parse(localStorage.getItem('competingForkData') || '{}');
    const storedProposedBlock = JSON.parse(localStorage.getItem('proposedBlock') || '{}');
    const storedGlobalRandao = localStorage.getItem('globalRandao') || '';
    const storedUserFinalityBetting = JSON.parse(localStorage.getItem('userFinalityBetting') || '{}');

    setValidators(storedValidators);
    setCompetingForkData(storedCompetingForkData);
    setProposedBlock(storedProposedBlock);
    setGlobalRandao(storedGlobalRandao);
    setUserFinalityBetting(storedUserFinalityBetting);

    // Initialize chain support with user's bet and competing fork validator
    setChainSupport({ proposed: 1, competing: 1 });
    setTotalStakePerChain({ 
      proposed: storedValidators.find(v => v.id === storedUserFinalityBetting.validatorId)?.stake || 0, 
      competing: storedCompetingForkData.validator.stake || 0
    });

    // Assign the competing fork validator to the competing chain
    const updatedValidators = storedValidators.map(v => 
      v.id === storedCompetingForkData.validator.id 
        ? { ...v, chosenChain: 'competing' } 
        : v
    );
    setValidators(updatedValidators);
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

    const updatedValidator = {
      ...validator,
      vLoss,
      vGain,
      chosenChain,
      odds
    };

    setValidators(prevValidators => {
      const newValidators = [...prevValidators];
      newValidators[index] = updatedValidator;
      return newValidators;
    });

    setChainSupport(prevSupport => ({
      ...prevSupport,
      [chosenChain]: prevSupport[chosenChain] + 1
    }));

    setTotalStakePerChain(prevStake => ({
      ...prevStake,
      [chosenChain]: prevStake[chosenChain] + validator.stake
    }));

    setCurrentValidatorIndex(prevIndex => prevIndex + 1);
  };

  const renderFormulas = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Formulas Used:</Typography>
      <BlockMath math={`\\text{BASE\\_REWARD} = \\text{FINALITY\\_REWARD\\_COEFFICIENT} \\times \\text{BLOCK\\_TIME} \\times \\text{total\\_validating\\_ether}`} />
      <BlockMath math={`V_{LOSS} = \\text{BASE\\_REWARD} \\times \\text{odds} \\times \\text{bet\\_coeff} \\times \\text{stake}`} />
      <BlockMath math={`V_{GAIN} = \\text{BASE\\_REWARD} \\times \\log(\\text{odds}) \\times \\text{bet\\_coeff} \\times \\text{stake}`} />
      <Typography variant="body2">
        Constants: FINALITY_REWARD_COEFFICIENT = {FINALITY_REWARD_COEFFICIENT}, BLOCK_TIME = {BLOCK_TIME}, bet_coeff = {bet_coeff}, total_validating_ether = {total_validating_ether}
      </Typography>
    </Box>
  );

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
    const betChain = calculateBetChain(validator.randaoReveal);

    return (
      <motion.div
        key={validator.id}
        initial={{ opacity: 0, y: 50 }}
        animate={index < currentValidatorIndex || isUserValidator || isCompetingValidator ? { opacity: 1, y: 0 } : {}}
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
              {isUserValidator ? ' (You)' : isCompetingValidator ? ' (Competing)' : ''}
            </Typography>
            <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
              Stake: {validator.stake} ETH
            </Typography>
            <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
              Randao Reveal: {validator.randaoReveal.slice(0, 10)}...
            </Typography>
            {(validator.chosenChain || isUserValidator || isCompetingValidator) && (
              <>
                <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                  Chain: {isUserValidator ? 'proposed' : isCompetingValidator ? 'competing' : validator.chosenChain}
                </Typography>
                <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                  Odds: {isUserValidator ? userFinalityBetting.odds.toFixed(2) : validator.odds?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                  V_LOSS: {isUserValidator ? userFinalityBetting.V_LOSS.toFixed(4) : validator.vLoss?.toFixed(4)} ETH
                </Typography>
                <Typography variant="body2" color={isUserValidator || isCompetingValidator ? 'white' : 'inherit'}>
                  V_GAIN: {isUserValidator ? userFinalityBetting.V_GAIN.toFixed(4) : validator.vGain?.toFixed(4)} ETH
                </Typography>
                <Tooltip title={`Bet Chain Selection: XOR(globalRandao, randaoReveal) % 2 == 0 ? "Proposed" : "Competing"`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CasinoIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Randomness Result: {betChain.charAt(0).toUpperCase() + betChain.slice(1)}
                    </Typography>
                  </Box>
                </Tooltip>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

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
          <Typography variant="body2">Proposed Chain Stake: {totalStakePerChain.proposed.toFixed(2)} ETH</Typography>
          <Typography variant="body2">Competing Chain Stake: {totalStakePerChain.competing.toFixed(2)} ETH</Typography>
        </Box>
      </Paper>
      {renderGlobalRandaoBanner()}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {validators.map((validator, index) => renderValidatorCard(validator, index))}
      </Box>
      {renderFormulas()}
    </Box>
  );
}

export default OtherValidatorsParticipate;
