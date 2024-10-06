import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Button, LinearProgress, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

function ChainSelectionAndFinality() {
  const [chainData, setChainData] = useState({ finalized: [], proposed: null, forked: null });
  const [validators, setValidators] = useState([]);
  const [votes, setVotes] = useState([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [votingProgress, setVotingProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [voteStats, setVoteStats] = useState({ proposed: 0, forked: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    loadChainData();
  }, []);

  useEffect(() => {
    if (chainData.finalized.length > 0 && validators.length > 0) {
      drawChainVisualization();
    }
  }, [chainData, validators, votes, isFinalized, votingProgress]);

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
    setVotes([]);
    setVotingProgress(0);
    setIsFinalized(false);
    setVoteStats({ proposed: 0, forked: 0 });

    const totalValidators = validators.length;
    const requiredVotes = Math.ceil(totalValidators * 2 / 3);

    // Create an array of random votes
    const randomVotes = validators.map(() => Math.random() < 0.5);

    // Count initial votes for the proposed chain
    let proposedVotes = randomVotes.filter(v => v).length;

    // If we don't have enough votes for the proposed chain, flip some votes
    if (proposedVotes < requiredVotes) {
      const votesToFlip = requiredVotes - proposedVotes;
      const noVoteIndices = randomVotes.reduce((acc, vote, index) => {
        if (!vote) acc.push(index);
        return acc;
      }, []);

      // Shuffle the noVoteIndices array
      for (let i = noVoteIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [noVoteIndices[i], noVoteIndices[j]] = [noVoteIndices[j], noVoteIndices[i]];
      }

      // Flip votes in random order
      for (let i = 0; i < votesToFlip; i++) {
        if (i < noVoteIndices.length) {
          randomVotes[noVoteIndices[i]] = true;
          proposedVotes++;
        }
      }
    }

    // Simulate voting process
    validators.forEach((validator, index) => {
      setTimeout(() => {
        const voteForProposed = randomVotes[index];

        setVotes(prevVotes => [...prevVotes, { validator, voteForProposed }]);
        setVotingProgress((index + 1) / totalValidators * 100);

        setVoteStats(prevStats => ({
          proposed: voteForProposed ? prevStats.proposed + 1 : prevStats.proposed,
          forked: voteForProposed ? prevStats.forked : prevStats.forked + 1
        }));

        if (index === totalValidators - 1) {
          setIsFinalized(true);
          updateFinalizedChain();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }, index * 1000);
    });
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
    const blockWidth = Math.min(144, width * 0.15);
    const blockHeight = blockWidth * 0.55;
    const horizontalGap = blockWidth * 0.7;
    const verticalGap = blockHeight * 1.5;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Calculate the maximum number of blocks that can fit horizontally
    const maxBlocks = Math.floor((width - blockWidth) / (blockWidth + horizontalGap));
    const finalizedChain = chainData.finalized.slice(-maxBlocks);

    // Draw finalized chain
    finalizedChain.forEach((block, index) => {
      const x = index * (blockWidth + horizontalGap);
      const y = height / 3 - blockHeight / 2;
      drawBlock(svg, x, y, block, '#4caf50', blockWidth, blockHeight);
      if (index > 0) {
        drawCurvedArrow(svg, x - horizontalGap, y + blockHeight / 2, x, y + blockHeight / 2);
      }
    });

    // Draw proposed and forked blocks
    const lastX = (finalizedChain.length - 1) * (blockWidth + horizontalGap);
    const proposedX = lastX + blockWidth + horizontalGap;
    const proposedY = height / 3 - blockHeight / 2;
    const forkedY = height / 3 + verticalGap;

    drawBlock(svg, proposedX, proposedY, chainData.proposed, isFinalized ? '#4caf50' : '#2196f3', blockWidth, blockHeight);
    drawBlock(svg, proposedX, forkedY, chainData.forked, isFinalized ? '#d32f2f' : '#ff9800', blockWidth, blockHeight);

    // Draw arrows to proposed and forked blocks
    drawCurvedArrow(svg, lastX + blockWidth, height / 3, proposedX, proposedY + blockHeight / 2);
    drawCurvedArrow(svg, lastX + blockWidth, height / 3, proposedX, forkedY + blockHeight / 2);

    // Draw votes
    const proposedVotes = votes.filter(v => v.voteForProposed);
    const forkedVotes = votes.filter(v => !v.voteForProposed);

    const voteRadius = Math.min(10, blockWidth * 0.07);
    const voteSpacing = voteRadius * 2.5;
    const votesPerRow = Math.floor(width / voteSpacing);

    proposedVotes.forEach((vote, index) => {
      const x = (index % votesPerRow) * voteSpacing + voteSpacing / 2;
      const y = height * 2/3 + Math.floor(index / votesPerRow) * voteSpacing + voteSpacing / 2;
      drawVote(svg, x, y, '#2196f3', vote.validator.id, vote.validator.withdrawalAddress, voteRadius);
    });

    forkedVotes.forEach((vote, index) => {
      const x = (index % votesPerRow) * voteSpacing + voteSpacing / 2;
      const y = height * 5/6 + Math.floor(index / votesPerRow) * voteSpacing + voteSpacing / 2;
      drawVote(svg, x, y, '#ff9800', vote.validator.id, vote.validator.withdrawalAddress, voteRadius);
    });

    // Add "Discarded" label to forked block if finalized
    if (isFinalized) {
      const discardedLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      discardedLabel.setAttribute('x', proposedX + blockWidth / 2);
      discardedLabel.setAttribute('y', forkedY - 20);
      discardedLabel.setAttribute('text-anchor', 'middle');
      discardedLabel.setAttribute('fill', '#d32f2f');
      discardedLabel.setAttribute('font-size', '16px');
      discardedLabel.textContent = 'Discarded';
      svg.appendChild(discardedLabel);
    }
  };

  const drawBlock = (svg, x, y, block, color, width, height) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', color);
    rect.setAttribute('rx', 5);
    g.appendChild(rect);

    const addText = (text, dy) => {
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', x + width / 2);
      textElement.setAttribute('y', y + height / 2);
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

  const drawCurvedArrow = (svg, x1, y1, x2, y2) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 30;
    path.setAttribute('d', `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'black');
    path.setAttribute('stroke-width', 2);
    path.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(path);
  };

  const drawVote = (svg, x, y, color, validatorId, withdrawalAddress, radius) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', color);
    g.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('dy', '0.3em');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '10px');
    text.textContent = validatorId;
    g.appendChild(text);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `Validator ${validatorId}\nAddress: ${withdrawalAddress}`;
    g.appendChild(title);

    svg.appendChild(g);
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
          Blue: Proposed block and its votes
        </Typography>
        <Typography variant="body2">
          Orange: Competing fork and its votes
        </Typography>
      </Paper>
      <Box sx={{ width: '100%', height: 600, mb: 2 }}> {/* Increased height to accommodate votes below */}
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
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress variant="determinate" value={votingProgress} />
      </Box>
      <Typography variant="body1" paragraph>
        {isFinalized 
          ? 'Consensus reached! The proposed chain has been finalized.' 
          : 'Click the button to simulate the voting process and reach consensus.'}
      </Typography>
      <Typography variant="body1" paragraph>
        Voting Statistics:
        <br />
        Proposed Chain: {voteStats.proposed} votes ({((voteStats.proposed / validators.length) * 100).toFixed(2)}%)
        <br />
        Competing Fork: {voteStats.forked} votes ({((voteStats.forked / validators.length) * 100).toFixed(2)}%)
      </Typography>
      <Typography variant="body1">
        Once quorum is reached (at least 2/3 of validators vote for a chain), that chain becomes finalized and added to the main chain.
        The competing fork is discarded.
      </Typography>
      {showConfetti && <Confetti />}
    </Box>
  );
}

export default ChainSelectionAndFinality;