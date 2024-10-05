import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { useSpring, animated, config } from 'react-spring';

function BlockAttestation({ proposedBlock, onComplete }) {
  const [validators, setValidators] = useState([]);
  const [proposingValidator, setProposingValidator] = useState(null);
  const [attestationProgress, setAttestationProgress] = useState(0);
  const [quorumReached, setQuorumReached] = useState(false);
  const [currentValidatorIndex, setCurrentValidatorIndex] = useState(0);
  const [debugInfo, setDebugInfo] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const svgRef = React.useRef(null);

  useEffect(() => {
    const storedValidators = JSON.parse(localStorage.getItem('validators') || '[]');
    const storedData = JSON.parse(localStorage.getItem('validatorSelectionData') || '[]');
    
    if (storedData.length > 0) {
      const latestValidatorData = storedData[storedData.length - 1];
      setProposingValidator(latestValidatorData.selectedValidator);
    }

    // Use stored validators, but limit to 15 if there are more
    const attestingValidators = storedValidators.slice(0, 15).map(validator => ({
      ...validator,
      approved: null
    }));

    setValidators(attestingValidators);

    // Set debug info
    if (storedData.length > 0) {
      const latestValidatorData = storedData[storedData.length - 1];
      setDebugInfo({
        selectedValidatorId: latestValidatorData.selectedValidator.id,
        selectedValidatorAddress: latestValidatorData.selectedValidator.withdrawalAddress,
        totalValidatorsInStorage: storedValidators.length
      });
    }
  }, []);

  const simulateAttestation = useCallback(() => {
    const totalValidators = validators.length;
    const minYesVotes = Math.ceil(totalValidators / 2);
    const maxYesVotes = totalValidators;
    const targetYesVotes = Math.floor(Math.random() * (maxYesVotes - minYesVotes + 1)) + minYesVotes;

    const processValidator = (index) => {
      if (index >= totalValidators) {
        setQuorumReached(true);
        return;
      }

      setValidators(prevValidators => {
        const updatedValidators = [...prevValidators];
        const currentValidator = updatedValidators[index];
        
        const remainingValidators = totalValidators - index;
        const currentYesVotes = updatedValidators.filter(v => v.approved === true).length;
        const neededYesVotes = targetYesVotes - currentYesVotes;

        if (neededYesVotes > remainingValidators) {
          currentValidator.approved = true;
        } else if (currentYesVotes >= targetYesVotes) {
          currentValidator.approved = Math.random() < 0.5; // 50% chance to approve if target is reached
        } else {
          currentValidator.approved = Math.random() < 0.75; // 75% chance to approve otherwise
        }

        setAttestationProgress(((index + 1) / totalValidators) * 100);
        setStatusMessage(`Validator ${currentValidator.id} has ${currentValidator.approved ? 'approved' : 'rejected'} the block.`);
        setCurrentValidatorIndex(index);

        return updatedValidators;
      });

      setTimeout(() => processValidator(index + 1), 1000);
    };

    processValidator(0);
  }, [validators]);

  useEffect(() => {
    if (validators.length > 0 && currentValidatorIndex === 0) {
      simulateAttestation();
    }
  }, [validators, currentValidatorIndex, simulateAttestation]);

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
      .attr("dy", 90)
      .attr("font-size", "14px")
      .text(`Proposer: ${proposingValidator.withdrawalAddress.slice(0, 6)}...${proposingValidator.withdrawalAddress.slice(-4)}`);

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
        .attr("dy", 45)
        .attr("font-size", "12px")
        .text(`Validator ${validator.id}`);

      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", validator.approved === null ? "gray" : (validator.approved ? "green" : "red"))
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", validator.approved === null ? "5,5" : "none");
    });
  }, [validators, proposingValidator, currentValidatorIndex, quorumReached]);

  // Add this helper function outside of the drawGraph function
  const getValidatorColor = (validator, index) => {
    if (quorumReached) {
      return validator.approved ? "green" : "red";
    }
    return index === currentValidatorIndex ? "yellow" : (validator.approved === null ? "gray" : (validator.approved ? "green" : "red"));
  };

  useEffect(() => {
    drawGraph();
  }, [drawGraph, quorumReached]); // Add quorumReached as a dependency

  const progressBarProps = useSpring({
    width: attestationProgress,
    config: { ...config.molasses, duration: 2000 }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <Typography variant="h5" gutterBottom>Block Attestation</Typography>
      
      {/* Debug Information */}
      <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 4, backgroundColor: '#f0f0f0', width: '100%' }}>
        <Typography variant="h6" gutterBottom>Debug Information</Typography>
        <Typography>Selected Validator ID: {debugInfo.selectedValidatorId}</Typography>
        <Typography>Selected Validator Address: {debugInfo.selectedValidatorAddress}</Typography>
        <Typography>Total Validators in Storage: {debugInfo.totalValidatorsInStorage}</Typography>
      </Paper>
      
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
            The proposing validator's block is successfully attested and ready for aggregation in the next step.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => onComplete(validators)}
          >
            Next: Block Aggregation
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default BlockAttestation;