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
  PlusCircle,
  Eye,
  CreditCard,
  Lock,
} from 'lucide-react';
import Badge from '../common/Badge';
import { useSubscription } from '../../context/SubscriptionContext';
import { FEATURES } from '../../utils/featureAccess';

export const Sidebar = ({ onClose, isDrawer = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, setRole, showToast, totalUnreadMessages, quotations = [], orders = [] } = useAuth();
  const { currentPlan, hasAccess } = useSubscription();

  const pendingQuotesCount = quotations.filter((q) => q.status === 'pending').length;
  const activeOrdersCount = orders.filter((o) => o.currentStageIndex < 6).length;

  // Auto-sync role with the current dashboard route if user is inside /customer or /manufacturer
  useEffect(() => {
    if (location.pathname.startsWith('/customer') && role !== 'customer') {
      setRole('customer');
    } else if (location.pathname.startsWith('/manufacturer') && role !== 'manufacturer') {
      setRole('manufacturer');
    }
  }, [location.pathname, role, setRole]);

  const handleItemNavigation = () => {
    onClose?.();
  };

<<<<<<< HEAD
  // Customer Navigation Items with Subscription Access Controls
=======
  // Main navigation items for the customer workspace
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
  const customerLinks = [
    { name: 'Marketplace', path: '/customer/marketplace', icon: <ShoppingBag size={16} /> },
    {
      name: 'Post Requirement',
      path: '/customer/post-requirement',
      icon: <PlusCircle size={16} />,
      requiredFeature: FEATURES.SUBMIT_REQUIREMENTS,
      requiredTier: 'PRO',
    },
    { name: 'My Projects', path: '/customer/projects', icon: <FolderKanban size={16} /> },
    {
      name: 'Quotations',
      path: '/customer/quotations',
      icon: <Receipt size={16} />,
      badge: pendingQuotesCount > 0 ? pendingQuotesCount : null,
    },
    {
      name: 'My Orders',
      path: '/customer/orders',
      icon: <Truck size={16} />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
    },
<<<<<<< HEAD
    {
      name: 'Production Tracking',
      path: '/customer/tracking',
      icon: <Layers size={16} />,
      requiredFeature: FEATURES.PRODUCTION_TRACKING,
      requiredTier: 'ENT',
    },
    {
      name: 'Quality Reports',
      path: '/customer/quality',
      icon: <ShieldCheck size={16} />,
      requiredFeature: FEATURES.QUALITY_REPORTS,
      requiredTier: 'ENT',
    },
=======
    { name: 'Quality Reports', path: '/customer/quality', icon: <ShieldCheck size={16} /> },
>>>>>>> 535b8eba77b292031cabc33d8ef14ecebf85c3c4
    {
      name: 'Messages',
      path: '/customer/messages',
      icon: <MessageSquare size={16} />,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : null,
      requiredFeature: FEATURES.MANUFACTURER_CHAT,
      requiredTier: 'PRO',
    },
    { name: 'Subscription', path: '/customer/subscription', icon: <CreditCard size={16} /> },
    { name: 'Profile & Settings', path: '/customer/settings', icon: <Settings size={16} /> },
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
    { name: 'Eye Vision', path: '/cad-analyzer', icon: <Eye size={16} /> },
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
      <div className="p-4 border-b border-teal-100 bg-teal-50/40">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-teal-800 font-bold">Workspace Persona</span>
            <Badge variant="teal" size="xs">
              {role === 'customer' ? 'Customer' : 'Manufacturer'}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-bold font-heading text-[#0F172A] truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-mono truncate">{user.organization}</p>
          </div>

          <button
            type="button"
            onClick={handleToggleRole}
            className="w-full text-center text-[10px] font-mono py-1.5 rounded-lg bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 hover:border-teal-400 transition-colors cursor-pointer mt-1 font-semibold shadow-2xs"
          >
            Switch to {role === 'customer' ? 'Manufacturer' : 'Customer'} View
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-teal-800 font-bold">
          {role === 'customer' ? 'Customer Navigation' : 'Manufacturer Hub'}
        </p>
        {links.map((item) => {
          const isItemActive = () => {
            if (location.pathname === item.path) return true;
            if (item.path === '/customer/dashboard') {
              return location.pathname === '/customer/overview' || location.pathname === '/customer';
            }
            if (item.path === '/customer/quotations') {
              return location.pathname === '/customer/quotes';
            }
            if (item.path === '/customer/post-requirement') {
              return location.pathname === '/customer/requirements';
            }
            if (item.path === '/customer/projects') {
              return location.pathname === '/customer/assets';
            }
            if (item.path === '/customer/quality') {
              return location.pathname === '/customer/quality-reports';
            }
            if (item.path === '/customer/settings') {
              return location.pathname === '/customer/profile';
            }
            if (item.path === '/customer/messages') {
              return location.pathname.startsWith('/customer/messages');
            }
            if (item.path === '/customer/marketplace') {
              return location.pathname === '/marketplace' || location.pathname.startsWith('/products/');
            }
            return false;
          };

          const active = isItemActive();
          const isLocked = role === 'customer' && item.requiredFeature && !hasAccess(item.requiredFeature);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleItemNavigation}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-teal-50 text-teal-900 font-bold border-l-4 border-teal-600 shadow-2xs'
                  : 'text-slate-600 hover:bg-teal-50/60 hover:text-teal-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={active ? 'text-teal-700' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isLocked && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                    <Lock size={9} />
                    <span>{item.requiredTier}</span>
                  </span>
                )}
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[9px] font-bold font-mono shadow-2xs">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={14} className="text-teal-600" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Customer Subscription Tier Badge Card */}
      {role === 'customer' && (
        <div className="p-3 border-t border-teal-100 bg-teal-50/50">
          <div className="p-2.5 rounded-xl bg-white border border-teal-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Plan</span>
              <span className={`font-bold font-mono text-[11px] px-2 py-0.5 rounded-md ${
                currentPlan === 'ENTERPRISE'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : currentPlan === 'PROFESSIONAL'
                  ? 'bg-teal-100 text-teal-900 border border-teal-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {currentPlan}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono text-[10px]">
                {currentPlan === 'STARTER' ? 'Free Forever' : currentPlan === 'PROFESSIONAL' ? '₹2,999/mo' : '₹4,999/mo'}
              </span>
              <a
                href="/customer/subscription"
                onClick={(e) => handleItemNavigation(e, '/customer/subscription')}
                className="text-teal-800 font-bold hover:underline font-mono text-[10px]"
              >
                {currentPlan === 'ENTERPRISE' ? 'Manage' : 'Upgrade →'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer System Status */}
      <div className="p-3 border-t border-teal-100 bg-teal-50/30 text-[10px] font-mono text-slate-500">
        <div className="flex items-center justify-between">
          <span>Shared State:</span>
          <span className="text-teal-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Synchronized
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
