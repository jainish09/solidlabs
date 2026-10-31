import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  FolderKanban,
  Truck,
  Receipt,
  CheckCircle2,
  Sliders,
  UploadCloud,
  FileCheck2,
  PlusCircle,
  ArrowRight,
  Clock,
  ChevronRight,
  TrendingUp,
  Box,
  MessageSquare,
} from 'lucide-react';

export const CustomerDashboardPage = () => {
  const { user, requirements, quotations, orders, totalUnreadMessages } = useAuth();
  const navigate = useNavigate();

  const totalProjects = requirements.length + 3; // Total active engineering projects
  const activeOrders = orders.filter((o) => o.currentStageIndex < 6);
  const completedOrders = orders.filter((o) => o.currentStageIndex === 6);
  const pendingQuotations = quotations.filter((q) => q.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="orange" size="xs" dot>Customer Engineering Portal</Badge>
            <Badge variant="teal" size="xs">{user.organization}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#858585] font-body max-w-xl">
            Manage your automotive components, track machine spindle cutting in real-time, and compare supplier quotations in Indian Rupees.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/customer/messages')}
            leftIcon={<MessageSquare size={15} className="text-[#FF7138]" />}
            className="hover:border-[#FF7138]"
          >
            <span>Messages</span>
            {totalUnreadMessages > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FF7138] text-white text-[10px] font-bold">
                {totalUnreadMessages}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/cad-analyzer')}
            leftIcon={<UploadCloud size={15} />}
          >
            Upload CAD
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customize/prod_001')}
            leftIcon={<PlusCircle size={15} />}
          >
            Post Requirement
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Projects',
            value: totalProjects,
            note: 'Active CAD & RFQs',
            icon: <FolderKanban size={22} className="text-[#FF7138]" />,
            border: 'border-l-4 border-l-[#FF7138]',
          },
          {
            label: 'Active Orders',
            value: activeOrders.length,
            note: 'In Machining / Metrology',
            icon: <Truck size={22} className="text-[#20B8A5]" />,
            border: 'border-l-4 border-l-[#20B8A5]',
          },
          {
            label: 'Pending Quotations',
            value: pendingQuotations.length,
            note: 'Awaiting your review',
            icon: <Receipt size={22} className="text-[#111111]" />,
            border: 'border-l-4 border-l-[#111111]',
          },
          {
            label: 'Completed Orders',
            value: completedOrders.length + 5,
            note: 'CMM Metrology Verified',
            icon: <CheckCircle2 size={22} className="text-emerald-500" />,
            border: 'border-l-4 border-l-emerald-500',
          },
        ].map((card, i) => (
          <Card key={i} className={card.border}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase text-[#858585] tracking-wider">{card.label}</p>
                <p className="text-3xl font-extrabold font-heading text-[#111111] mt-1">{card.value}</p>
                <p className="text-[11px] text-[#20B8A5] font-mono mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {card.note}
                </p>
              </div>
              <div className="p-2.5 bg-[#F5F5F3] rounded-xl">
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Split: Order Activity (Left) & Recent Quotations / Projects (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Production Tracking Orders (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[#111111] flex items-center gap-2">
              <Truck className="text-[#20B8A5]" size={18} />
              <span>Live Order Activity & Production Stages</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer/orders')}
              rightIcon={<ChevronRight size={14} />}
            >
              All Orders
            </Button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              const currentStage = order.stages[order.currentStageIndex];

              return (
                <Card
                  key={order.id}
                  hover
                  onClick={() => navigate('/customer/orders')}
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#FF7138]">{order.orderNumber}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs font-mono text-[#858585]">{order.category}</span>
                      </div>
                      <h3 className="text-sm font-bold font-heading text-[#111111] mt-0.5">
                        {order.productName}
                      </h3>
                      <p className="text-xs text-[#858585] mt-0.5 font-body">
                        Manufacturer: <strong className="text-[#111111]">{order.manufacturerName}</strong> • {order.quantity} units
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <Badge variant="teal" size="sm" dot>
                        {currentStage?.name || 'Production In Progress'}
                      </Badge>
                      <p className="text-[11px] font-mono text-emerald-600 font-bold mt-1">
                        ₹{order.totalPriceINR.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* 7 Stage Visual Stepper Mini */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-7 gap-1">
                      {order.stages.map((stg, idx) => (
                        <div key={idx} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              stg.completed
                                ? 'bg-[#20B8A5]'
                                : stg.inProgress
                                ? 'bg-[#FF7138] animate-pulse'
                                : 'bg-gray-200'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#858585] mt-1">
                      <span>Carrier: {order.carrier} ({order.trackingNumber})</span>
                      <span className="text-[#20B8A5]">Stage {order.currentStageIndex + 1} of 7</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Quotations & Requirements (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Quotations Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-heading text-[#111111] flex items-center gap-2">
                <Receipt className="text-[#FF7138]" size={18} />
                <span>Recent Quotations</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer/quotes')}
                rightIcon={<ChevronRight size={14} />}
              >
                Compare
              </Button>
            </div>

            <div className="space-y-3">
              {quotations.slice(0, 2).map((q) => (
                <Card key={q.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FF7138]">{q.id}</span>
                    <Badge variant={q.status === 'accepted' ? 'success' : 'orange'} size="xs">
                      {q.status.toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold font-heading text-[#111111]">{q.productName}</h4>
                  <p className="text-[11px] text-[#858585] font-mono">From: {q.manufacturerName}</p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold font-heading text-emerald-600">
                      ₹{q.finalPriceINR.toLocaleString('en-IN')}
                    </span>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => navigate('/customer/quotes')}
                    >
                      Review & Accept
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Launchpad Actions */}
          <Card className="bg-[#111111] text-white p-5 space-y-3 border-none">
            <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
              <Sliders size={16} className="text-[#FF7138]" />
              Engineering Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => navigate('/customize/prod_001')}
                className="p-2.5 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] border border-white/5 text-left text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="block font-bold text-[#FF7138]">AI Studio</span>
                <span className="text-[10px] text-white/50">Customise part</span>
              </button>
              <button
                onClick={() => navigate('/cad-analyzer')}
                className="p-2.5 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] border border-white/5 text-left text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="block font-bold text-[#20B8A5]">DFM Audit</span>
                <span className="text-[10px] text-white/50">Mesh validation</span>
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="p-2.5 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] border border-white/5 text-left text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="block font-bold text-white">Catalog</span>
                <span className="text-[10px] text-white/50">18 Categories</span>
              </button>
              <button
                onClick={() => navigate('/customer/orders')}
                className="p-2.5 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] border border-white/5 text-left text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span className="block font-bold text-emerald-400">Tracking</span>
                <span className="text-[10px] text-white/50">7 Stages</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
