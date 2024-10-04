import React, { useState, useCallback } from 'react';
import { Box, Card, CardContent, Button, Typography, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import { sha3_256 } from 'js-sha3';

function RandaoUnrolling({ secretPhrase, hashSteps, onComplete }) {
  const [randaoSteps, setRandaoSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const generateRandao = useCallback(() => {
    setIsAnimating(true);
    setCurrentStep(0);
    setRandaoSteps([]);

    const animateStep = (step, previousHash) => {
      if (step < hashSteps - 1) {  // Changed this condition
        setTimeout(() => {
          setCurrentStep(step);
          const currentHash = step === 0 ? secretPhrase : previousHash;
          const newHash = `0x${sha3_256(currentHash)}`;
          setRandaoSteps(prev => [...prev, { step: step + 1, hash: newHash }]);
          animateStep(step + 1, newHash);
        }, 1000);
      } else {
        setIsAnimating(false);
        onComplete(previousHash);  // Use the last hash as the final result
      }
    };

    animateStep(0, secretPhrase);
  }, [secretPhrase, hashSteps, onComplete]);

  return (
    <Card sx={{ width: '100%', mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>RANDao Unrolling</Typography>
        <Typography variant="body1" gutterBottom>
          Secret Phrase: {secretPhrase}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Number of Hashing Steps: {hashSteps - 1}
        </Typography>
        <Button variant="contained" onClick={generateRandao} disabled={isAnimating} sx={{ mt: 2 }}>
          Unroll RANDao
        </Button>
        {isAnimating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={(currentStep / (hashSteps - 1)) * 100} />
          </Box>
        )}
        <AnimatePresence>
          {randaoSteps.map((step) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                <Typography variant="body2" sx={{ mr: 2, minWidth: 60 }}>
                  Hash {step.step}:
                </Typography>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: 0 }}
                >
                  <LockIcon color="primary" />
                </motion.div>
                <Typography variant="body2" sx={{ ml: 2, wordBreak: 'break-all' }}>
                  {step.hash}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
        {randaoSteps.length > 0 && (
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Final RANDao Commitment: {randaoSteps[randaoSteps.length - 1].hash}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default RandaoUnrolling;