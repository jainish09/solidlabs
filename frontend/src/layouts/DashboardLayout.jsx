import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3] text-[#111111] antialiased">
      <Navbar />
      <div className="flex flex-1">
        {/* Persistent Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-[#F5F5F3]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
