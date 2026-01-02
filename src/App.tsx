import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Páginas públicas
import LandingPage from './pages/public/LandingPage';
import RegistroSocio from './pages/public/RegistroSocio';
import CuponPage from './pages/public/CuponPage';
import PortalSocio from './pages/public/PortalSocio';

// Páginas de administración
import Login from './pages/auth/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Socios from './pages/admin/Socios';
import Artistas from './pages/admin/Artistas';
import Cupones from './pages/admin/Cupones';
import Pagos from './pages/admin/Pagos';
import Configuracion from './pages/admin/Configuracion';

// Contexto de autenticación
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/registro-socio" element={<RegistroSocio />} />
          <Route path="/cupon/:codigo" element={<CuponPage />} />
          <Route path="/portal-socio" element={<PortalSocio />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas de administración (protegidas) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="socios" element={<Socios />} />
            <Route path="artistas" element={<Artistas />} />
            <Route path="cupones" element={<Cupones />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;