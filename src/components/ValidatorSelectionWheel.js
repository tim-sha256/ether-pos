import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

function ValidatorSelectionWheel({ validators, randomValue, onSelect }) {
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF67A1', '#FF6D00', '#A2FF67', '#67F7FF', '#FFD700'];

  useEffect(() => {
    if (selectedValidator) {
      onSelect(selectedValidator);
    }
  }, [selectedValidator, onSelect]);

  const selectValidator = () => {
    const randomNum = parseInt(randomValue, 16) / (2 ** 256 - 1);
    const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
    
    let cumulativeWeight = 0;
    let selected = null;
    for (let validator of validators) {
      cumulativeWeight += validator.stake / totalStake;
      if (randomNum <= cumulativeWeight) {
        selected = validator;
        break;
      }
    }

    const angle = randomNum * 360;
    setRotationAngle(angle);
    
    setTimeout(() => {
      setSelectedValidator(selected);
    }, 3000); // Wait for 3 seconds (duration of the wheel spin)
  };

  const data = validators.map(validator => ({
    name: `Validator ${validator.id}`,
    value: validator.stake
  }));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Validator Selection</Typography>
      <Typography variant="body1" gutterBottom>
        Random Value: {randomValue}
      </Typography>
      <Button variant="contained" onClick={selectValidator} disabled={!!selectedValidator}>
        Select Validator
      </Button>
      <Box sx={{ height: 400, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <motion.div
        style={{
          width: 2,
          height: 200,
          backgroundColor: 'red',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transformOrigin: 'top',
        }}
        animate={{ rotate: rotationAngle }}
        transition={{ duration: 3, type: 'spring' }}
      />
      {selectedValidator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Selected Validator</Typography>
            <Typography>ID: {selectedValidator.id}</Typography>
            <Typography>Stake: {selectedValidator.stake} ETH</Typography>
            <Typography>Validation Code: {selectedValidator.validationCode}</Typography>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
}

export default ValidatorSelectionWheel;