import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StakingOverview from './components/StakingOverview';
import ValidatorSelection from './components/ValidatorSelection';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Staking Overview</Link></li>
            <li><Link to="/validator-selection">Validator Selection</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<StakingOverview />} />
          <Route path="/validator-selection" element={<ValidatorSelection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
