import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';

export const PublicLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFA] text-[#0F172A] antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
