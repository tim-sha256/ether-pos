import React from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import sidebarContent from '../sidebarContent.json';

function LightClientSyncing() {
  const renderMerkleTreeDiagram = () => (
    <svg width="100%" height="300" viewBox="0 0 800 300">
      {/* Valid Merkle Tree */}
      <g transform="translate(0,0)">
        <text x="200" y="20" textAnchor="middle" fill="#333">Valid Merkle Tree</text>
        <path d="M200 40 L100 80 L200 120 L300 80 Z" fill="#4CAF50" stroke="#333" />
        <text x="200" y="90" textAnchor="middle" fill="white">Root Hash</text>
        <path d="M100 100 L50 140 L100 180 L150 140 Z" fill="#81C784" stroke="#333" />
        <path d="M300 100 L250 140 L300 180 L350 140 Z" fill="#81C784" stroke="#333" />
        <circle cx="50" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <circle cx="150" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <circle cx="250" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <circle cx="350" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <text x="50" y="205" textAnchor="middle" fill="#333">Tx1</text>
        <text x="150" y="205" textAnchor="middle" fill="#333">Tx2</text>
        <text x="250" y="205" textAnchor="middle" fill="#333">Tx3</text>
        <text x="350" y="205" textAnchor="middle" fill="#333">Tx4</text>
      </g>

      {/* Altered Merkle Tree */}
      <g transform="translate(400,0)">
        <text x="200" y="20" textAnchor="middle" fill="#333">Altered Merkle Tree</text>
        <path d="M200 40 L100 80 L200 120 L300 80 Z" fill="#F44336" stroke="#333" />
        <text x="200" y="90" textAnchor="middle" fill="white">Changed Root</text>
        <path d="M100 100 L50 140 L100 180 L150 140 Z" fill="#EF9A9A" stroke="#333" />
        <path d="M300 100 L250 140 L300 180 L350 140 Z" fill="#81C784" stroke="#333" />
        <circle cx="50" cy="200" r="20" fill="#FFCDD2" stroke="#333" />
        <circle cx="150" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <circle cx="250" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <circle cx="350" cy="200" r="20" fill="#C8E6C9" stroke="#333" />
        <text x="50" y="205" textAnchor="middle" fill="#333">Tx1'</text>
        <text x="150" y="205" textAnchor="middle" fill="#333">Tx2</text>
        <text x="250" y="205" textAnchor="middle" fill="#333">Tx3</text>
        <text x="350" y="205" textAnchor="middle" fill="#333">Tx4</text>
      </g>
    </svg>
  );

  const renderLightClientVerification = () => (
    <svg width="100%" height="200" viewBox="0 0 800 200">
      <rect x="50" y="50" width="150" height="100" rx="20" fill="#2196F3" />
      <text x="125" y="100" textAnchor="middle" fill="white">Light Client</text>
      
      <rect x="300" y="50" width="150" height="100" rx="20" fill="#4CAF50" />
      <text x="375" y="100" textAnchor="middle" fill="white">Block Header</text>
      
      <rect x="550" y="50" width="150" height="100" rx="20" fill="#FFC107" />
      <text x="625" y="100" textAnchor="middle" fill="white">Merkle Proof</text>
      
      <path d="M200 100 L300 100" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M450 100 L550 100" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
      
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
    </svg>
  );

  const renderFinalizedBlocksFlow = () => (
    <svg width="100%" height="200" viewBox="0 0 800 200">
      <rect x="50" y="50" width="150" height="100" rx="20" fill="#4CAF50" />
      <text x="125" y="100" textAnchor="middle" fill="white">Full Node</text>
      
      <rect x="600" y="50" width="150" height="100" rx="20" fill="#2196F3" />
      <text x="675" y="100" textAnchor="middle" fill="white">Light Client</text>
      
      <path d="M200 75 L600 75" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <text x="400" y="65" textAnchor="middle" fill="#333">Finalized Block Header</text>
      
      <path d="M200 125 L600 125" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <text x="400" y="145" textAnchor="middle" fill="#333">Merkle Proof</text>
      
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
    </svg>
  );

  const renderComparisonChart = () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Feature</TableCell>
          <TableCell>Light Client</TableCell>
          <TableCell>Full Node</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Storage Requirements</TableCell>
          <TableCell>Minimal</TableCell>
          <TableCell>Full blockchain history</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Verification Process</TableCell>
          <TableCell>Relies on cryptographic proofs</TableCell>
          <TableCell>Validates all transactions</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Resource Usage</TableCell>
          <TableCell>Low</TableCell>
          <TableCell>High</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Suitable for</TableCell>
          <TableCell>Mobile devices, IoT, lightweight apps</TableCell>
          <TableCell>Servers, desktop computers</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

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

  const currentStepContent = sidebarContent.lightClientSyncing;

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
          {currentStepContent?.title || "Light Client Syncing"}
        </Typography>
        {renderSidebarContent(currentStepContent?.content)}
      </Box>
      <Box sx={{ width: { xs: '100%', md: '75%' } }}>
        <Typography variant="h4" gutterBottom>
          Light-Client Syncing Overview
        </Typography>
        <Typography variant="body1" paragraph>
          In Ethereum's Proof of Stake system, light clients play an essential role in maintaining network efficiency. This section explains how light clients operate and why they are critical for the network, particularly when syncing to the blockchain using finalized blocks. We'll also explore Merkle trees and their importance for verifying data integrity in light clients.
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>How Light Clients Work</Typography>
          <Typography variant="body1" paragraph>
            Light clients are a type of node that do not store the full blockchain history, unlike full nodes. Instead, they rely on finalized blocks and proofs from the network to stay synced, requiring less computation and data. This efficiency is particularly useful for mobile devices and lightweight applications.
          </Typography>
          <Typography variant="body1" paragraph>
            For example, a mobile wallet app like MetaMask can function as a light client. It allows users to interact with the Ethereum network, check balances, and send transactions without needing to download and process the entire blockchain. This makes it possible for users to access Ethereum services quickly and efficiently on their smartphones.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Syncing via Finalized Blocks</Typography>
          <Typography variant="body1" paragraph>
            Unlike full nodes, light clients do not validate each transaction but instead trust finalized blocks through cryptographic proofs. They request minimal data to verify that the latest block is correct, making them much more efficient in terms of resource usage.
          </Typography>
          {renderFinalizedBlocksFlow()}
          <Typography variant="body2" sx={{ mt: 2 }}>
            The diagram above illustrates how a light client receives finalized block headers and Merkle proofs from a full node to stay synchronized with the network.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Merkle Trees and Their Relevance</Typography>
          <Typography variant="body1" paragraph>
            Merkle trees are used to validate data efficiently in light clients:
          </Typography>
          <ul>
            <li>Each transaction or data point in the block is hashed.</li>
            <li>These hashes are repeatedly hashed together to form a single "Merkle Root".</li>
            <li>The Merkle Root is a unique representation of all transactions/data in the block.</li>
            <li>Any change in even one piece of data results in a completely different Merkle Root.</li>
          </ul>
          {renderMerkleTreeDiagram()}
          <Typography variant="body2" sx={{ mt: 2 }}>
            The diagram above shows how changing a single transaction (Tx1 to Tx1') affects the entire Merkle tree, resulting in a different root hash.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Light-Client Verification Process</Typography>
          <Typography variant="body1" paragraph>
            Light clients utilize Merkle proofs to verify individual transactions without needing the full history:
          </Typography>
          {renderLightClientVerification()}
          <Typography variant="body2" sx={{ mt: 2 }}>
            The diagram illustrates a light client receiving a block header and verifying a specific transaction using a Merkle proof.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Light Clients vs Full Nodes</Typography>
          <Typography variant="body1" paragraph>
            Here's a comparison of light clients and full nodes to highlight their differences:
          </Typography>
          {renderComparisonChart()}
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Why Light Clients Matter</Typography>
          <Typography variant="body1" paragraph>
            Light clients are crucial in making Ethereum accessible for a broader range of devices and applications. They provide security without the resource needs of a full node, enabling more users to interact with the Ethereum network efficiently. This is particularly important for mobile devices, IoT applications, and other resource-constrained environments where running a full node would be impractical.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default LightClientSyncing;
