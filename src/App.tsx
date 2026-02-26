import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import { auth } from './firebase/config';
import { useAppStore } from './store/useAppStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// App Pages
import Dashboard from './pages/Dashboard/Dashboard';
import AiConsultant from './pages/AIConsultant/AiConsultant';
import HealthTracker from './pages/HealthTracker/HealthTracker';
import HealthProfile from './pages/Profile/HealthProfile';
import Doctors from './pages/Doctors/Doctors';
import Emergency from './pages/Emergency/Emergency';
import AIInsights from './pages/Insights/AIInsights';
import Settings from './pages/Settings/Settings';
import Admin from './pages/Admin/Admin';
import Pharmacy from './pages/Pharmacy/Pharmacy';
import Checkout from './pages/Pharmacy/Checkout';
import Orders from './pages/Pharmacy/Orders';
import DosageCalculator from './pages/Tools/DosageCalculator';
import LabTests from './pages/LabTests/LabTests';
import PrescriptionUpload from './pages/Prescription/PrescriptionUpload';

// 2026 AI Feature Pages
import HealthTwin from './pages/HealthTwin/HealthTwin';
import MentalHealth from './pages/MentalHealth/MentalHealth';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import SecondOpinion from './pages/SecondOpinion/SecondOpinion';
import FamilyVault from './pages/FamilyVault/FamilyVault';
import Medications from './pages/Medications/Medications';

const App: React.FC = () => {
  const { setUser, setLoading } = useAppStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsub;
  }, [setUser, setLoading]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontSize: 13,
            boxShadow: 'var(--shadow-md)',
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ai-consultant" element={<AiConsultant />} />
                    <Route path="/health-tracker" element={<HealthTracker />} />
                    <Route path="/profile" element={<HealthProfile />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/insights" element={<AIInsights />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/pharmacy" element={<Pharmacy />} />
                    <Route path="/pharmacy/checkout" element={<Checkout />} />
                    <Route path="/pharmacy/orders" element={<Orders />} />
                    <Route path="/dosage-calculator" element={<DosageCalculator />} />
                    <Route path="/lab-tests" element={<LabTests />} />
                    <Route path="/prescriptions" element={<PrescriptionUpload />} />
                    {/* ── 2026 AI Features ───────────────────── */}
                    <Route path="/health-twin" element={<HealthTwin />} />
                    <Route path="/mental-health" element={<MentalHealth />} />
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="/second-opinion" element={<SecondOpinion />} />
                    <Route path="/family-vault" element={<FamilyVault />} />
                    <Route path="/medications" element={<Medications />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
