import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import * as d3 from 'd3';

function ForksAndDivergingChains({ chainData, validatorData }) {
  const svgRef = useRef(null);
  const [forks, setForks] = useState([]);

  useEffect(() => {
    if (chainData && validatorData) {
      generateForks();
    }
  }, [chainData, validatorData]);

  useEffect(() => {
    if (forks.length > 0) {
      drawForkVisualization();
    }
  }, [forks]);

  const generateForks = () => {
    const lastBlock = chainData[chainData.length - 1];
    const newForks = [
      {
        id: 'main',
        blocks: chainData,
        validator: validatorData
      },
      {
        id: 'fork1',
        blocks: [
          ...chainData.slice(0, -1),
          {
            ...lastBlock,
            hash: `0x${Math.random().toString(36).substr(2, 64)}`,
            stateRoot: `0x${Math.random().toString(36).substr(2, 64)}`
          }
        ],
        validator: { ...validatorData, id: validatorData.id + 1 }
      },
      {
        id: 'fork2',
        blocks: [
          ...chainData.slice(0, -1),
          {
            ...lastBlock,
            hash: `0x${Math.random().toString(36).substr(2, 64)}`,
            stateRoot: `0x${Math.random().toString(36).substr(2, 64)}`
          }
        ],
        validator: { ...validatorData, id: validatorData.id + 2 }
      }
    ];
    setForks(newForks);
  };

  const drawForkVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const blockWidth = 100;
    const blockHeight = 50;
    const blockSpacing = 120;
    const forkSpacing = 80;

    svg.attr("width", width).attr("height", height);

    forks.forEach((fork, forkIndex) => {
      const forkGroup = svg.append("g")
        .attr("transform", `translate(0, ${forkIndex * forkSpacing})`);

      fork.blocks.forEach((block, blockIndex) => {
        const blockGroup = forkGroup.append("g")
          .attr("transform", `translate(${blockIndex * blockSpacing}, 0)`);

        blockGroup.append("rect")
          .attr("width", blockWidth)
          .attr("height", blockHeight)
          .attr("fill", fork.id === 'main' ? "#4caf50" : "#2196f3")
          .attr("stroke", "#000")
          .attr("rx", 5);

        blockGroup.append("text")
          .attr("x", blockWidth / 2)
          .attr("y", blockHeight / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "white")
          .text(`Block ${block.blockNumber}`);

        if (blockIndex > 0) {
          forkGroup.append("line")
            .attr("x1", (blockIndex - 1) * blockSpacing + blockWidth)
            .attr("y1", blockHeight / 2)
            .attr("x2", blockIndex * blockSpacing)
            .attr("y2", blockHeight / 2)
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
        }
      });

      forkGroup.append("text")
        .attr("x", fork.blocks.length * blockSpacing + 10)
        .attr("y", blockHeight / 2)
        .attr("dominant-baseline", "middle")
        .text(`Validator ${fork.validator.id}`);
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Forks & Diverging Chains
      </Typography>
      <Typography variant="body1" paragraph>
        During the block creation process, multiple validators may propose blocks simultaneously, leading to forks in the chain.
      </Typography>
      <Box ref={svgRef} sx={{ width: '100%', height: 400, mb: 2 }} />
      <Button variant="contained" onClick={generateForks}>Generate New Forks</Button>
    </Box>
  );
}

export default ForksAndDivergingChains;