import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

function ChainSelectionAndFinality() {
  const [chainData, setChainData] = useState({ finalized: [], proposed: null, forked: null });
  const [validators, setValidators] = useState([]);
  const [votes, setVotes] = useState([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    loadChainData();
  }, []);

  useEffect(() => {
    if (chainData.finalized.length > 0 && validators.length > 0) {
      drawChainVisualization();
    }
  }, [chainData, validators, votes, isFinalized]);

  const loadChainData = () => {
    const singleChain = JSON.parse(localStorage.getItem('singleChain') || '[]');
    const validatorData = JSON.parse(localStorage.getItem('validators') || '[]');
    const competingForkData = JSON.parse(localStorage.getItem('competingForkData') || '{}');

    if (singleChain.length === 0) {
      console.error('No chain data found in local storage');
      return;
    }

    const finalizedChain = singleChain.slice(0, -1);
    const proposedBlock = singleChain[singleChain.length - 1];
    const forkedBlock = competingForkData.block;

    setChainData({
      finalized: finalizedChain,
      proposed: proposedBlock,
      forked: forkedBlock
    });

    setValidators(validatorData);
  };

  const simulateVoting = () => {
    const newVotes = validators.map(validator => {
      // Ensure at least 2/3 vote for the proposed chain
      const voteForProposed = Math.random() < 0.8;
      return { validator, voteForProposed };
    });
    setVotes(newVotes);

    const proposedVotes = newVotes.filter(v => v.voteForProposed).length;
    if (proposedVotes >= Math.ceil(validators.length * 2 / 3)) {
      setIsFinalized(true);
      updateFinalizedChain();
    }
  };

  const updateFinalizedChain = () => {
    const updatedChain = [...chainData.finalized, chainData.proposed];
    localStorage.setItem('singleChain', JSON.stringify(updatedChain));
    localStorage.setItem('finalizedChainData', JSON.stringify(updatedChain));
  };

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

    drawBlock(svg, proposedX, proposedY, chainData.proposed, isFinalized ? '#4caf50' : '#2196f3');
    drawBlock(svg, proposedX, forkedY, chainData.forked, isFinalized ? '#d32f2f' : '#ff9800');

    // Draw arrows to proposed and forked blocks
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, proposedY + blockHeight / 2);
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, forkedY + blockHeight / 2);

    // Draw votes
    votes.forEach((vote, index) => {
      const x = proposedX + blockWidth + 20;
      const y = index * 20 + 20;
      const color = vote.voteForProposed ? '#4caf50' : '#d32f2f';
      drawVote(svg, x, y, color, vote.validator.id);
    });
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

  const drawVote = (svg, x, y, color, validatorId) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', color);
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 10);
    text.setAttribute('y', y);
    text.setAttribute('dy', '0.3em');
    text.setAttribute('font-size', '10px');
    text.textContent = `Validator ${validatorId}`;
    svg.appendChild(text);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Chain Selection & Finality
      </Typography>
      <Typography variant="body1" paragraph>
        Validators vote to reach consensus and finalize one of the diverging chains.
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2">
          Green: Finalized chain
        </Typography>
        <Typography variant="body2">
          Blue: Proposed block (not yet finalized)
        </Typography>
        <Typography variant="body2">
          Orange: Competing fork
        </Typography>
        <Typography variant="body2">
          Green dots: Votes for proposed chain
        </Typography>
        <Typography variant="body2">
          Red dots: Votes for competing fork
        </Typography>
      </Paper>
      <Box sx={{ width: '100%', height: 400, mb: 2 }}>
        <svg ref={svgRef} width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>
        </svg>
      </Box>
      <Button variant="contained" onClick={simulateVoting} disabled={isFinalized} sx={{ mb: 2 }}>
        {isFinalized ? 'Finalized' : 'Simulate Voting'}
      </Button>
      <Typography variant="body1" paragraph>
        {isFinalized 
          ? 'Consensus reached! The proposed chain has been finalized.' 
          : 'Click the button to simulate the voting process and reach consensus.'}
      </Typography>
      <Typography variant="body1">
        Once quorum is reached (at least 2/3 of validators vote for a chain), that chain becomes finalized and added to the main chain.
        The competing fork is discarded.
      </Typography>
    </Box>
  );
}

export default ChainSelectionAndFinality;