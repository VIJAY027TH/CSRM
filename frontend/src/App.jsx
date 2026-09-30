import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { AppRoutes } from './routes/AppRoutes';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        {isAuthenticated && <Sidebar />}
        <main className="content-area">
          <AppRoutes />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
