import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Search,
  Sliders,
  ShoppingBag,
  Factory,
  Layers,
  HelpCircle,
  Menu,
  X,
  ArrowRight,
  User,
  PlusCircle,
  MessageSquare,
  PanelLeft,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, setRole, showToast, totalUnreadMessages, sidebarOpen, setSidebarOpen, toggleSidebar } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Client Portal', path: '/customer/dashboard' },
    { name: 'Manufacturer Hub', path: '/manufacturer/dashboard' },
    { name: 'Explore Products', path: '/marketplace' },
    { name: 'Manufacturers', path: '/#manufacturers' },
    { name: 'Industries', path: '/#industries' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    if (path.startsWith('/#')) return location.hash === path.slice(1);
    return location.pathname === path;
  };

  const handleNavClick = (path) => {
    setMobileOpen(false);
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
    <nav className="sticky top-0 z-40 w-full bg-[#111111] text-white border-b border-gray-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Open Workspace Navigation Sidebar"
            >
              <PanelLeft className="w-4 h-4 text-[#FF7138]" />
              <span className="hidden sm:inline text-xs font-mono font-medium">Sidebar</span>
            </button>

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

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#FF7138] font-bold bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Header Utilities & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 18 categories..."
                    className="w-48 bg-[#1B1B1B] border border-gray-700 text-xs px-3 py-1.5 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                    autoFocus
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Search products"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            {/* Role Demo Switcher Pill */}
            <button
              type="button"
              onClick={handleToggleRole}
              title="Toggle demo persona"
              className="px-2.5 py-1.5 rounded-lg bg-[#1B1B1B] border border-white/10 hover:border-[#FF7138]/50 transition-colors flex items-center gap-2 text-xs font-mono text-white/80 cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${role === 'customer' ? 'bg-[#FF7138]' : 'bg-[#20B8A5]'}`} />
              <span className="hidden xl:inline">{role === 'customer' ? 'Engineer Persona' : 'Manufacturer Persona'}</span>
              <span className="xl:hidden">{role === 'customer' ? 'Customer' : 'Mfg'}</span>
            </button>

            {/* Direct Connect Messaging Link */}
            <Link
              to={role === 'customer' ? '/customer/messages' : '/manufacturer/messages'}
              className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              title="SolidLabs Connect - Messaging"
            >
              <MessageSquare size={17} />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF7138] text-[9px] font-bold font-mono text-white flex items-center justify-center animate-pulse shadow-sm">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>

            {/* Auth Links */}
            <Link
              to={role === 'customer' ? '/customer/dashboard' : '/manufacturer/dashboard'}
              className="text-xs font-mono text-white/70 hover:text-white transition-colors"
            >
              Dashboard
            </Link>

            <Link to="/login" className="text-xs font-mono text-white/70 hover:text-white transition-colors">
              Login
            </Link>

            {/* Post Requirement CTA */}
            <Link to="/customize/prod_001">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                className="text-xs font-bold"
              >
                Post Requirement
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleToggleRole}
              className="px-2 py-1 rounded bg-[#1B1B1B] text-[10px] font-mono text-[#FF7138] border border-white/10"
            >
              {role === 'customer' ? 'Customer' : 'Mfg'}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-gray-800 bg-[#111111] px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search automotive components..."
                className="w-full bg-[#1B1B1B] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`block px-3 py-2 rounded-lg text-xs font-medium ${
                isActive(link.path) ? 'bg-white/10 text-[#FF7138] font-bold' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
            <Link
              to={role === 'customer' ? '/customer/messages' : '/manufacturer/messages'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-[#FF7138] bg-white/5"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} />
                <span>Messages (SolidLabs Connect)</span>
              </div>
              {totalUnreadMessages > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#FF7138] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>
            <Link
              to={role === 'customer' ? '/customer/dashboard' : '/manufacturer/dashboard'}
              onClick={() => setMobileOpen(false)}
            >
              <Button variant="secondary" size="md" className="w-full text-xs">
                Open {role === 'customer' ? 'Customer Workspace' : 'Manufacturer Portal'}
              </Button>
            </Link>
            <Link to="/customize/prod_001" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" className="w-full text-xs" leftIcon={<PlusCircle size={14} />}>
                Post Requirement to Manufacturers
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Slide-over Workspace Navigation Drawer (Accessible Anywhere) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-3.5 bg-[#111111] text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <PanelLeft className="w-4 h-4 text-[#FF7138]" />
                <span className="font-heading font-bold text-xs">SolidLabs Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Close Sidebar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onClose={() => setSidebarOpen(false)} isDrawer />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
