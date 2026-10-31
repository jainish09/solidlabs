import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Search,
  Sliders,
  Menu,
  X,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole, showToast, totalUnreadMessages, sidebarOpen, setSidebarOpen, toggleSidebar } = useAuth();

  // Streamlined, clean primary navigation
  const navLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'AI Studio', path: '/customize/prod_001' },
    { name: 'CAD Metrology', path: '/cad-analyzer' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    if (path.startsWith('/#')) return location.hash === path.slice(1);
    return location.pathname === path;
  };

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleToggleRole = () => {
    const nextRole = role === 'customer' ? 'manufacturer' : 'customer';
    setRole(nextRole);
    showToast(`Switched active persona to: ${nextRole === 'customer' ? 'Hardware Engineer (Customer)' : 'Manufacturer Partner'}`);
    if (nextRole === 'customer') {
      navigate('/customer/dashboard');
    } else {
      navigate('/manufacturer/dashboard');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#111111]/95 backdrop-blur-md text-white border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: 3-Lines Sidebar Toggle Icon + Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Clean 3-lines Hamburger Icon for Sidebar */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/10 shadow-xs"
              title="Open Navigation Sidebar"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7138] to-[#1B1B1B] flex items-center justify-center shadow-sm shadow-[#FF7138]/20 group-hover:scale-105 transition-transform">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-lg font-black tracking-tight text-white">SolidLabs</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7138]" />
                </div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#20B8A5]">B2B Automotive Mfg</span>
              </div>
            </Link>
          </div>

          {/* Center: Clean & Uncluttered Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#FF7138] font-bold bg-white/10'
                    : 'text-white/75 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Search, Messages, Role Pill, and Action CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 18 categories..."
                    className="w-44 sm:w-56 bg-[#1B1B1B] border border-gray-700 text-xs px-3 py-1.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                    autoFocus
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer border border-white/5"
                  title="Search products"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            {/* Direct Connect Messaging Link */}
            <Link
              to={role === 'customer' ? '/customer/messages' : '/manufacturer/messages'}
              className="relative w-9 h-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5"
              title="SolidLabs Connect — Messaging"
            >
              <MessageSquare size={17} />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF7138] text-[9px] font-bold font-mono text-white flex items-center justify-center animate-pulse shadow-sm">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>

            {/* Subtle Divider */}
            <div className="hidden sm:block h-6 w-px bg-white/10 mx-0.5" />

            {/* Persona Switcher Pill */}
            <button
              type="button"
              onClick={handleToggleRole}
              title="Click to switch between Customer and Manufacturer view"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#1B1B1B] border border-white/10 hover:border-[#FF7138]/50 transition-colors flex items-center gap-2 text-xs font-mono text-white/90 cursor-pointer shadow-xs"
            >
              <span className={`w-2 h-2 rounded-full ${role === 'customer' ? 'bg-[#FF7138]' : 'bg-[#20B8A5]'}`} />
              <span className="font-semibold">{role === 'customer' ? 'Customer' : 'Manufacturer'}</span>
            </button>

            {/* Post Requirement CTA Button */}
            <Link to="/customize/prod_001" className="hidden sm:block">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                className="text-xs font-bold shadow-sm shadow-[#FF7138]/20"
              >
                Post Requirement
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Slide-over Workspace Navigation Drawer (Rendered at Body level to break out of nav stacking context) */}
      {sidebarOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Slide-over panel */}
          <div className="relative w-80 max-w-[85vw] bg-white h-screen max-h-screen shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Menu className="w-5 h-5 text-[#FF7138]" />
                <span className="font-heading font-bold text-sm tracking-wide">Workspace Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <Sidebar onClose={() => setSidebarOpen(false)} isDrawer />
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
