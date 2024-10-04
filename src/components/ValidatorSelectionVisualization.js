import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Tooltip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Label, LabelList, Area, ComposedChart } from 'recharts';

function ValidatorSelectionVisualization({ validators, randomValue, onSelect }) {
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [pseudoRandomValue, setPseudoRandomValue] = useState(null);
  const [cumulativeData, setCumulativeData] = useState([]);

  useEffect(() => {
    let cumulativeSum = 0;
    const data = validators.map(validator => {
      const start = cumulativeSum;
      cumulativeSum += validator.stake;
      return {
        id: validator.id,
        name: `Validator ${validator.id}${validator.id === validators.length ? ' (you)' : ''}`,
        stake: validator.stake,
        start,
        end: cumulativeSum,
        cumulativeStake: cumulativeSum,
        isUserCreated: validator.id === validators.length
      };
    });
    setCumulativeData(data);
  }, [validators]);

  const selectValidator = () => {
    const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
    const r = (parseInt(randomValue, 16) / (2 ** 256 - 1)) * totalStake;
    setPseudoRandomValue(r);

    let selected = null;
    for (let validator of cumulativeData) {
      if (r >= validator.start && r < validator.end) {
        selected = validator;
        break;
      }
    }

    setSelectedValidator(selected);
    onSelect(selected);
  };

  const CustomBar = (props) => {
    const { x, y, width, height, fill, payload } = props;
    return (
      <Tooltip title={`Validator ${payload.id}: ${payload.stake} ETH`}>
        <g>
          <rect 
            x={x} 
            y={y} 
            width={width} 
            height={height} 
            fill={payload.id === selectedValidator?.id ? '#4CAF50' : fill}
            stroke={payload.isUserCreated ? '#000' : 'none'}
            strokeWidth={2}
          />
        </g>
      </Tooltip>
    );
  };

  const renderCustomizedLabel = (props) => {
    const { x, y, width, height, value, name } = props;
    const fontSize = Math.min(12, width / 5);
    return (
      <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={fontSize}>
        {`${name}: ${value} ETH`}
      </text>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Validator Selection</Typography>
      <Typography variant="body1" gutterBottom>
        Random Value: {randomValue}
      </Typography>
      <Button variant="contained" onClick={selectValidator} disabled={!!selectedValidator}>
        Select Validator
      </Button>
      <Box sx={{ height: 600, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={cumulativeData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
            <Bar dataKey="stake" fill="#8884d8" shape={<CustomBar />}>
              <LabelList dataKey="stake" content={renderCustomizedLabel} />
            </Bar>
            <Area type="stepAfter" dataKey="cumulativeStake" stroke="#82ca9d" fill="#82ca9d" opacity={0.3} />
            {pseudoRandomValue && (
              <ReferenceLine
                x={pseudoRandomValue}
                stroke="red"
                strokeWidth={2}
                label={<Label value="r" position="top" />}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      {selectedValidator && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Selected Validator</Typography>
          <Typography variant="body1">ID: <strong>{selectedValidator.id}</strong></Typography>
          <Typography variant="body1">Stake: <strong>{selectedValidator.stake} ETH</strong></Typography>
          <Typography variant="body1">Cumulative Range: <strong>[{selectedValidator.start.toFixed(2)}, {selectedValidator.end.toFixed(2)}]</strong></Typography>
          <Typography variant="body1">Pseudorandom value (r): <strong>{pseudoRandomValue.toFixed(2)}</strong></Typography>
          <Typography variant="body1">
            Pseudorandom value (r) = <strong>{pseudoRandomValue.toFixed(2)}</strong> falls in Validator {selectedValidator.id}'s range: 
            <strong>[{selectedValidator.start.toFixed(2)}, {selectedValidator.end.toFixed(2)}]</strong>
          </Typography>
          <Typography variant="body1">
            <strong>Validator {selectedValidator.id} is selected to produce the next block.</strong>
          </Typography>
        </Paper>
      )}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Legend:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#8884d8', mr: 1 }} />
          <Typography variant="body2">Validator Stake</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#82ca9d', opacity: 0.3, mr: 1 }} />
          <Typography variant="body2">Cumulative Stake</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#4CAF50', mr: 1 }} />
          <Typography variant="body2">Selected Validator</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 20, height: 20, border: '2px solid #000', mr: 1 }} />
          <Typography variant="body2">Your Validator</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default ValidatorSelectionVisualization;