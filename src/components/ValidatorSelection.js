import React, { useState } from 'react';
import { Box, Card, CardContent, Button, Typography, CircularProgress } from '@mui/material';
import { useSpring, animated } from 'react-spring';

function ValidatorSelection() {
  const [randomness, setRandomness] = useState(Math.random());
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [loading, setLoading] = useState(false);

  const props = useSpring({ opacity: selectedValidator !== null ? 1 : 0, from: { opacity: 0 } });

  const generateRandomness = () => {
    setRandomness(Math.random());
  };

  const selectValidator = () => {
    setLoading(true);
    setTimeout(() => {
      const validatorIndex = Math.floor(randomness * 10);
      setSelectedValidator(validatorIndex);
      setLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Validator Selection
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" onClick={generateRandomness}>
              Generate Randomness
            </Button>
            <Button variant="contained" onClick={selectValidator} disabled={loading}>
              Select Validator
            </Button>
          </Box>
          {loading ? (
            <CircularProgress />
          ) : (
            selectedValidator !== null && (
              <animated.div style={props}>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Selected Validator: <strong>Validator {selectedValidator + 1}</strong>
                </Typography>
              </animated.div>
            )
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ValidatorSelection;
