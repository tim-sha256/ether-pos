import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

function PenaltiesAndSlashing() {
  const [validator, setValidator] = useState(null);
  const [competingForkData, setCompetingForkData] = useState(null);
  const [misconduct, setMisconduct] = useState(null);
  const [selectedPenaltyAction, setSelectedPenaltyAction] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [slashedAmount, setSlashedAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const selectedValidatorID = localStorage.getItem('selectedValidatorID');
      const validators = JSON.parse(localStorage.getItem('validators') || '[]');
      const competingForkData = JSON.parse(localStorage.getItem('competingForkData') || '{}');
      
      const selectedValidator = validators.find(v => v.id.toString() === selectedValidatorID);
      
      if (!selectedValidator) {
        throw new Error('Selected validator not found');
      }
      
      setValidator(selectedValidator);
      setCompetingForkData(competingForkData);
      
      evaluateMisconduct(selectedValidator, competingForkData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    }
  };

  const evaluateMisconduct = (validator, competingForkData) => {
    if (competingForkData.validator && competingForkData.validator.id === validator.id) {
      setMisconduct('Double Signing');
      
      const FINALITY_REWARD_COEFFICIENT = 3 / 1000000000;
      const SLASHING_PENALTY_COEFFICIENT = FINALITY_REWARD_COEFFICIENT * 2000;
      const slashedAmount = validator.stake * SLASHING_PENALTY_COEFFICIENT;
      setSlashedAmount(slashedAmount);

      const OFFLINE_PENALTY_COEFFICIENT = FINALITY_REWARD_COEFFICIENT * 500;
      const penaltyAmount = validator.stake * OFFLINE_PENALTY_COEFFICIENT;
      setPenaltyAmount(penaltyAmount);
    } else {
      setMisconduct(null);
    }
  };

  const handlePenaltySelection = (action) => {
    setSelectedPenaltyAction(action);
  };

  const renderPenaltyFlow = () => {
    if (!validator) return null;

    return (
      <Box sx={{ position: 'relative', height: 300, width: '100%', mt: 4 }}>
        <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
          <circle cx="50" cy="150" r="40" fill="#4CAF50" />
          <text x="50" y="150" textAnchor="middle" fill="white" dy=".3em">Validator</text>

          {selectedPenaltyAction === 'slash' && (
            <>
              <circle cx="750" cy="75" r="40" fill="#F44336" />
              <text x="750" y="75" textAnchor="middle" fill="white" dy=".3em">Burned</text>
              <line x1="90" y1="150" x2="710" y2="75" stroke="red" strokeWidth="2" />
              <text x="400" y="100" textAnchor="middle" fill="red">
                {`${slashedAmount.toFixed(4)} ETH (Burned)`}
              </text>
            </>
          )}

          <circle cx="750" cy="225" r="40" fill="#2196F3" />
          <text x="750" y="225" textAnchor="middle" fill="white" dy=".3em">Network</text>

          <line x1="90" y1="150" x2="710" y2="225" stroke="blue" strokeWidth="2" />
          <text x="400" y="200" textAnchor="middle" fill="blue">
            {`${selectedPenaltyAction === 'slash' ? (validator.stake - slashedAmount).toFixed(4) : penaltyAmount.toFixed(4)} ETH to Network`}
          </text>
        </svg>
      </Box>
    );
  };

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!validator) {
    return <Typography>Loading validator data... Please make sure you have completed previous steps.</Typography>;
  }

  return (
    <Box>
      {/* <Typography variant="h4" gutterBottom>
        Penalties and Slashing
      </Typography> */}
      <Typography variant="body1" paragraph>
        In Ethereum's Proof of Stake system, penalties and slashing mechanisms are crucial for maintaining network security and incentivizing proper validator behavior. Penalties are applied for minor infractions, while slashing is a more severe punishment for significant protocol violations.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Conditions for Penalties</Typography>
        <ul>
          <li><strong>Offline Penalty:</strong> Applied when validators fail to stay online during their assigned slot.</li>
          <li><strong>Performance Penalty:</strong> Imposed when validators fail to correctly attest or perform their duties.</li>
        </ul>
        <Typography variant="body2">
          Penalties are proportional to the amount staked and current network conditions.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Slashing Conditions</Typography>
        <Typography variant="body1" paragraph>
          Slashing occurs for severe protocol violations, such as:
        </Typography>
        <ul>
          <li><strong>Double Signing:</strong> Proposing or attesting to multiple blocks in the same slot.</li>
          <li><strong>Surround Votes:</strong> Attesting to a block that "surrounds" another attestation.</li>
        </ul>
        <Typography variant="body2" paragraph>
          The slashing penalty is calculated using the following formula:
        </Typography>
        <BlockMath>
          {`
            \\text{Slashing Penalty} = \\text{Slashing Coefficient} \\times \\text{Validator Stake}
          `}
        </BlockMath>
        <Typography variant="body2" paragraph>
          Where the Slashing Coefficient is:
        </Typography>
        <BlockMath>
          {`
            \\text{Slashing Coefficient} = \\frac{3}{1000000000} \\times 2000
          `}
        </BlockMath>
      </Paper>

      {misconduct && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Validator Misconduct Detected
          </Typography>
          <Typography variant="body1" paragraph>
            Validator <strong>ID: {validator.id}</strong> has been detected with a competing block proposal.
            This could constitute <strong>{misconduct}</strong>.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => handlePenaltySelection('ignore')}>
              Ignore Misconduct
            </Button>
            <Button variant="contained" color="warning" sx={{ ml: 2 }} onClick={() => handlePenaltySelection('penalty')}>
              Issue Penalty
            </Button>
            <Button variant="contained" color="error" sx={{ ml: 2 }} onClick={() => handlePenaltySelection('slash')}>
              Slash Stake
            </Button>
          </Box>
        </Paper>
      )}

      {selectedPenaltyAction && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Penalty Action Result</Typography>
          {selectedPenaltyAction === 'ignore' && (
            <Typography>No action taken. The validator's stake remains unchanged.</Typography>
          )}
          {selectedPenaltyAction === 'penalty' && (
            <>
              <Typography>A penalty has been issued to the validator.</Typography>
              <Typography>
                Penalty Amount: <InlineMath math={`${penaltyAmount.toFixed(4)} \\text{ ETH}`} />
              </Typography>
            </>
          )}
          {selectedPenaltyAction === 'slash' && (
            <>
              <Typography>The validator's stake has been slashed.</Typography>
              <Typography>
                Slashed Amount: <InlineMath math={`${slashedAmount.toFixed(4)} \\text{ ETH}`} />
              </Typography>
            </>
          )}
          {renderPenaltyFlow()}
        </Paper>
      )}
    </Box>
  );
}

export default PenaltiesAndSlashing;
