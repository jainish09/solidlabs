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
  User,
} from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import DemoPlanSwitcher from '../subscription/DemoPlanSwitcher';
import Sidebar from './Sidebar';

export const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole, showToast, totalUnreadMessages, sidebarOpen, setSidebarOpen, toggleSidebar } = useAuth();
  const { currentPlan } = useSubscription();

  // Role-specific header navigation: For customer role, Marketplace, Pricing, My Projects, How It Works
  const customerNavLinks = [
    { name: 'Marketplace', path: '/customer/marketplace' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'My Projects', path: '/customer/projects' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  const defaultNavLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'AI Studio', path: '/customize/prod_001' },
    { name: 'CAD Metrology', path: '/cad-analyzer' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  const navLinks = role === 'customer' ? customerNavLinks : defaultNavLinks;

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
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md text-[#0F172A] border-b border-teal-100 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Left: 3-Lines Sidebar Toggle Icon + Brand Logo */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Clean 3-lines Hamburger Icon for Sidebar */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-9 h-9 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 hover:text-teal-900 border border-teal-200/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              title="Open Navigation Sidebar"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-4.5 h-4.5 text-teal-700" />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/30 group-hover:scale-105 transition-transform text-white">
                <Box className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-lg font-black tracking-tight text-[#0F172A]">SolidLabs</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                </div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-teal-700 font-semibold">B2B Automotive Mfg</span>
              </div>
            </Link>
          </div>

          {/* Center: Clean & Uncluttered Navigation Links (Evenly Spaced) */}
          <div className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'text-teal-700 bg-teal-50 border border-teal-200/60 font-bold'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Search, Messages, Role Pill, and Action CTA (Evenly Spaced) */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 18 categories..."
                    className="w-44 sm:w-56 h-9 bg-teal-50/60 border border-teal-200 text-xs px-3.5 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
                    autoFocus
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 rounded-xl bg-teal-50/60 text-slate-700 hover:text-teal-700 hover:bg-teal-100/70 border border-teal-100 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Search products"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            {/* Direct Connect Messaging Link */}
            <Link
              to={role === 'customer' ? '/customer/messages' : '/manufacturer/messages'}
              className="relative w-9 h-9 rounded-xl bg-teal-50/60 text-slate-700 hover:text-teal-700 hover:bg-teal-100/70 border border-teal-100 transition-colors flex items-center justify-center shadow-2xs"
              title="SolidLabs Connect — Messaging"
            >
              <MessageSquare size={17} />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-600 text-[9px] font-bold font-mono text-white flex items-center justify-center shadow-xs">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>

            {/* Subtle Divider */}
            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            {/* Customer Profile Icon Button (if role is customer) */}
            {role === 'customer' && (
              <Link
                to="/customer/settings"
                className="w-9 h-9 rounded-xl bg-teal-50/60 text-slate-700 hover:text-teal-700 hover:bg-teal-100/70 border border-teal-100 transition-colors flex items-center justify-center shadow-2xs"
                title="Customer Profile & Settings"
              >
                <User size={16} />
              </Link>
            )}

            {/* Hackathon Demo Plan Switcher */}
            <DemoPlanSwitcher />

            {/* Persona Switcher Pill */}
            <button
              type="button"
              onClick={handleToggleRole}
              title="Click to switch between Customer and Manufacturer view"
              className="h-9 px-3.5 rounded-xl bg-teal-50 border border-teal-200 hover:border-teal-400 hover:bg-teal-100/80 transition-colors flex items-center gap-2 text-xs font-mono text-teal-900 cursor-pointer shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="font-semibold">{role === 'customer' ? 'Customer' : 'Manufacturer'}</span>
            </button>

            {/* Post Requirement CTA Button */}
            <Link to={role === 'customer' ? '/customer/post-requirement' : '/customize/prod_001'} className="hidden sm:block">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                className="h-9 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs px-3.5"
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Slide-over panel */}
          <div className="relative w-80 max-w-[85vw] bg-white h-screen max-h-screen shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200 border-r border-teal-100">
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between border-b border-teal-700 shrink-0">
              <div className="flex items-center gap-2.5">
                <Menu className="w-5 h-5 text-teal-300" />
                <span className="font-heading font-bold text-sm tracking-wide text-white">Workspace Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
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
