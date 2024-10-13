import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { useSpring, animated, config } from 'react-spring';
import { sha3_256 } from 'js-sha3';

function BlockAttestation({ proposedBlock, onComplete }) {
  const [validators, setValidators] = useState([]);
  const [proposingValidator, setProposingValidator] = useState(null);
  const [attestationProgress, setAttestationProgress] = useState(0);
  const [quorumReached, setQuorumReached] = useState(false);
  const [currentValidatorIndex, setCurrentValidatorIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');
  const [showAggregation, setShowAggregation] = useState(false);
  const [aggregatedHash, setAggregatedHash] = useState('');
  const [aggregationProgress, setAggregationProgress] = useState(0);

  const svgRef = useRef(null);
  const aggregationRef = useRef(null);

  useEffect(() => {
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    const storedData = JSON.parse(localStorage.getItem('userValidatorData') || '{}');
    
    if (storedData.selectedValidator) {
      setProposingValidator(storedData.selectedValidator);
    }

    // Get all validator IDs except the proposer's
    const validatorIds = storedValidators.map(v => v.id).filter(id => id !== storedData.selectedValidator.id);
    
    // Create attestingValidators array with the correct IDs
    const attestingValidators = validatorIds.map(id => ({
      id: id,
      approved: null
    }));

    setValidators(attestingValidators);
  }, []);

  const simulateAttestation = useCallback(() => {
    const totalValidators = validators.length;
    const minYesVotes = Math.ceil(totalValidators * 2 / 3); // 2/3 majority for quorum

    const processValidator = (index) => {
      if (index >= totalValidators) {
        setQuorumReached(true);
        return;
      }

      setCurrentValidatorIndex(index);

      setTimeout(() => {
        setValidators(prevValidators => {
          const updatedValidators = [...prevValidators];
          const currentValidator = updatedValidators[index];
          
          const currentYesVotes = updatedValidators.filter(v => v.approved === true).length;
          const remainingValidators = totalValidators - index - 1;

          if (currentYesVotes + remainingValidators < minYesVotes) {
            // If it's impossible to reach quorum, approve
            currentValidator.approved = true;
          } else if (currentYesVotes >= minYesVotes) {
            // If quorum is already reached, 50% chance to approve
            currentValidator.approved = Math.random() < 0.5;
          } else {
            // Otherwise, 75% chance to approve
            currentValidator.approved = Math.random() < 0.75;
          }

          setAttestationProgress(((index + 1) / totalValidators) * 100);
          setStatusMessage(`Validator ${currentValidator.id} has ${currentValidator.approved ? 'approved' : 'rejected'} the block.`);

          return updatedValidators;
        });

        processValidator(index + 1);
      }, 1000);
    };

    processValidator(0);
  }, [validators]);

  useEffect(() => {
    if (validators.length > 0 && currentValidatorIndex === -1) {
      simulateAttestation();
    }
  }, [validators, currentValidatorIndex, simulateAttestation]);

  const getValidatorColor = useCallback((validator, index) => {
    if (index > currentValidatorIndex) return "gray";
    return validator.approved ? "green" : "red";
  }, [currentValidatorIndex]);

  const drawGraph = useCallback(() => {
    if (!svgRef.current || validators.length === 0 || !proposingValidator) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 900;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 75;

    svg.attr("width", width).attr("height", height);

    // Draw lines first (behind the nodes)
    validators.forEach((validator, index) => {
      const angle = (index / validators.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", index <= currentValidatorIndex ? (validator.approved ? "green" : "red") : "gray")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", index <= currentValidatorIndex ? "none" : "5,5");
    });

    // Draw proposing validator
    const proposerNode = svg.append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    proposerNode.append("circle")
      .attr("r", 60)
      .attr("fill", "gold")
      .attr("stroke", "orange")
      .attr("stroke-width", 4);

    proposerNode.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", "14px")
      .text(`Proposer: ${proposingValidator.id}`);

    // Draw other validators
    validators.forEach((validator, index) => {
      const angle = (index / validators.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const validatorNode = svg.append("g")
        .attr("transform", `translate(${x},${y})`);

      validatorNode.append("circle")
        .attr("r", 30)
        .attr("fill", getValidatorColor(validator, index));

      validatorNode.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 5)
        .attr("font-size", "12px")
        .text(`Validator ${validator.id}`);
    });
  }, [validators, proposingValidator, currentValidatorIndex, getValidatorColor]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph, currentValidatorIndex]);

  const progressBarProps = useSpring({
    width: attestationProgress,
    config: { ...config.molasses, duration: 500 }
  });

  const handleAggregateVotes = () => {
    setShowAggregation(true);
    simulateAggregation();
  };

  const simulateAggregation = () => {
    const totalSteps = validators.length;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        const aggregatedVotes = validators.map(v => ({
          validator_id: v.id,
          approved: v.approved,
          signature: `0x${sha3_256(v.id.toString() + v.approved.toString()).slice(0, 64)}`
        }));
        const aggregatedHash = sha3_256(JSON.stringify(aggregatedVotes));
        setAggregatedHash(aggregatedHash);

        // Save aggregation data to local storage
        const aggregationData = {
          aggregatedCommitment: aggregatedHash,
          totalAttestations: validators.length,
          approvals: validators.filter(v => v.approved).length,
          rejections: validators.filter(v => !v.approved).length
        };
        localStorage.setItem('blockAggregationData', JSON.stringify(aggregationData));

        return;
      }

      setAggregationProgress((currentStep + 1) / totalSteps * 100);
      currentStep++;
    }, 100);
  };

  const renderAggregationSection = () => (
    <AnimatePresence>
      {showAggregation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Paper elevation={3} sx={{ p: 2, mt: 2, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Block Aggregation</Typography>
            <Box ref={aggregationRef} sx={{ height: 300, width: '100%', mb: 2 }}></Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Aggregation Progress: {Math.round(aggregationProgress)}%
            </Typography>
            {aggregatedHash && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Aggregated Attestation Commitment:
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {aggregatedHash}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold', color: 'green' }}>
                  Aggregated attestations successfully produced a valid commitment.
                </Typography>
              </>
            )}
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );

  useEffect(() => {
    if (showAggregation && aggregationRef.current) {
      const svg = d3.select(aggregationRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

      const simulation = d3.forceSimulation(validators)
        .force('charge', d3.forceManyBody().strength(-10))
        .force('center', d3.forceCenter(aggregationRef.current.clientWidth / 2, aggregationRef.current.clientHeight / 2))
        .force('collision', d3.forceCollide().radius(10));

      const nodes = svg.selectAll('circle')
        .data(validators)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('fill', d => d.approved ? 'green' : 'red');

      simulation.on('tick', () => {
        nodes
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
    }
  }, [showAggregation, validators]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
      <Typography variant="h5" gutterBottom>Block Attestation</Typography>
      
      {proposedBlock && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 4, width: '100%' }}>
          <Typography variant="h6" gutterBottom>Proposed Block Details</Typography>
          <List>
            <ListItem>
              <ListItemText primary="Block Number" secondary={proposedBlock.blockNumber} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Block Hash" secondary={proposedBlock.hash} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Parent Hash" secondary={proposedBlock.parentHash} />
            </ListItem>
            <ListItem>
              <ListItemText primary="State Root" secondary={proposedBlock.stateRoot} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transactions Root" secondary={proposedBlock.transactionsRoot} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Receipts Root" secondary={proposedBlock.receiptsRoot} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Timestamp" secondary={new Date(proposedBlock.timestamp).toLocaleString()} />
            </ListItem>
          </List>
        </Paper>
      )}
      
      <Paper elevation={3} sx={{ p: 2, mt: 2, position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg ref={svgRef}></svg>
      </Paper>

      <Box sx={{ mt: 2, width: '100%' }}>
        <Typography variant="body2" color="text.secondary">Attestation Progress</Typography>
        <Box sx={{ width: '100%', height: 10, bgcolor: 'grey.300', borderRadius: 5, overflow: 'hidden' }}>
          <animated.div style={{
            height: '100%',
            backgroundColor: '#4caf50',
            borderRadius: 5,
            width: progressBarProps.width.to(w => `${w}%`)
          }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {`${Math.round(attestationProgress)}%`}
        </Typography>
      </Box>

      {quorumReached && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>Quorum Reached</Typography>
        </motion.div>
      )}
      
      <Paper elevation={3} sx={{ p: 2, mt: 2, width: '100%' }}>
        <Typography variant="h6" gutterBottom>Attestation Process</Typography>
        <Typography variant="body1">
          Validators read the block header, which contains essential information like the previous block hash, 
          state root, and Merkle root. Each validator verifies the validity of the block using its own state, 
          comparing the block header details with the expected values. This decentralized verification process 
          ensures the integrity of the blockchain.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
          {statusMessage}
        </Typography>
      </Paper>
      {quorumReached && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, width: '100%' }}>
          <Typography variant="h6" gutterBottom>Attestation Summary</Typography>
          <Typography variant="body1">
            Total Validators: {validators.length}<br />
            Approved: {validators.filter(v => v.approved).length} ({((validators.filter(v => v.approved).length / validators.length) * 100).toFixed(1)}%)<br />
            Rejected: {validators.filter(v => v.approved === false).length} ({((validators.filter(v => v.approved === false).length / validators.length) * 100).toFixed(1)}%)<br />
            The proposing validator's block is successfully attested and ready for aggregation.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={handleAggregateVotes}
            disabled={showAggregation}
          >
            Aggregate Votes
          </Button>
        </Paper>
      )}

      {renderAggregationSection()}

      {showAggregation && aggregatedHash && (
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2, width: '100%' }}
          onClick={() => {
            onComplete(validators);
          }}
        >
          Next: Incorporation into Chain
        </Button>
      )}
    </Box>
  );
}

export default BlockAttestation;