import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Slider, Button } from '@mui/material';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

function ValidatorBettingOverview({ onNextStep }) {
  const [userValidatorData, setUserValidatorData] = useState(null);
  const [validators, setValidators] = useState([]);
  const [odds, setOdds] = useState(2.5);
  const [vGain, setVGain] = useState(0);
  const [vLoss, setVLoss] = useState(0);
  const [baseReward, setBaseReward] = useState(0);

  const FINALITY_REWARD_COEFFICIENT = 6e-7; // Increased by a factor of 1000
  const BLOCK_TIME = 4;
  const bet_coeff = 1;
  const total_validating_ether = 4045;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateBet();
  }, [odds, userValidatorData]);

  const loadData = () => {
    const storedUserValidatorData = JSON.parse(localStorage.getItem('userValidatorData') || '{}');
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');

    setUserValidatorData(storedUserValidatorData);
    setValidators(storedValidators);
  };

  const calculateBet = () => {
    if (!userValidatorData || !userValidatorData.stake) return;

    const calculatedBaseReward = FINALITY_REWARD_COEFFICIENT * BLOCK_TIME * total_validating_ether;
    setBaseReward(calculatedBaseReward);

    const calculatedVLoss = calculatedBaseReward * odds * bet_coeff * parseFloat(userValidatorData.stake);
    const calculatedVGain = calculatedBaseReward * Math.log(odds) * bet_coeff * parseFloat(userValidatorData.stake);

    setVLoss(calculatedVLoss);
    setVGain(calculatedVGain);
  };

  const handleOddsChange = (event, newValue) => {
    setOdds(newValue);
  };

  const handleSubmitBet = () => {
    const updatedValidators = [...validators];
    const userValidatorIndex = updatedValidators.findIndex(v => v.id === userValidatorData.id);
    
    if (userValidatorIndex !== -1) {
      updatedValidators[userValidatorIndex] = {
        ...updatedValidators[userValidatorIndex],
        vLoss,
        vGain,
        odds
      };

      localStorage.setItem('validators', JSON.stringify(updatedValidators));
      setValidators(updatedValidators);

      // Save user's finality betting data
      const userFinalityBetting = {
        validatorId: userValidatorData.id,
        odds,
        V_LOSS: vLoss,
        V_GAIN: vGain
      };
      localStorage.setItem('userFinalityBetting', JSON.stringify(userFinalityBetting));

      // Call onNextStep after submitting the bet
      onNextStep();
    } else {
      console.error('User validator not found in the validators list');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Validator Betting Overview
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" paragraph>
          You, as a validator, will now decide how much you're willing to bet on your proposed chain. Remember, you need to be strategic, as the risk (V_LOSS) and reward (V_GAIN) depend on your confidence level in the chain being finalized.
        </Typography>
        <Typography variant="body2" gutterBottom>
          Select your betting odds:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Slider
            value={odds}
            onChange={handleOddsChange}
            min={1.1}
            max={5.0}
            step={0.1}
            marks
            valueLabelDisplay="auto"
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <Typography variant="body2">
            Selected odds: {odds.toFixed(2)}
          </Typography>
        </Box>
        <Typography variant="body2" paragraph>
          Higher odds increase potential rewards but also increase risk. Choose your odds based on how confident you are in the proposed chain being finalized.
        </Typography>
        <Typography variant="body2" gutterBottom>
          Your stake: {userValidatorData?.stake || 'N/A'} ETH
        </Typography>
        
        <Box sx={{ mt: 4, '& > *': { mb: 4 } }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Step 1: Calculating BASE_REWARD</Typography>
            <Typography variant="body2" paragraph>
              The base reward depends on the total Ether validating the network and serves as a starting point for determining rewards and risks.
            </Typography>
            <BlockMath math={`\\text{BASE\\_REWARD} = \\text{FINALITY\\_REWARD\\_COEFFICIENT} \\times \\text{BLOCK\\_TIME} \\times \\text{total\\_validating\\_ether}`} />
            <BlockMath math={`\\text{BASE\\_REWARD} = ${FINALITY_REWARD_COEFFICIENT} \\times ${BLOCK_TIME} \\times ${total_validating_ether}`} />
            <Typography variant="body1" fontWeight="bold">
              BASE_REWARD = {baseReward} ETH
            </Typography>
          </Paper>

          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Step 2: Calculating V_LOSS</Typography>
            <Typography variant="body2" paragraph>
              This represents the amount of ETH you are willing to risk if your chosen chain is not finalized.
            </Typography>
            <BlockMath math={`V_{LOSS} = \\text{BASE\\_REWARD} \\times \\text{odds} \\times \\text{bet\\_coeff} \\times \\text{stake}`} />
            <BlockMath math={`V_{LOSS} = ${baseReward} \\times ${odds} \\times ${bet_coeff} \\times ${userValidatorData?.stake || 0}`} />
            <Typography variant="body1" fontWeight="bold">
              V_LOSS = {vLoss} ETH
            </Typography>
          </Paper>

          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Step 3: Calculating V_GAIN</Typography>
            <Typography variant="body2" paragraph>
              This represents the amount of ETH you could gain if your chosen chain is finalized.
            </Typography>
            <BlockMath math={`V_{GAIN} = \\text{BASE\\_REWARD} \\times \\log(\\text{odds}) \\times \\text{bet\\_coeff} \\times \\text{stake}`} />
            <BlockMath math={`V_{GAIN} = ${baseReward} \\times \\log(${odds}) \\times ${bet_coeff} \\times ${userValidatorData?.stake || 0}`} />
            <Typography variant="body1" fontWeight="bold">
              V_GAIN = {vGain} ETH
            </Typography>
          </Paper>
        </Box>

        <Typography variant="body2" paragraph>
          After adjusting your odds and reviewing the calculations, click below to submit your bet.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleSubmitBet} 
          sx={{ mt: 2 }}
        >
          Submit bet
        </Button>
      </Paper>
    </Box>
  );
}

export default ValidatorBettingOverview;
