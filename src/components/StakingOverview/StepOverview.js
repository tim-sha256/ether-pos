// StepOverview.js - Step 1: Overview Component
import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import sidebarContent from '../sidebarContent.json';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Label } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF', '#FF67A1', '#FF6D00', '#A2FF67', '#67F7FF', '#FFD700'];

function StepOverview() {
  const [validators, setValidators] = React.useState([]);

  useEffect(() => {
    const savedValidators = JSON.parse(localStorage.getItem('validators'));
    if (savedValidators) {
      setValidators(savedValidators);
    }
  }, []);

  const pieData = validators.map((validator) => ({
    name: `v${validator.id}`,
    value: validator.stake,
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${pieData[index].name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <Card sx={{ flex: '0 0 30%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Total Value Locked (TVL)</Typography>
            <Typography variant="h4">
              {validators.reduce((sum, validator) => sum + validator.stake, 0)} ETH
            </Typography>
            <Typography variant="subtitle1">
              Staked by {validators.length} validators
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
                  value="Validator Stakes"
                  position="center"
                  fill="white"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.5))',
                  }}
                />
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default StepOverview;
