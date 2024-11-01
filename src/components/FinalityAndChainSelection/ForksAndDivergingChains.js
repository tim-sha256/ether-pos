import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { sha3_256 } from 'js-sha3';

function ForksAndDivergingChains() {
  const [chainData, setChainData] = useState({ finalized: [], proposed: null, forked: null });
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [competingValidator, setCompetingValidator] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    loadChainData();
  }, []);

  useEffect(() => {
    if (chainData.finalized.length > 0) {
      drawChainVisualization();
    }
  }, [chainData, selectedValidator, competingValidator]);

  const loadChainData = () => {
    const singleChain = JSON.parse(localStorage.getItem('singleChain') || '[]');
    const validators = JSON.parse(localStorage.getItem('validators') || '[]');
    let selectedValidatorID = localStorage.getItem('selectedValidatorID');

    console.log('singleChain:', singleChain);
    console.log('validators:', validators);
    console.log('selectedValidatorID:', selectedValidatorID);

    if (singleChain.length === 0 || !selectedValidatorID || validators.length === 0) {
      console.error('Missing chain data, selected validator ID, or validators in local storage');
      return;
    }

    // Convert selectedValidatorID to a number
    selectedValidatorID = Number(selectedValidatorID);

    const finalizedChain = singleChain.slice(0, -1);
    const proposedBlock = singleChain[singleChain.length - 1];

    // Set the selected validator
    const selectedValidator = validators.find(v => v.id === selectedValidatorID);
    console.log('selectedValidator:', selectedValidator);
    setSelectedValidator(selectedValidator);

    if (!selectedValidator) {
      console.error('Selected validator not found in validators array');
    }

    // Choose a competing validator
    let competingValidator;
    do {
      competingValidator = validators[Math.floor(Math.random() * validators.length)];
    } while (competingValidator.id === selectedValidatorID);
    setCompetingValidator(competingValidator);

    const forkedBlock = {
      blockNumber: proposedBlock.blockNumber,
      hash: `0x${sha3_256(Math.random().toString()).slice(0, 64)}`,
      parentHash: proposedBlock.parentHash,
      feeRecipient: competingValidator.withdrawalAddress,
    };

    setChainData({
      finalized: finalizedChain,
      proposed: proposedBlock,
      forked: forkedBlock,
    });

    // Store competing fork data
    const competingForkData = {
      validator: competingValidator,
      block: forkedBlock,
    };
    localStorage.setItem('competingForkData', JSON.stringify(competingForkData));
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

    // Pass selectedValidator and competingValidator to drawBlock
    drawBlock(svg, proposedX, proposedY, chainData.proposed, '#2196f3', selectedValidator);
    drawBlock(svg, proposedX, forkedY, chainData.forked, '#ff9800', competingValidator);

    // Draw arrows to proposed and forked blocks
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, proposedY + blockHeight / 2);
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, forkedY + blockHeight / 2);
  };

  const drawBlock = (svg, x, y, block, color, validator) => {
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
    if (validator && validator.id) {
      addText(`Validator: ${validator.id}`, '2em');
    }

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

  const handleRegenerateFork = () => {
    loadChainData();
  };

  return (
    <Box>
      {/* <Typography variant="h5" gutterBottom>
        Forks &amp; Diverging Chains
      </Typography> */}
      <Typography variant="body1" paragraph>
        During the block creation process, multiple validators may propose blocks simultaneously,
        leading to forks in the chain.
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2">Green: Already finalized chain</Typography>
        <Typography variant="body2">
          Blue: Our proposed block continuing the chain (Validator{' '}
          {selectedValidator?.id || 'Error reading validator ID'}).
        </Typography>
        <Typography variant="body2">
          Orange: A competing fork with a different block hash and state root (Validator{' '}
          {competingValidator?.id || 'N/A'}).
        </Typography>
      </Paper>
      <Box sx={{ width: '100%', height: 400, mb: 2 }}>
        <svg ref={svgRef} width="100%" height="100%">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>
        </svg>
      </Box>
      <Button variant="contained" onClick={handleRegenerateFork} sx={{ mb: 2 }}>
        Regenerate Fork
      </Button>
      <Typography variant="body1" paragraph>
        This visualization shows how forks can occur when multiple validators propose blocks
        simultaneously. The blue block represents the proposal by the officially selected validator
        (Validator {selectedValidator?.id || 'Error reading validator ID'}, address:{' '}
        {selectedValidator?.withdrawalAddress || 'Error reading address'}), while the orange block
        represents a competing proposal from Validator {competingValidator?.id || 'N/A'}.
      </Typography>
      <Typography variant="body1">
        In a perfect scenario, only one block is proposed for each slot, but due to real-world
        network conditions, competing blocks may occasionally be proposed by other validators.
        Notice that while the block numbers and parent hashes are the same for the forked blocks,
        their block hashes differ.
      </Typography>
    </Box>
  );
}

export default ForksAndDivergingChains;
