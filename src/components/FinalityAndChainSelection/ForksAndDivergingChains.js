import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

function ForksAndDivergingChains() {
  const [chainData, setChainData] = useState({ finalized: [], proposed: null, forked: null });
  const svgRef = useRef(null);

  useEffect(() => {
    loadChainData();
  }, []);

  useEffect(() => {
    if (chainData.finalized.length > 0) {
      drawChainVisualization();
    }
  }, [chainData]);

  const loadChainData = () => {
    const singleChain = JSON.parse(localStorage.getItem('singleChain') || '[]');
    const proposedBlockData = JSON.parse(localStorage.getItem('proposedBlockData') || '{}');

    if (singleChain.length === 0 || !proposedBlockData.blockHeader) {
      console.error('No chain data or proposed block found in local storage');
      return;
    }

    const finalizedChain = singleChain.slice(0, -1); // Exclude the last block as it's not finalized yet
    const proposedBlock = proposedBlockData.blockHeader;
    const forkedBlock = {
      ...proposedBlock,
      hash: `0x${Math.random().toString(36).substr(2, 64)}`,
      stateRoot: `0x${Math.random().toString(36).substr(2, 64)}`
    };

    setChainData({
      finalized: finalizedChain,
      proposed: proposedBlock,
      forked: forkedBlock
    });
  };

  const drawChainVisualization = () => {
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const blockWidth = 144; // 20% thinner than 180
    const blockHeight = 80; // 20% thinner than 100
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

    drawBlock(svg, proposedX, proposedY, chainData.proposed, '#2196f3');
    drawBlock(svg, proposedX, forkedY, chainData.forked, '#ff9800');

    // Draw arrows to proposed and forked blocks
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, proposedY + blockHeight / 2);
    drawArrow(svg, lastX + blockWidth, height / 2, proposedX, forkedY + blockHeight / 2);
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
      textElement.setAttribute('y', y + 40); // Center vertically
      textElement.setAttribute('dy', dy);
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('fill', 'white');
      textElement.setAttribute('font-size', '12px');
      textElement.textContent = text;
      g.appendChild(textElement);
    };

    addText(`Block ${block.blockNumber}`, '-1.2em');
    addText(`Hash: ${block.hash.slice(0, 6)}...${block.hash.slice(-4)}`, '0em');
    addText(`Parent: ${block.parentHash.slice(0, 6)}...${block.parentHash.slice(-4)}`, '1.2em');

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
      <Typography variant="h5" gutterBottom>
        Forks & Diverging Chains
      </Typography>
      <Typography variant="body1" paragraph>
        During the block creation process, multiple validators may propose blocks simultaneously, leading to forks in the chain.
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2">
          Green: Finalized chain stored in local storage.
        </Typography>
        <Typography variant="body2">
          Blue: Our proposed block continuing the chain.
        </Typography>
        <Typography variant="body2">
          Orange: A competing fork with a different block hash and state root.
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
      <Button variant="contained" onClick={handleRegenerateFork} sx={{ mb: 2 }}>
        Regenerate Fork
      </Button>
      <Typography variant="body1">
        This visualization shows how forks can occur when multiple validators propose blocks at the same time. 
        Notice that while the block numbers and parent hashes are the same for the forked blocks, their block hashes differ.
        In the next step, we'll explore how consensus is reached to finalize one of these branches.
      </Typography>
    </Box>
  );
}

export default ForksAndDivergingChains;