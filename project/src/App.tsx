import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { SuccessPage } from './components/subscription/SuccessPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { InventoryPage } from './components/inventory/InventoryPage';
import { ForecastingPage } from './components/forecasting/ForecastingPage';
import { LogisticsPage } from './components/logistics/LogisticsPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ScenariosPage } from './components/scenarios/ScenariosPage';
import { SubscriptionPlans } from './components/subscription/SubscriptionPlans';
import { Pricing } from './pages/Pricing';
import { TrialExpirationBanner } from './components/subscription/TrialExpirationBanner';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TrialExpirationBanner />
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/forecasting" element={<ForecastingPage />} />
            <Route path="/logistics" element={<LogisticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/subscription" element={<SubscriptionPlans />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;