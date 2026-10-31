import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderKanban,
  Sliders,
  UploadCloud,
  FileCheck2,
  FileText,
  Receipt,
  Truck,
  ShieldCheck,
  User,
  Settings,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  DollarSign,
  ClipboardList,
  Factory,
  MessageSquare,
} from 'lucide-react';
import Badge from '../common/Badge';

export const Sidebar = ({ onClose, isDrawer = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, setRole, showToast, totalUnreadMessages } = useAuth();

  // Auto-sync role with the current dashboard route if user is inside /customer or /manufacturer
  useEffect(() => {
    if (location.pathname.startsWith('/customer') && role !== 'customer') {
      setRole('customer');
    } else if (location.pathname.startsWith('/manufacturer') && role !== 'manufacturer') {
      setRole('manufacturer');
    }
  }, [location.pathname, role, setRole]);

  const handleItemClick = () => {
    if (onClose) onClose();
  };

  const customerLinks = [
    { name: 'Overview', path: '/customer/dashboard', icon: <LayoutDashboard size={16} /> },
    {
      name: 'Messages',
      path: '/customer/messages',
      icon: <MessageSquare size={16} />,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : null,
    },
    { name: 'Explore Products', path: '/marketplace', icon: <ShoppingBag size={16} /> },
    { name: 'My Projects', path: '/customer/projects', icon: <FolderKanban size={16} /> },
    { name: 'AI Customization Studio', path: '/customize/prod_001', icon: <Sliders size={16} /> },
    { name: 'Upload CAD', path: '/customer/upload-cad', icon: <UploadCloud size={16} /> },
    { name: 'DFM Analysis', path: '/cad-analyzer', icon: <FileCheck2 size={16} /> },
    { name: 'My Requirements', path: '/customer/requirements', icon: <FileText size={16} /> },
    { name: 'Quotations', path: '/customer/quotes', icon: <Receipt size={16} /> },
    { name: 'My Orders', path: '/customer/orders', icon: <Truck size={16} /> },
    { name: 'Production Tracking', path: '/customer/tracking', icon: <Layers size={16} /> },
    { name: 'Quality Reports', path: '/customer/quality-reports', icon: <ShieldCheck size={16} /> },
    { name: 'Profile', path: '/customer/profile', icon: <User size={16} /> },
    { name: 'Settings', path: '/customer/settings', icon: <Settings size={16} /> },
  ];

  const manufacturerLinks = [
    { name: 'Overview', path: '/manufacturer/dashboard', icon: <LayoutDashboard size={16} /> },
    {
      name: 'Messages',
      path: '/manufacturer/messages',
      icon: <MessageSquare size={16} />,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : null,
    },
    { name: 'Incoming Requests', path: '/manufacturer/requests', icon: <ClipboardList size={16} /> },
    { name: 'Product Catalogue', path: '/marketplace', icon: <ShoppingBag size={16} /> },
    { name: 'Design Review', path: '/cad-analyzer', icon: <FileCheck2 size={16} /> },
    { name: 'Quotations', path: '/manufacturer/quotes', icon: <Receipt size={16} /> },
    { name: 'Active Orders', path: '/manufacturer/orders', icon: <Truck size={16} /> },
    { name: 'Production Management', path: '/manufacturer/production', icon: <Layers size={16} /> },
    { name: 'Quality Control', path: '/manufacturer/quality', icon: <ShieldCheck size={16} /> },
    { name: 'Inventory', path: '/manufacturer/inventory', icon: <Package size={16} /> },
    { name: 'Analytics', path: '/manufacturer/analytics', icon: <TrendingUp size={16} /> },
    { name: 'Earnings', path: '/manufacturer/earnings', icon: <DollarSign size={16} /> },
    { name: 'Company Profile', path: '/manufacturer/profile', icon: <Factory size={16} /> },
    { name: 'Settings', path: '/manufacturer/settings', icon: <Settings size={16} /> },
  ];

  const links = role === 'customer' ? customerLinks : manufacturerLinks;

  const handleToggleRole = () => {
    const nextRole = role === 'customer' ? 'manufacturer' : 'customer';
    setRole(nextRole);
    showToast(`Active persona switched to: ${nextRole === 'customer' ? 'Hardware Engineer (Customer)' : 'Manufacturer Partner'}`);
    if (location.pathname.startsWith('/customer')) {
      navigate('/manufacturer/dashboard');
    } else if (location.pathname.startsWith('/manufacturer')) {
      navigate('/customer/dashboard');
    }
    if (onClose) onClose();
  };

  return (
    <aside
      className={`${
        isDrawer
          ? 'w-full bg-white flex flex-col h-full select-none'
          : 'w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 shadow-xs'
      }`}
    >
      {/* Active Persona Banner */}
      <div className="p-4 border-b border-gray-100 bg-[#F5F5F3]/50">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#858585]">Workspace Persona</span>
            <Badge variant={role === 'customer' ? 'orange' : 'teal'} size="xs">
              {role === 'customer' ? 'Customer' : 'Manufacturer'}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-bold font-heading text-[#111111] truncate">{user.name}</p>
            <p className="text-[10px] text-[#858585] font-mono truncate">{user.organization}</p>
          </div>

          <button
            type="button"
            onClick={handleToggleRole}
            className="w-full text-center text-[10px] font-mono py-1 rounded-lg bg-white hover:bg-gray-100 text-[#111111] border border-gray-200 transition-colors cursor-pointer mt-1"
          >
            Switch to {role === 'customer' ? 'Manufacturer' : 'Customer'} View
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#858585]">
          {role === 'customer' ? 'Customer Navigation' : 'Manufacturer Hub'}
        </p>
        {links.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleItemClick}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                active
                  ? 'bg-[#111111] text-white font-semibold shadow-xs'
                  : 'text-[#858585] hover:bg-gray-100 hover:text-[#111111]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={active ? 'text-[#FF7138]' : 'text-gray-400'}>{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#FF7138] text-white text-[9px] font-bold font-mono">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={13} className="text-[#FF7138]" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-gray-100 bg-[#F5F5F3]/50 text-[10px] font-mono text-[#858585]">
        <div className="flex items-center justify-between">
          <span>Shared State:</span>
          <span className="text-[#20B8A5] font-semibold">Synchronized</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
