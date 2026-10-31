import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public & Studio Pages
import LandingPage from './pages/public/LandingPage';
import MarketplacePage from './pages/public/MarketplacePage';
import ProductDetailsPage from './pages/public/ProductDetailsPage';
import CustomizationStudioPage from './pages/public/CustomizationStudioPage';
import CadAnalyzerPage from './pages/public/CadAnalyzerPage';
import QuotesPage from './pages/public/QuotesPage';
import LoginPage from './pages/auth/LoginPage';

// Common Messaging Page (SolidLabs Connect)
import MessagesPage from './pages/common/MessagesPage';

// Customer Pages
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import CustomerAssetsPage from './pages/customer/CustomerAssetsPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerQuotesPage from './pages/customer/CustomerQuotesPage';
import CustomerRequirementsPage from './pages/customer/CustomerRequirementsPage';
import CustomerQualityPage from './pages/customer/CustomerQualityPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import CustomerSettingsPage from './pages/customer/CustomerSettingsPage';

// Manufacturer Pages
import ManufacturerDashboardPage from './pages/manufacturer/ManufacturerDashboardPage';
import ManufacturerRequestsPage from './pages/manufacturer/ManufacturerRequestsPage';
import ManufacturerOrdersPage from './pages/manufacturer/ManufacturerOrdersPage';
import ManufacturerAnalyticsPage from './pages/manufacturer/ManufacturerAnalyticsPage';
import ManufacturerCapabilitiesPage from './pages/manufacturer/ManufacturerCapabilitiesPage';
import ManufacturerQualityControlPage from './pages/manufacturer/ManufacturerQualityControlPage';
import ManufacturerInventoryPage from './pages/manufacturer/ManufacturerInventoryPage';
import ManufacturerEarningsPage from './pages/manufacturer/ManufacturerEarningsPage';
import ManufacturerSettingsPage from './pages/manufacturer/ManufacturerSettingsPage';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & Exploration Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/customize/:productId" element={<CustomizationStudioPage />} />
            <Route path="/customize" element={<Navigate to="/customize/prod_001" replace />} />
            <Route path="/studio" element={<Navigate to="/customize/prod_001" replace />} />
            <Route path="/cad-analyzer" element={<CadAnalyzerPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/manufacturers" element={<Navigate to="/#manufacturers" replace />} />
            <Route path="/industries" element={<Navigate to="/#industries" replace />} />
            <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
            <Route path="/messages" element={<Navigate to="/customer/messages" replace />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Customer / Hardware Engineer Workspace (SolidLabs Connect) */}
          <Route path="/customer" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboardPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:conversationId" element={<MessagesPage />} />
            <Route path="projects" element={<CustomerAssetsPage />} />
            <Route path="assets" element={<CustomerAssetsPage />} />
            <Route path="upload-cad" element={<CadAnalyzerPage />} />
            <Route path="requirements" element={<CustomerRequirementsPage />} />
            <Route path="quotes" element={<CustomerQuotesPage />} />
            <Route path="orders" element={<CustomerOrdersPage />} />
            <Route path="tracking" element={<CustomerOrdersPage />} />
            <Route path="quality-reports" element={<CustomerQualityPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
            <Route path="settings" element={<CustomerSettingsPage />} />
          </Route>

          {/* Manufacturer Partner Workspace (SolidLabs Connect) */}
          <Route path="/manufacturer" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/manufacturer/dashboard" replace />} />
            <Route path="dashboard" element={<ManufacturerDashboardPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:conversationId" element={<MessagesPage />} />
            <Route path="requests" element={<ManufacturerRequestsPage />} />
            <Route path="quotes" element={<ManufacturerRequestsPage />} />
            <Route path="orders" element={<ManufacturerOrdersPage />} />
            <Route path="production" element={<ManufacturerOrdersPage />} />
            <Route path="quality" element={<ManufacturerQualityControlPage />} />
            <Route path="inventory" element={<ManufacturerInventoryPage />} />
            <Route path="analytics" element={<ManufacturerAnalyticsPage />} />
            <Route path="earnings" element={<ManufacturerEarningsPage />} />
            <Route path="profile" element={<ManufacturerCapabilitiesPage />} />
            <Route path="capabilities" element={<ManufacturerCapabilitiesPage />} />
            <Route path="settings" element={<ManufacturerSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
