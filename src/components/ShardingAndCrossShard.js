import React, { useState } from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, Button } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import sidebarContent from '../sidebarContent.json';
import { useNavigate } from 'react-router-dom';

const steps = ['Shard Model Overview', 'Validator Assignment to Shards', 'Cross-Shard Communication'];

function ShardingAndCrossShard() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      navigate('/conclusion');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderShardModelDiagram = () => (
    <svg width="100%" height="300" viewBox="0 0 800 300">
      <rect x="50" y="50" width="700" height="200" fill="#E0E0E0" stroke="#333" strokeWidth="2" />
      <text x="400" y="30" textAnchor="middle" fill="#333" fontSize="20">Ethereum Network</text>
      
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={100 + i * 150} y="75" width="100" height="150" fill="#81C784" stroke="#333" strokeWidth="2" />
          <text x={150 + i * 150} y="150" textAnchor="middle" fill="#333">Shard {i + 1}</text>
        </g>
      ))}
    </svg>
  );

  const renderValidatorAssignmentDiagram = () => (
    <svg width="100%" height="300" viewBox="0 0 800 300">
      <rect x="50" y="50" width="200" height="200" fill="#E0E0E0" stroke="#333" strokeWidth="2" />
      <text x="150" y="30" textAnchor="middle" fill="#333" fontSize="16">Validator Pool</text>
      
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={100 + (i % 3) * 50} cy={100 + Math.floor(i / 3) * 50} r="20" fill="#FFA726" stroke="#333" strokeWidth="2" />
      ))}
      
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={400 + i * 120} y="50" width="100" height="200" fill="#81C784" stroke="#333" strokeWidth="2" />
          <text x={450 + i * 120} y="30" textAnchor="middle" fill="#333" fontSize="16">Shard {i + 1}</text>
          
          <path d={`M250 150 Q ${325 + i * 60} 150, ${400 + i * 120} 150`} fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
          <path d={`M250 150 Q ${325 + i * 60} 200, ${400 + i * 120} 200`} fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
        </g>
      ))}
    </svg>
  );

  const renderCrossShardCommunicationDiagram = () => (
    <svg width="100%" height="550" viewBox="0 0 800 550">
      {/* Background */}
      <rect x="0" y="0" width="800" height="550" fill="#E0E0E0" />

      {/* Shards */}
      {['A', 'B', 'C'].map((shard, index) => (
        <g key={shard}>
          <rect x={50 + index * 250} y="50" width="200" height="100" fill="#81C784" stroke="#333" strokeWidth="2" />
          <text x={150 + index * 250} y="100" textAnchor="middle" fill="#333" fontSize="16">Shard {shard}</text>
          
          {/* Logs */}
          <rect x={100 + index * 250} y="200" width="100" height="50" fill="#FFB74D" stroke="#333" strokeWidth="2" />
          <text x={150 + index * 250} y="230" textAnchor="middle" fill="#333" fontSize="14">Log {shard}</text>
          
          {/* Arrows from Logs to Shard 0 */}
          <path d={`M${150 + index * 250} 250 Q ${400} 300, 400 350`} fill="none" stroke="#2196F3" strokeWidth="2" markerEnd="url(#blueArrow)" />
          
          {/* Arrows from Shard 0 to Logs */}
          <path d={`M400 400 Q ${400} 350, ${150 + index * 250} 250`} fill="none" stroke="#4CAF50" strokeWidth="2" markerEnd="url(#greenArrow)" />
        </g>
      ))}

      {/* Shard 0 */}
      <rect x="350" y="350" width="100" height="50" fill="#F06292" stroke="#333" strokeWidth="2" />
      <text x="400" y="380" textAnchor="middle" fill="white" fontSize="14">Shard 0</text>

      {/* Legend */}
      <g transform="translate(50, 480)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#2196F3" strokeWidth="2" markerEnd="url(#blueArrow)" />
        <text x="50" y="5" fontSize="14">Log Submission</text>
        
        <line x1="250" y1="0" x2="280" y2="0" stroke="#4CAF50" strokeWidth="2" markerEnd="url(#greenArrow)" />
        <text x="300" y="5" fontSize="14">Validation Confirmation</text>
      </g>

      {/* Arrow Definitions */}
      <defs>
        <marker id="blueArrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#2196F3" />
        </marker>
        <marker id="greenArrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#4CAF50" />
        </marker>
      </defs>
    </svg>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h5" gutterBottom>Shard Model Overview</Typography>
            <Typography variant="body1" paragraph>
              Sharding is a scaling solution that divides the Ethereum network into smaller, parallel-operating parts called shards. This division allows the network to process multiple transactions simultaneously, significantly increasing its overall capacity and efficiency.
            </Typography>
            {renderShardModelDiagram()}
            <Typography variant="body2" sx={{ mt: 2 }}>
              The diagram above illustrates how the Ethereum network is divided into multiple shards, each capable of processing transactions independently.
            </Typography>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="h5" gutterBottom>Validator Assignment to Shards</Typography>
            <Typography variant="body1" paragraph>
              Validators are randomly assigned to different shards to ensure the security and integrity of the network. This random assignment prevents predictable attacks on specific shards and maintains the decentralized nature of the network.
            </Typography>
            {renderValidatorAssignmentDiagram()}
            <Typography variant="body2" sx={{ mt: 2 }}>
              The illustration shows how validators from a common pool are randomly assigned to different shards, enhancing the security of each shard.
            </Typography>
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="h5" gutterBottom>Cross-Shard Communication</Typography>
            <Typography variant="body1" paragraph>
              Cross-shard communication allows different shards to interact and share information, maintaining the cohesiveness of the Ethereum network. This is achieved through a log-based system using ETHLOG and GETLOG opcodes.
            </Typography>
            <Typography variant="body1" paragraph>
              Shard 0 plays a special role in managing cross-shard finality, ensuring that transactions involving multiple shards are properly validated and finalized.
            </Typography>
            {renderCrossShardCommunicationDiagram()}
            <Typography variant="body2" sx={{ mt: 2 }}>
              The diagram depicts how shards communicate using logs and how Shard 0 manages cross-shard finality.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cross-shard finality is achieved through a betting mechanism, where validators place bets on the finality of cross-shard transactions. This can be represented mathematically as:
            </Typography>
            <BlockMath>
              {`
                \\text{Finality Probability} = \\frac{\\text{Total Stake of Agreeing Validators}}{\\text{Total Stake of All Validators}}
              `}
            </BlockMath>
          </>
        );
      default:
        return 'Unknown step';
    }
  };

  const renderSidebarContent = (content) => {
    if (!content) return null;
    return content.map((item, index) => {
      if (typeof item === 'string') {
        return <Typography key={index} variant="body1" sx={{ mb: 2 }}>{item}</Typography>;
      } else if (item.type === 'list' || item.type === 'orderedList') {
        const ListComponent = item.type === 'list' ? 'ul' : 'ol';
        return (
          <ListComponent key={index}>
            {item.items.map((listItem, listIndex) => (
              <li key={listIndex}>
                <Typography variant="body1">{listItem}</Typography>
              </li>
            ))}
          </ListComponent>
        );
      }
      return null;
    });
  };

  const currentStepContent = sidebarContent.shardingAndCrossShard?.[`step${activeStep}`];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      width: '90%', 
      maxWidth: '1600px',
      margin: '0 auto', 
      mt: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ 
        width: { xs: '100%', md: '25%' }, 
        mb: { xs: 4, md: 0 }, 
        mr: { md: 4 } 
      }}>
        <Typography variant="h6" gutterBottom>
          {currentStepContent?.title || `Step ${activeStep + 1}`}
        </Typography>
        {renderSidebarContent(currentStepContent?.content)}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '75%' } }}>
        <Typography variant="h4" gutterBottom>
          Sharding and Cross-Shard Communication
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Go to next section' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ShardingAndCrossShard;
