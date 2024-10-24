import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Label } from 'recharts';

function StepOverview({ validators, allValidators, pieData, COLORS, renderCustomizedLabel }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <Card sx={{ flex: '0 0 30%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Total Value Locked (TVL)</Typography>
            <Typography variant="h4">
              {allValidators.reduce((sum, validator) => sum + validator.stake, 0)} ETH
            </Typography>
            <Typography variant="subtitle1">
              Staked by {allValidators.length} validators
            </Typography>
          </CardContent>
        </Card>
        <Box sx={{ width: '100%', height: { xs: 300, sm: 400, md: 500 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomizedLabel}
                outerRadius={200}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label 
                  content={({ viewBox }) => {
                    const { cx, cy } = viewBox;
                    return (
                      <g>
                        <rect x={cx - 70} y={cy - 15} width={140} height={30} fill="rgba(0,0,0,0.3)" rx={15} />
                        <text x={cx} y={cy} dy={5} textAnchor="middle" fill="white" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          Validator Stakes
                        </text>
                      </g>
                    );
                  }}
                />
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 4, maxWidth: '100%', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Validator ID</TableCell>
              <TableCell>Stake (ETH)</TableCell>
              <TableCell>Validation Code</TableCell>
              <TableCell>Randao Commitment</TableCell>
              <TableCell>Withdrawal Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allValidators.map((validator) => (
              <TableRow key={validator.id}>
                <TableCell>{validator.id}</TableCell>
                <TableCell>{validator.stake}</TableCell>
                <TableCell>{validator.validationCode.substring(0, 10)}...</TableCell>
                <TableCell>{validator.randaoCommitment.substring(0, 10)}...</TableCell>
                <TableCell>{validator.withdrawalAddress.substring(0, 10)}...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StepOverview;
