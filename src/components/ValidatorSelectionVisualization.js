import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import * as d3 from 'd3';

function ValidatorSelectionVisualization({ validators, randomValue, onSelect }) {
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [pseudoRandomValue, setPseudoRandomValue] = useState(null);
  const [tvl, setTvl] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    const totalStake = validators.reduce((sum, v) => sum + v.stake, 0);
    setTvl(totalStake);
    drawChart();
  }, [validators]);

  const drawChart = () => {
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, tvl])
      .range([0, width]);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(validators.map(d => `Validator ${d.id}`))
      .padding(0.1);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    svg.append("g")
      .call(d3.axisLeft(y));

    let cumulativeSum = 0;
    validators.forEach((validator, i) => {
      const startX = x(cumulativeSum);
      const barWidth = x(validator.stake) - x(0);
      const percentage = tvl > 0 ? (validator.stake / tvl) * 100 : 0; // Add this check
      
      svg.append("rect")
        .attr("x", startX)
        .attr("y", y(`Validator ${validator.id}`))
        .attr("width", barWidth)
        .attr("height", y.bandwidth())
        .attr("fill", d3.schemeCategory10[i % 10])
        .attr("stroke", validator.id === validators.length ? "black" : "none")
        .attr("stroke-width", 2);

      svg.append("text")
        .attr("x", startX + barWidth / 2)
        .attr("y", y(`Validator ${validator.id}`) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(`${validator.stake} ETH`)
        .style("fill", "white")
        .style("font-size", "12px");

      svg.append("text")
        .attr("x", width + 10)
        .attr("y", y(`Validator ${validator.id}`) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(`${percentage.toFixed(2)}%`)
        .style("fill", "black")
        .style("font-size", "12px");

      cumulativeSum += validator.stake;
    });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Validator Stakes and Selection Probabilities");
  };

  const selectValidator = () => {
    // Convert randomValue to a number between 0 and 1
    const r = parseInt(randomValue, 16) / (2 ** 256 - 1);
    setPseudoRandomValue(r);

    let selected = null;
    let cumulativeSum = 0;
    for (let validator of validators) {
      if (r >= cumulativeSum / tvl && r < (cumulativeSum + validator.stake) / tvl) {
        selected = validator;
        break;
      }
      cumulativeSum += validator.stake;
    }

    setSelectedValidator(selected);
    onSelect(selected);

    const svg = d3.select(chartRef.current).select("svg g");
    const x = d3.scaleLinear()
      .domain([0, tvl])
      .range([0, 1000 - 120 - 120]);

    svg.append("line")
      .attr("x1", x(r * tvl))
      .attr("y1", 0)
      .attr("x2", x(r * tvl))
      .attr("y2", 500 - 40 - 40)
      .attr("stroke", "red")
      .attr("stroke-width", 2);

    svg.append("text")
      .attr("x", x(r * tvl))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("r")
      .attr("fill", "red");
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Validator Selection</Typography>
      <Typography variant="body1" gutterBottom>
        Random Value: {randomValue}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total Value Locked (TVL): {tvl} ETH
      </Typography>
      <Button variant="contained" onClick={selectValidator} disabled={!!selectedValidator}>
        Select Validator
      </Button>
      <Box ref={chartRef} sx={{ mt: 2, overflowX: 'auto' }} />
      {selectedValidator && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Selected Validator</Typography>
          <Typography variant="body1">ID: <strong>{selectedValidator.id}</strong></Typography>
          <Typography variant="body1">Stake: <strong>{selectedValidator.stake} ETH</strong></Typography>
          <Typography variant="body1">Pseudorandom value (r): <strong>{(pseudoRandomValue * tvl).toFixed(2)}</strong></Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ValidatorSelectionVisualization;