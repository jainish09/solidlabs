import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';

export const PublicLayout = () => {
  const location = useLocation();
  // Landing page already contains the footer, or we can render Footer on all other pages
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3] text-[#111111] antialiased">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
