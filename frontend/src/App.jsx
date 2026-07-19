import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LiveQueue from './pages/LiveQueue';
import ShiftPlanner from './pages/ShiftPlanner';

// New ERP Portals
import PharmacistDashboard from './pages/PharmacistDashboard';
import LabTechDashboard from './pages/LabTechDashboard';
import NurseDashboard from './pages/NurseDashboard';
import TMODashboard from './pages/TMODashboard';
import BillingDashboard from './pages/BillingDashboard';
import HouseOfficerDashboard from './pages/HouseOfficerDashboard';

import Layout from './components/Layout';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* All Authenticated routes wrapped in Layout */}
        <Route element={<Layout />}>
          {/* Core Portals */}
          <Route path="/reception" element={<ReceptionistDashboard />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/queue" element={<LiveQueue />} />
          
          {/* Admin / Management Portals */}
          <Route path="/admin" element={<ShiftPlanner />} />
          
          {/* New Specialized ERP Portals */}
          <Route path="/pharmacist" element={<PharmacistDashboard />} />
          <Route path="/lab" element={<LabTechDashboard />} />
          <Route path="/nurse" element={<NurseDashboard />} />
          <Route path="/tmo" element={<TMODashboard />} />
          <Route path="/billing" element={<BillingDashboard />} />
          <Route path="/ho" element={<HouseOfficerDashboard />} />
          
          {/* Profile Route */}
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
