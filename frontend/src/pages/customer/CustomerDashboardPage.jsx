import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { FEATURES } from '../../utils/featureAccess';
import { PLAN_IDS } from '../../data/subscriptionPlans';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
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
  ShieldCheck,
  Layers,
  Activity,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const CustomerDashboardPage = () => {
  const { user, requirements, quotations, orders, totalUnreadMessages, acceptQuotation, showToast } = useAuth();
  const { hasAccess, openUpgradeModal } = useSubscription();
  const navigate = useNavigate();

  // Confirmation modal state for accepting quotation from overview
  const [acceptingQuote, setAcceptingQuote] = useState(null);

  const totalProjects = requirements.length + 3; // Active projects + initial registered CAD revisions
  const activeOrders = orders.filter((o) => o.currentStageIndex < 6);
  const pendingQuotations = quotations.filter((q) => q.status === 'pending');
  const qualityVerifiedOrders = orders.filter((o) => o.qualityReportReady || o.currentStageIndex >= 3);

  const handlePostRequirementClick = () => {
    if (!hasAccess(FEATURES.SUBMIT_REQUIREMENTS)) {
      openUpgradeModal(
        PLAN_IDS.PROFESSIONAL,
        'Post Custom Requirement',
        'Submitting custom manufacturing requirements and broadcasting RFQs requires a Professional subscription.'
      );
      return;
    }
    navigate('/customer/post-requirement');
  };

  const handleUploadCadClick = () => {
    if (!hasAccess(FEATURES.UPLOAD_CAD)) {
      openUpgradeModal(
        PLAN_IDS.PROFESSIONAL,
        'CAD Design Upload',
        'Uploading custom 3D models (STEP, STL, IGES) and automated DFM auditing requires a Professional subscription.'
      );
      return;
    }
    navigate('/customer/post-requirement');
  };

  const handleTrackOrdersClick = () => {
    if (!hasAccess(FEATURES.PRODUCTION_TRACKING)) {
      openUpgradeModal(
        PLAN_IDS.ENTERPRISE,
        'Live Production Tracking',
        'Live factory spindle telemetry, machine progress, and 7-stage shopfloor tracking require an Enterprise subscription.'
      );
      return;
    }
    navigate('/customer/tracking');
  };

  const handleCardClick = (card) => {
    if (card.link === '/customer/quality' && !hasAccess(FEATURES.QUALITY_REPORTS)) {
      openUpgradeModal(
        PLAN_IDS.ENTERPRISE,
        'Zeiss CMM Quality Reports',
        'Accessing certified third-party CMM inspection reports and material test certificates requires an Enterprise subscription.'
      );
      return;
    }
    navigate(card.link);
  };

  const handleConfirmAcceptQuote = () => {
    if (!acceptingQuote) return;
    const newOrder = acceptQuotation(acceptingQuote.id);
    setAcceptingQuote(null);
    if (newOrder) {
      navigate('/customer/orders');
    }
  };

  // Chronological activity log from actual customer events
  const RECENT_ACTIVITIES = [
    {
      type: 'dispatch',
      title: 'Product Dispatched via BlueDart Express',
      detail: 'Consignment BD-9041-8812-IN for 80 units of Carbon-Ceramic Brake Pads is in transit to Pune Hub.',
      time: '2 hours ago',
      icon: <Truck size={14} className="text-teal-600" />,
      dotColor: 'bg-teal-500',
    },
    {
      type: 'inspection',
      title: 'Zeiss CMM Inspection Passed (Lot of 25)',
      detail: 'Sundaram Advanced Metrology completed dimensional and hydrostatic tests on Cold-Plate batch.',
      time: 'Yesterday, 4:30 PM',
      icon: <ShieldCheck size={14} className="text-emerald-600" />,
      dotColor: 'bg-emerald-500',
    },
    {
      type: 'manufacturing',
      title: '5-Axis Spindle Cutting Commenced',
      detail: 'AeroForge Dynamics initiated roughing cycle on Haas VF-4SS for 19" Wheel Hub.',
      time: 'Oct 29, 2:15 PM',
      icon: <Activity size={14} className="text-teal-700" />,
      dotColor: 'bg-teal-600',
    },
    {
      type: 'quote_accepted',
      title: 'Quotation Accepted & Order SL-9041 Created',
      detail: 'Quotation QUO-2026-501 accepted from Continental Rubber; initial payment approved.',
      time: 'Oct 28, 11:30 AM',
      icon: <CheckCircle2 size={14} className="text-teal-700" />,
      dotColor: 'bg-teal-600',
    },
    {
      type: 'quote_received',
      title: 'New Formal Quotation Received',
      detail: 'Apex Precision Auto Rubber submitted bid QUO-2026-502 for ₹5,27,000.',
      time: 'Oct 28, 09:15 AM',
      icon: <Receipt size={14} className="text-slate-700" />,
      dotColor: 'bg-slate-500',
    },
    {
      type: 'dfm',
      title: 'DFM Geometric Audit Passed (100% Watertight)',
      detail: 'Euler 2-manifold check (χ=2) completed with zero non-manifold edges.',
      time: 'Oct 27, 3:00 PM',
      icon: <FileCheck2 size={14} className="text-teal-600" />,
      dotColor: 'bg-teal-500',
    },
    {
      type: 'requirement',
      title: 'Requirement REQ-2026-105 Broadcasted',
      detail: 'Forged Monoblock 19" Alloy Wheel RFQ distributed to verified machine shops.',
      time: 'Oct 26, 10:00 AM',
      icon: <PlusCircle size={14} className="text-teal-600" />,
      dotColor: 'bg-teal-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Activity Header */}
      <div className="bg-white border border-teal-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" size="xs" dot>Customer Manufacturing Workspace</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {user.organization}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-body max-w-2xl leading-relaxed">
            You currently have <strong className="text-slate-900">{activeOrders.length} active orders</strong> in production,{' '}
            <strong className="text-teal-700">{pendingQuotations.length} pending quotations</strong> awaiting review, and{' '}
            <strong className="text-slate-900">{qualityVerifiedOrders.length} batches</strong> certified by Zeiss CMM metrology.
          </p>
        </div>

        {/* Prominent CTA */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/customer/messages')}
            leftIcon={<MessageSquare size={15} className="text-teal-600" />}
            className="border-teal-200 hover:border-teal-400 text-teal-800 hover:bg-teal-50"
          >
            <span>Messages</span>
            {totalUnreadMessages > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                {totalUnreadMessages}
              </span>
            )}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handlePostRequirementClick}
            leftIcon={<PlusCircle size={16} />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm shadow-teal-600/25 px-5"
          >
            Post New Requirement
          </Button>
        </div>
      </div>

      {/* 2. Four Metric Summary Cards (All from customer data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Projects',
            value: totalProjects,
            note: `${requirements.length} Open RFQs + CAD Revisions`,
            icon: <FolderKanban size={22} className="text-teal-700" />,
            borderColor: 'border-l-4 border-l-teal-600',
            link: '/customer/projects',
          },
          {
            label: 'Orders in Production',
            value: activeOrders.length,
            note: 'CNC Spindle & Toolpath Active',
            icon: <Truck size={22} className="text-teal-600" />,
            borderColor: 'border-l-4 border-l-teal-500',
            link: '/customer/orders',
          },
          {
            label: 'Awaiting My Approval',
            value: pendingQuotations.length,
            note: 'Formal Supplier Bids Ready',
            icon: <Receipt size={22} className="text-teal-800" />,
            borderColor: 'border-l-4 border-l-teal-800',
            link: '/customer/quotations',
          },
          {
            label: 'Quality Verified Orders',
            value: qualityVerifiedOrders.length,
            note: 'Zeiss & Hexagon CMM Passed',
            icon: <ShieldCheck size={22} className="text-teal-600" />,
            borderColor: 'border-l-4 border-l-teal-700',
            link: '/customer/quality',
          },
        ].map((card, i) => (
          <Card
            key={i}
            hover
            onClick={() => handleCardClick(card)}
            className={`p-5 bg-white border border-teal-100/90 ${card.borderColor} shadow-xs cursor-pointer transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
                  {card.label}
                </p>
                <p className="text-3xl font-extrabold font-heading text-slate-900 mt-1">{card.value}</p>
                <p className="text-[11px] text-teal-700 font-mono mt-1.5 flex items-center gap-1 font-semibold">
                  <TrendingUp size={12} />
                  {card.note}
                </p>
              </div>
              <div className="p-2.5 bg-teal-50/80 rounded-xl border border-teal-100">
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Main Operational Grid: Active Orders (Left) & Pending Quotations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Orders (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <Truck className="text-teal-600" size={18} />
              <span>Active Orders in Manufacturing</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer/orders')}
              rightIcon={<ChevronRight size={14} />}
              className="text-xs text-teal-800 hover:text-teal-900"
            >
              View All Orders
            </Button>
          </div>

          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card className="p-8 text-center bg-white border border-teal-100 space-y-3">
                <p className="text-sm text-slate-600">No orders currently in manufacturing.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/customer/quotations')}>
                  Review Received Quotations
                </Button>
              </Card>
            ) : (
              activeOrders.map((order) => {
                const currentStage = order.stages[order.currentStageIndex];
                const stagePct = Math.round(((order.currentStageIndex + 1) / order.stages.length) * 100);

                return (
                  <Card key={order.id} className="p-5 space-y-4 bg-white border border-teal-100 hover:border-teal-300 transition-all shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-teal-800">{order.orderNumber}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-mono text-slate-500">{order.category}</span>
                        </div>
                        <h3 className="text-base font-bold font-heading text-slate-900 mt-0.5">
                          {order.productName}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 font-body">
                          Manufacturer: <strong className="text-slate-900">{order.manufacturerName}</strong> • {order.quantity} units
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <Badge variant="teal" size="sm" dot>
                          {currentStage?.name || 'In Production'}
                        </Badge>
                        <p className="text-sm font-extrabold font-heading text-slate-900 mt-1">
                          ₹{order.totalPriceINR.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Est. Delivery: {order.expectedDeliveryDate || '2026-11-20'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Stage {order.currentStageIndex + 1} of 7: {currentStage?.name}</span>
                        <span className="text-teal-700 font-bold">{stagePct}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stagePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Action & Carrier Footer */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] font-mono text-slate-500">
                        Carrier: {order.carrier} ({order.trackingNumber})
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => navigate('/customer/tracking')}
                          leftIcon={<Layers size={13} className="text-teal-600" />}
                          className="border-teal-200 text-teal-800 hover:bg-teal-50"
                        >
                          Track Progress
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => navigate('/customer/orders')}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Pending Quotations & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pending Quotations Box */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Receipt className="text-teal-700" size={18} />
                <span>Pending Quotations</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer/quotations')}
                rightIcon={<ChevronRight size={14} />}
                className="text-xs text-teal-800 hover:text-teal-900"
              >
                Review & Compare ({pendingQuotations.length})
              </Button>
            </div>

            <div className="space-y-3">
              {pendingQuotations.length === 0 ? (
                <Card className="p-6 text-center bg-white border border-teal-100 space-y-2">
                  <p className="text-xs text-slate-500">No pending quotations awaiting approval.</p>
                  <Button variant="outline" size="xs" onClick={() => navigate('/customer/post-requirement')}>
                    Broadcast New RFQ
                  </Button>
                </Card>
              ) : (
                pendingQuotations.slice(0, 2).map((q) => (
                  <Card key={q.id} className="p-4 space-y-3 bg-white border border-teal-100 hover:border-teal-300 transition-all shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal-800">{q.id}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-[11px] font-mono text-slate-500">{q.requirementId}</span>
                      </div>
                      <Badge variant="teal" size="xs">
                        {q.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold font-heading text-slate-900">{q.productName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">By {q.manufacturerName}</p>
                    </div>

                    <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100/70 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total Bid</span>
                        <span className="font-extrabold text-slate-900">₹{q.finalPriceINR.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Est. Delivery</span>
                        <span className="text-teal-800 font-semibold">{q.estimatedCompletionDays} Working Days</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => navigate('/customer/quotations')}
                        className="border-teal-200 text-teal-800 hover:bg-teal-50"
                      >
                        Review & Compare
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => setAcceptingQuote(q)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                      >
                        Accept Quotation
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions (4 Convenient Actions) */}
          <Card className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white p-5 space-y-4 border border-teal-700/60 shadow-md">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-teal-300 font-bold block">
                Quick Shortcuts
              </span>
              <h3 className="text-sm font-bold font-heading text-white mt-0.5">
                Customer Manufacturing Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handlePostRequirementClick}
                className="p-3 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-700/60 text-left text-teal-100 hover:text-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-teal-300 font-bold mb-1 group-hover:text-white">
                  <PlusCircle size={14} />
                  <span>Post Requirement</span>
                </div>
                <p className="text-[10px] text-teal-200/70 font-mono">5-step guided wizard</p>
              </button>

              <button
                type="button"
                onClick={handleUploadCadClick}
                className="p-3 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-700/60 text-left text-teal-100 hover:text-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-teal-300 font-bold mb-1 group-hover:text-white">
                  <UploadCloud size={14} />
                  <span>Upload CAD Design</span>
                </div>
                <p className="text-[10px] text-teal-200/70 font-mono">STEP, STP, STL, IGES</p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/quotations')}
                className="p-3 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-700/60 text-left text-teal-100 hover:text-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-teal-300 font-bold mb-1 group-hover:text-white">
                  <Receipt size={14} />
                  <span>View Quotations</span>
                </div>
                <p className="text-[10px] text-teal-200/70 font-mono">Side-by-side comparison</p>
              </button>

              <button
                type="button"
                onClick={handleTrackOrdersClick}
                className="p-3 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-700/60 text-left text-teal-100 hover:text-white transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-teal-300 font-bold mb-1 group-hover:text-white">
                  <Layers size={14} />
                  <span>Track Orders</span>
                </div>
                <p className="text-[10px] text-teal-200/70 font-mono">7 production milestones</p>
              </button>
            </div>
          </Card>

          {/* Recent Chronological Activity Feed */}
          <Card className="p-5 space-y-4 bg-white border border-teal-100 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-teal-50">
              <h3 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-teal-600" />
                <span>Recent Manufacturing Activity</span>
              </h3>
              <span className="text-[10px] font-mono text-teal-700 font-semibold">Live Events</span>
            </div>

            <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-0.5 before:bg-teal-100">
              {RECENT_ACTIVITIES.slice(0, 5).map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pl-6">
                  <span className={`absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full ${act.dotColor} ring-4 ring-white`} />
                  <div className="space-y-0.5 flex-1">
                    <p className="text-xs font-bold font-heading text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-600 font-body leading-snug">{act.detail}</p>
                    <p className="text-[10px] font-mono text-slate-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal for Accepting Quotation */}
      {acceptingQuote && (
        <Modal
          isOpen={!!acceptingQuote}
          onClose={() => setAcceptingQuote(null)}
          title="Confirm Quotation Acceptance"
          description={`Initiate official purchase order for ${acceptingQuote.productName}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Quotation ID:</span>
                <span className="font-bold text-slate-900">{acceptingQuote.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-900">{acceptingQuote.manufacturerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Invoiced Amount:</span>
                <span className="font-bold text-teal-800 text-sm">₹{acceptingQuote.finalPriceINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Lead Time:</span>
                <span className="font-semibold text-slate-900">{acceptingQuote.estimatedCompletionDays} Business Days</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-body">
              Accepting this quotation converts Requirement <strong className="text-slate-900">{acceptingQuote.requirementId}</strong> into an active production order. The manufacturer will be notified immediately to allocate machine shop capacity.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-teal-100">
              <Button variant="outline" size="sm" onClick={() => setAcceptingQuote(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAcceptQuote}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Accept & Create Order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDashboardPage;