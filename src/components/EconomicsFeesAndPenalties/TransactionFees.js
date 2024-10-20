import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Slider, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

function TransactionFees() {
  const [sampleTransaction, setSampleTransaction] = useState(null);
  const [feeBreakdown, setFeeBreakdown] = useState({ baseFee: 630000, tip: 42000, total: 672000 });
  const [feeRecipient, setFeeRecipient] = useState('Unknown');
  const [priorityFee, setPriorityFee] = useState(2);
  const [showFlowchart, setShowFlowchart] = useState(false);

  useEffect(() => {
    loadTransactionData();
  }, []);

  useEffect(() => {
    if (sampleTransaction) {
      calculateFees(priorityFee, sampleTransaction.gasLimit, sampleTransaction.baseFeePerGas);
    }
  }, [priorityFee, sampleTransaction]);

  const loadTransactionData = () => {
    const storedTransaction = JSON.parse(localStorage.getItem('sampleTransaction') || '{}');
    const selectedValidatorID = localStorage.getItem('selectedValidatorID');
    const validators = JSON.parse(localStorage.getItem('validators') || '[]');
    const userValidatorData = JSON.parse(localStorage.getItem('userValidatorData') || '{}');
    
    const transaction = storedTransaction.from ? storedTransaction : {
      from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      value: '1.5',
      gasLimit: 21000,
      baseFeePerGas: 30,
      priorityFeePerGas: 2
    };
    setSampleTransaction(transaction);
    
    let recipientAddress = 'Unknown';
    if (selectedValidatorID) {
      const selectedValidator = validators.find(v => v.id === selectedValidatorID);
      recipientAddress = selectedValidator?.withdrawalAddress || 'Unknown';
    } else if (userValidatorData?.withdrawalAddress) {
      recipientAddress = userValidatorData.withdrawalAddress;
    }
    setFeeRecipient(recipientAddress);

    const storedPriorityFee = localStorage.getItem('priorityFeePerGas');
    setPriorityFee(storedPriorityFee ? parseFloat(storedPriorityFee) : transaction.priorityFeePerGas);
  };

  const calculateFees = (userPriorityFee, gasLimit, baseFeePerGas) => {
    const baseFee = baseFeePerGas * gasLimit;
    const tip = userPriorityFee * gasLimit;
    const total = baseFee + tip;

    setFeeBreakdown({
      baseFee: baseFee,
      tip: tip,
      total: total
    });

    setShowFlowchart(true);
  };

  const handlePriorityFeeChange = (event, newValue) => {
    if (newValue < 0) {
      alert('Priority Fee cannot be negative');
      return;
    }
    setPriorityFee(newValue);
    localStorage.setItem('priorityFeePerGas', newValue.toString());
  };

  const renderFlowchart = () => {
    if (!showFlowchart || !sampleTransaction) return null;

    const weiToEth = (wei) => (parseInt(wei) / 1e18).toFixed(18);

    return (
      <Box sx={{ position: 'relative', height: 500, mt: 4 }}>
        <svg width="100%" height="100%">
          {/* Sender Node */}
          <circle cx="50" cy="250" r="40" fill="#4CAF50" />
          <text x="50" y="250" textAnchor="middle" fill="white" dy=".3em">Sender</text>

          {/* Recipient Node */}
          <circle cx="650" cy="100" r="40" fill="#2196F3" />
          <text x="650" y="100" textAnchor="middle" fill="white" dy=".3em">Recipient</text>

          {/* Validator Node */}
          <circle cx="650" cy="250" r="40" fill="#FFC107" />
          <text x="650" y="250" textAnchor="middle" fill="white" dy=".3em">Validator</text>

          {/* Burn Node */}
          <circle cx="650" cy="400" r="40" fill="#F44336" />
          <text x="650" y="400" textAnchor="middle" fill="white" dy=".3em">Burn</text>

          {/* Arrows */}
          <Arrow start={[90, 250]} end={[610, 100]} label={`${sampleTransaction.value} ETH`} color="black" />
          <Arrow start={[90, 250]} end={[610, 250]} label={`${feeBreakdown.tip} Wei (${weiToEth(feeBreakdown.tip)} ETH)`} color="green" />
          <Arrow start={[90, 250]} end={[610, 400]} label={`${feeBreakdown.baseFee} Wei (${weiToEth(feeBreakdown.baseFee)} ETH)`} color="red" />
        </svg>

        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <Typography variant="body2">Sender: {sampleTransaction.from}</Typography>
          <Typography variant="body2">Recipient: {sampleTransaction.to}</Typography>
          <Typography variant="body2">Validator: {feeRecipient}</Typography>
        </Box>
      </Box>
    );
  };

  const Arrow = ({ start, end, label, color }) => {
    // Calculate angle for rotation
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Convert from radians to degrees
  
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
  
    return (
      <g>
        {/* Draw the line */}
        <line
          x1={start[0]}
          y1={start[1]}
          x2={end[0]}
          y2={end[1]}
          stroke={color}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {/* Draw the label rotated along the line */}
        <text
          x={midX}
          y={midY}
          transform={`rotate(${angle}, ${midX}, ${midY})`}
          textAnchor="middle"
          fill={color}
          dy="-0.5em"
        >
          {label}
        </text>
      </g>
    );
  };
  

  if (!sampleTransaction) {
    return <Typography>Loading transaction data...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transaction Fees Breakdown
      </Typography>
      <Typography variant="body1" paragraph>
        In Ethereum's economic model, transaction fees play a crucial role in managing network congestion and incentivizing validators. Let's break down a sample transaction to understand how fees are calculated and distributed.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Sample Transaction
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>From:</strong> {sampleTransaction.from}</Typography>
            <Typography><strong>To:</strong> {sampleTransaction.to}</Typography>
            <Typography><strong>Value:</strong> {sampleTransaction.value} ETH</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Gas Limit:</strong> {sampleTransaction.gasLimit}</Typography>
            <Typography><strong>Base Fee Per Gas:</strong> {sampleTransaction.baseFeePerGas} Wei</Typography>
            <Typography><strong>Priority Fee Per Gas:</strong> {priorityFee} Wei</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Set Priority Fee</Typography>
        <Slider
          value={priorityFee}
          onChange={handlePriorityFeeChange}
          aria-labelledby="priority-fee-slider"
          valueLabelDisplay="auto"
          step={0.1}
          marks
          min={0}
          max={10}
          sx={{ mb: 2 }}
        />
        <Typography>Priority Fee: {priorityFee} Wei</Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Fee Breakdown and Distribution
        </Typography>
        <Typography variant="body1">
          <Tooltip title="Burned to reduce ETH supply and manage network congestion">
            <span>
              <strong>Base Fee:</strong> {feeBreakdown.baseFee} Wei ({(feeBreakdown.baseFee / 1e18).toFixed(18)} ETH)
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Typography>
        <BlockMath>
          {`\\text{Base Fee} = \\text{Base Fee Per Gas} \\times \\text{Gas Limit} = ${sampleTransaction.baseFeePerGas} \\times ${sampleTransaction.gasLimit} = ${feeBreakdown.baseFee} \\text{ Wei}`}
        </BlockMath>
        <Typography variant="body1">
          <Tooltip title="Reward paid to validators to prioritize the transaction">
            <span>
              <strong>Priority Fee (Tip):</strong> {feeBreakdown.tip} Wei ({(feeBreakdown.tip / 1e18).toFixed(18)} ETH)
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Typography>
        <BlockMath>
          {`\\text{Priority Fee} = \\text{Priority Fee Per Gas} \\times \\text{Gas Limit} = ${priorityFee} \\times ${sampleTransaction.gasLimit} = ${feeBreakdown.tip} \\text{ Wei}`}
        </BlockMath>
        <Typography variant="body1">
          <strong>Total Fee:</strong> {feeBreakdown.total} Wei ({(feeBreakdown.total / 1e18).toFixed(18)} ETH)
        </Typography>
        <BlockMath>
          {`\\text{Total Fee} = \\text{Base Fee} + \\text{Priority Fee} = ${feeBreakdown.baseFee} + ${feeBreakdown.tip} = ${feeBreakdown.total} \\text{ Wei}`}
        </BlockMath>
        <Typography variant="body1">
          <strong>Fee Recipient Address:</strong> {feeRecipient}
        </Typography>
        {renderFlowchart()}
      </Paper>

      <Typography variant="body1" paragraph>
        In this model:
      </Typography>
      <ul>
        <li>The transaction value goes directly to the recipient.</li>
        <li>The priority fee (tip) is paid to the validator as an incentive for including the transaction in the block.</li>
        <li>The base fee is burned, effectively reducing the overall ETH supply and potentially making ETH deflationary over time.</li>
      </ul>
      <Typography variant="body1">
        This fee structure helps to align incentives, manage network congestion, and create a more predictable fee market.
      </Typography>
    </Box>
  );
}

export default TransactionFees;
