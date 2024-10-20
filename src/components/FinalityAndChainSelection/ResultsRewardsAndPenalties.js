import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ResultsRewardsAndPenalties() {
  const [bettingResults, setBettingResults] = useState(null);
  const [validators, setValidators] = useState([]);
  const [stakeChanges, setStakeChanges] = useState([]);
  const [chainData, setChainData] = useState({ finalized: [], proposed: null, forked: null });
  const svgRef = useRef(null);

  useEffect(() => {
    const storedBettingResults = JSON.parse(localStorage.getItem('bettingResults') || '{}');
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    const storedChainData = JSON.parse(localStorage.getItem('singleChain') || '[]');
    const storedCompetingForkData = JSON.parse(localStorage.getItem('competingForkData') || '{}');
    
    setBettingResults(storedBettingResults);
    setValidators(storedValidators);
    
    // Prepare chain data for visualization
    const finalizedChain = storedChainData.slice(0, -1);
    const proposedBlock = storedChainData[storedChainData.length - 1];
    const forkedBlock = storedCompetingForkData.block;
    
    setChainData({
      finalized: finalizedChain,
      proposed: proposedBlock,
      forked: forkedBlock
    });

    // Calculate stake changes for the bar chart
    const changes = storedValidators.map(validator => {
      const betResult = storedBettingResults.validators.find(v => v.validatorId === validator.id);
      const initialStake = validator.stake;
      const isProposedChain = betResult?.chain === storedBettingResults.finalizedChain;
      const change = isProposedChain ? betResult?.vGain : -betResult?.vLoss;
      const finalStake = initialStake + change;
      return {
        id: validator.id,
        initialStake,
        finalStake,
        change,
        isProposedChain
      };
    });
    setStakeChanges(changes);
  }, []);

  useEffect(() => {
    if (chainData.finalized.length > 0) {
      drawChainVisualization();
    }
  }, [chainData]);

  const drawChainVisualization = () => {
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const blockWidth = 144;
    const blockHeight = 80;
    const horizontalGap = 50;
    const verticalGap = 100;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw finalized chain
    chainData.finalized.forEach((block, index) => {
      const x = index * (blockWidth + horizontalGap);
      const y = height / 2 - blockHeight / 2;
      drawBlock(svg, x, y, block, '#4caf50');
      if (index > 0) {
        drawArrow(svg, x - horizontalGap, y + blockHeight / 2, x, y + blockHeight / 2);
      }
    });

    // Draw proposed and forked blocks
    const lastX = (chainData.finalized.length - 1) * (blockWidth + horizontalGap);
    const proposedX = lastX + blockWidth + horizontalGap;
    const proposedY = height / 2 - blockHeight - verticalGap / 2;
    const forkedY = height / 2 + verticalGap / 2;

    drawBlock(svg, proposedX, proposedY, chainData.proposed, '#4caf50'); // Green for finalized
    drawBlock(svg, proposedX, forkedY, chainData.forked, '#f44336'); // Red for rejected

    // Draw arrows to proposed and forked blocks
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, proposedY + blockHeight / 2);
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, forkedY + blockHeight / 2);

    // Add legend
    const legendY = height - 30;
    drawLegendItem(svg, 10, legendY, '#4caf50', 'Finalized Chain');
    drawLegendItem(svg, width / 2, legendY, '#f44336', 'Rejected Block');
  };

  const drawBlock = (svg, x, y, block, color) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 144);
    rect.setAttribute('height', 80);
    rect.setAttribute('fill', color);
    rect.setAttribute('rx', 5);
    g.appendChild(rect);

    const addText = (text, dy) => {
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', x + 72);
      textElement.setAttribute('y', y + 40);
      textElement.setAttribute('dy', dy);
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('fill', 'white');
      textElement.setAttribute('font-size', '11px');
      textElement.textContent = text;
      g.appendChild(textElement);
    };

    addText(`Block ${block.blockNumber}`, '-1.6em');
    addText(`Hash: ${block.hash.slice(0, 6)}...${block.hash.slice(-4)}`, '-0.4em');
    addText(`Parent: ${block.parentHash.slice(0, 6)}...${block.parentHash.slice(-4)}`, '0.8em');

    svg.appendChild(g);
  };

  const drawArrow = (svg, x1, y1, x2, y2) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', 2);
    line.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(line);
  };

  const drawLegendItem = (svg, x, y, color, text) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 20);
    rect.setAttribute('height', 20);
    rect.setAttribute('fill', color);
    svg.appendChild(rect);

    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x + 25);
    textElement.setAttribute('y', y + 15);
    textElement.setAttribute('fill', 'black');
    textElement.setAttribute('font-size', '12px');
    textElement.textContent = text;
    svg.appendChild(textElement);
  };

  const renderBettingResultBox = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Betting Result</Typography>
      <Typography>
        The {bettingResults?.finalizedChain} chain was finalized with a supermajority of 
        {' '}{((bettingResults?.proposedChainStake / (bettingResults?.proposedChainStake + bettingResults?.competingChainStake)) * 100).toFixed(2)} % 
        of the stake. The competing chain received 
        {' '}{((bettingResults?.competingChainStake / (bettingResults?.proposedChainStake + bettingResults?.competingChainStake)) * 100).toFixed(2)} % 
        of the stake.
      </Typography>
      <Box sx={{ width: '100%', height: 450, mb: 2 }}>
        <svg ref={svgRef} width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>
        </svg>
      </Box>
    </Paper>
  );

  const renderStakeChangesChart = () => {
    const formattedData = stakeChanges.map(change => ({
      ...change,
      change: Math.abs(Number(change.change)), // Use absolute value for height to avoid negative heights
      color: change.change >= 0 ? "#82ca9d" : "#ff7f7f", // Determine color based on change
      isPenalty: change.change < 0 // Flag to indicate if the change is a penalty
    }));
  
    return (
      <Box sx={{ height: 400, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
                      <p>{`Validator ID: ${data.id}`}</p>
                      <p>{`Initial Stake: ${data.initialStake.toFixed(4)} ETH`}</p>
                      <p>{`Change: ${data.isPenalty ? '-' : ''}${data.change.toFixed(4)} ETH`}</p>
                      <p>{`Final Stake: ${data.finalStake.toFixed(4)} ETH`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="initialStake" stackId="a" fill="#8884d8" />
            <Bar
              dataKey="change"
              stackId="a"
              fill={({ payload }) => payload.isPenalty ? "#ff7f7f" : "#82ca9d"} // Set fill color based on penalty or reward
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };
  







  const renderValidatorSummaryTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Validator ID</TableCell>
            <TableCell>Initial Stake</TableCell>
            <TableCell>Bet Amount</TableCell>
            <TableCell>Final Stake</TableCell>
            <TableCell>Reward/Penalty</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {validators.map(validator => {
            const betResult = bettingResults?.validators.find(v => v.validatorId === validator.id);
            const initialStake = validator.stake;
            const betAmount = betResult?.vLoss || 0;
            const isProposedChain = betResult?.chain === bettingResults?.finalizedChain;
            const rewardPenalty = isProposedChain ? betResult?.vGain : -betResult?.vLoss;
            const finalStake = initialStake + rewardPenalty;

            return (
              <TableRow key={validator.id}>
                <TableCell>{validator.id}</TableCell>
                <TableCell>{initialStake.toFixed(4)} ETH</TableCell>
                <TableCell>{betAmount.toFixed(4)} ETH</TableCell>
                <TableCell>{finalStake.toFixed(4)} ETH</TableCell>
                <TableCell 
                  sx={{ 
                    color: rewardPenalty >= 0 ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}
                >
                  {rewardPenalty.toFixed(4)} ETH
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Results, Rewards, and Penalties</Typography>
      {renderBettingResultBox()}
      <Typography variant="h6" gutterBottom>Stake Changes</Typography>
      {renderStakeChangesChart()}
      <Typography variant="h6" gutterBottom>Validator Summary</Typography>
      {renderValidatorSummaryTable()}
    </Box>
  );
}

export default ResultsRewardsAndPenalties;
