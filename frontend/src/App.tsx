// frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Path ini tetap sama
import LandingPage from './pages/LandingPage'; // Path diubah
import LoginPage from './pages/LoginPage'; // Path diubah
import MonitoringPage from './pages/MonitoringPage'; // Path diubah
import PredictionPage from './pages/PredictionPage'; // Path diubah
import DashboardPage from './pages/DashboardPage'; // Path diubah
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <hr />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;