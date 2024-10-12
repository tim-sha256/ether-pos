import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

function XorCalculation({ randaoResult, globalRandao, onComplete }) {
  const [xorResult, setXorResult] = useState('');
  const [binarySteps, setBinarySteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [calculatedXOR, setCalculatedXOR] = useState('');
  const [originalGlobalRandao, setOriginalGlobalRandao] = useState(globalRandao);

  const hexToBinary = (hex) => {
    return parseInt(hex.slice(2), 16).toString(2).padStart(64, '0');
  };

  const binaryToHex = (binary) => {
    return '0x' + parseInt(binary, 2).toString(16).padStart(16, '0');
  };

  const calculateXor = () => {
    // Use only the first 16 characters of the hash for illustration
    const shortRandao = randaoResult.slice(0, 18); // '0x' + 16 characters
    const shortGlobalRandao = originalGlobalRandao.slice(0, 18);

    const randaoBinary = hexToBinary(shortRandao);
    const globalBinary = hexToBinary(shortGlobalRandao);
    let resultBinary = '';

    for (let i = 0; i < 64; i++) {
      resultBinary += randaoBinary[i] === globalBinary[i] ? '0' : '1';
    }

    const resultHex = binaryToHex(resultBinary);
    setXorResult(resultHex);
    setBinarySteps([randaoBinary, globalBinary, resultBinary]);
    setCurrentStep(0);

    // Calculate the full XOR result
    const fullResultHex = calculateFullXor(randaoResult, originalGlobalRandao);
    setCalculatedXOR(fullResultHex);
    onComplete(fullResultHex);
  };

  const calculateFullXor = (hex1, hex2) => {
    const maxLength = Math.max(hex1.length, hex2.length);
    const padded1 = hex1.slice(2).padStart(maxLength - 2, '0');
    const padded2 = hex2.slice(2).padStart(maxLength - 2, '0');
    let result = '';
    for (let i = 0; i < maxLength - 2; i++) {
      const byte1 = parseInt(padded1.substr(i, 1), 16);
      const byte2 = parseInt(padded2.substr(i, 1), 16);
      result += (byte1 ^ byte2).toString(16);
    }
    return '0x' + result;
  };

  useEffect(() => {
    if (currentStep < 64 && binarySteps.length > 0) {
      const timer = setTimeout(() => setCurrentStep(currentStep + 1), 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep, binarySteps]);

  const renderBinaryRow = (binary, label) => (
    <Box sx={{ display: 'flex', mb: 1 }}>
      <Typography variant="body2" sx={{ width: 120, flexShrink: 0 }}>{label}:</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {binary.slice(0, currentStep).split('').map((bit, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              color: binarySteps[2] && binarySteps[0][index] === binarySteps[1][index] ? 'green' : 'red',
              width: '10px',
              textAlign: 'center'
            }}
          >
            {bit}
          </motion.span>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Global XOR Calculation</Typography>
      <Typography variant="body1" gutterBottom>
        RANDao Result: {randaoResult.slice(0, 18)}...
      </Typography>
      <Typography variant="body1" gutterBottom>
        Global RANDao: {originalGlobalRandao.slice(0, 18)}...
      </Typography>
      <Button variant="contained" onClick={calculateXor}>Calculate XOR</Button>
      {binarySteps.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, overflowX: 'auto' }}>
          {renderBinaryRow(binarySteps[0], 'RANDAO')}
          {renderBinaryRow(binarySteps[1], 'Global RANDAO')}
          {renderBinaryRow(binarySteps[2], 'XOR Result')}
        </Paper>
      )}
      {xorResult && currentStep === 64 && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Illustrated XOR Result: {xorResult}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Full XOR Result: {calculatedXOR}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            This is the new Global Randao value
          </Typography>
        </>
      )}
    </Box>
  );
}

export default XorCalculation;
