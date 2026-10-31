import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Layers,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Calendar,
  Building,
  FileCheck2,
  Camera,
  ExternalLink,
  ChevronRight,
  Info,
  Package,
} from 'lucide-react';

// The exact 7 production tracking stages required by Section 7
const PRODUCTION_TRACKING_STAGES = [
  'Order Confirmed',
  'Engineering Review',
  'Manufacturing Started',
  'Production Completed',
  'Quality Inspection',
  'Approved & Dispatched',
  'Delivered',
];

export const CustomerTrackingPage = () => {
  const navigate = useNavigate();
  const { orders, showToast } = useAuth();

  // Active selected order for tracking
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || null);
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  // Evidence photo preview modal state
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleCopyTracking = (awb) => {
    navigator.clipboard.writeText(awb);
    showToast(`Carrier tracking ${awb} copied!`);
  };

  if (!activeOrder) {
    return (
      <Card className="p-12 text-center bg-white border border-teal-100 space-y-4 rounded-2xl">
        <Layers className="mx-auto text-teal-600/40" size={48} />
        <h3 className="text-lg font-bold font-heading text-slate-900">
          No active production orders to track.
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Production tracking becomes active once you accept a manufacturer quotation and an order is confirmed.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/customer/quotations')}
          className="bg-teal-600 text-white font-bold"
        >
          View Received Quotations
        </Button>
      </Card>
    );
  }

  // Build the 7 exact stages for the active order with operational logs and evidence
  const stageDetails = PRODUCTION_TRACKING_STAGES.map((stageName, index) => {
    const isCompleted = index < activeOrder.currentStageIndex;
    const isInProgress = index === activeOrder.currentStageIndex;
    const isPending = index > activeOrder.currentStageIndex;

    const baseTimestamps = [
      '2026-10-26 10:14 AM',
      '2026-10-27 11:30 AM',
      '2026-10-28 02:45 PM',
      '2026-10-29 05:00 PM',
      '2026-10-30 09:30 AM',
      '2026-10-31 08:00 AM',
      'Pending Expected 2026-11-02',
    ];

    const updates = [
      'Purchase Order confirmed, drawing locked to revision v1.2, advance milestone payment verified.',
      'Shop floor engineer reviewed CNC tooling paths, verified workpiece holding fixtures and Haas VF-4 envelope clearance.',
      '5-Axis CNC spindle cutting active. Aluminum 6061-T6 roughing pass complete; fine finishing pass in progress.',
      'All 80 parts deburred, ultrasonically degreased, and bead-blasted to Ra 1.2 µm satin finish.',
      'Zeiss Contura G2 CMM touch-trigger inspection executed. 48 critical features verified within ±0.015 mm.',
      'Sealed in VCI anti-corrosion barrier pouches, wooden palletized, and handed over to BlueDart Automotive Priority Freight.',
      'Consignment in transit via BlueDart Freight Express to Pune Assembly Plant. ETA on schedule.',
    ];

    const photos = [
      { caption: 'Drawing Lock Sign-off', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80' },
      { caption: 'Toolpath Simulation Log', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
      { caption: 'Haas 5-Axis Spindle In-Cut', url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80' },
      { caption: 'Bead Blasted Lot View', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80' },
      { caption: 'Zeiss CMM Contact Metrology Scan', url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=400&q=80' },
      { caption: 'BlueDart Freight Dispatch Dock', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80' },
      null,
    ];

    return {
      index: index + 1,
      name: stageName,
      status: isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending',
      timestamp: isCompleted || isInProgress ? baseTimestamps[index] : 'Pending',
      expectedDate: index >= activeOrder.currentStageIndex ? '2026-11-02' : null,
      update: updates[index],
      photo: photos[index],
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Live Production Telemetry</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              7-Stage Precision Verification
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Production Tracking
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body max-w-2xl">
            Live manufacturing progress from shop floor machine cutting through Zeiss CMM inspection and freight dispatch.
          </p>
        </div>

        {/* Order Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono uppercase text-slate-500 font-semibold shrink-0">
            Select Order:
          </label>
          <select
            value={activeOrder.id}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="h-10 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 shadow-xs"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {o.productName} ({o.stages[o.currentStageIndex]?.name || 'In Production'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Order Summary Header Card */}
      <Card className="p-6 bg-white border border-teal-100 shadow-xs rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-teal-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-800">{activeOrder.orderNumber}</span>
              <span className="text-xs text-slate-300">•</span>
              <Badge variant="teal" size="xs">{activeOrder.category}</Badge>
              <span className="text-xs font-mono text-slate-500">{activeOrder.material}</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900 mt-1">
              {activeOrder.productName}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-body">
              Manufacturer: <strong className="text-slate-900">{activeOrder.manufacturerName}</strong> • Batch Quantity: <strong>{activeOrder.quantity} units</strong>
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <Badge variant="teal" size="sm" dot>
              Stage {activeOrder.currentStageIndex + 1} of 7: {PRODUCTION_TRACKING_STAGES[activeOrder.currentStageIndex]}
            </Badge>
            <p className="text-xl font-black font-heading text-slate-900 mt-1">
              ₹{activeOrder.totalPriceINR.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] font-mono text-slate-500 block">
              Estimated Delivery: <strong>2026-11-02</strong>
            </span>
          </div>
        </div>

        {/* Carrier Freight Strip */}
        <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700">
            <Truck size={16} className="text-teal-700" />
            <span>
              Freight Carrier: <strong className="text-slate-900">{activeOrder.carrier}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>AWB: <strong className="text-teal-900">{activeOrder.trackingNumber}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleCopyTracking(activeOrder.trackingNumber)}
              leftIcon={<Copy size={12} />}
              className="border-teal-200 text-teal-800 hover:bg-teal-50"
            >
              Copy AWB
            </Button>
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 size={12} /> Transit Insurance Active
            </span>
          </div>
        </div>

        {/* Delay Notification Banner (Demonstrating accurate on-schedule operational state) */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Schedule Status:</strong> 100% on schedule. Spindle cutting and metrology completed with zero machining delays.
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
            Zero Machine Downtime
          </span>
        </div>
      </Card>

      {/* Visual 7-Stage Horizontal Stepper */}
      <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 font-semibold uppercase tracking-wider">
            7-Stage Lifecycle Progress Overview
          </span>
          <span className="text-teal-800 font-bold">
            {Math.round(((activeOrder.currentStageIndex + 1) / 7) * 100)}% Manufacturing Completed
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {stageDetails.map((stg) => (
            <div key={stg.index} className="space-y-2">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  stg.status === 'Completed'
                    ? 'bg-teal-600'
                    : stg.status === 'In Progress'
                    ? 'bg-teal-400 animate-pulse'
                    : 'bg-slate-200'
                }`}
              />
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Stage {stg.index}</span>
                <span className={`text-[11px] font-heading font-bold block truncate ${
                  stg.status === 'Completed' ? 'text-teal-900' : stg.status === 'In Progress' ? 'text-teal-600' : 'text-slate-400'
                }`}>
                  {stg.name}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block truncate mt-0.5">
                  {stg.timestamp.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed 7-Stage Chronological Interactive Timeline */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
          <Layers className="text-teal-600" size={18} />
          <span>Stage-by-Stage Operational Log & Physical Evidence</span>
        </h3>

        <div className="space-y-4 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-teal-100">
          {stageDetails.map((stage) => (
            <Card
              key={stage.index}
              className={`p-5 ml-2 pl-10 relative bg-white border transition-all ${
                stage.status === 'In Progress'
                  ? 'border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                  : stage.status === 'Completed'
                  ? 'border-teal-100 hover:border-teal-200'
                  : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Stepper Node Icon */}
              <div
                className={`absolute -left-3 top-5 w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ring-4 ring-white ${
                  stage.status === 'Completed'
                    ? 'bg-teal-600 text-white'
                    : stage.status === 'In Progress'
                    ? 'bg-teal-500 text-white animate-pulse'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {stage.status === 'Completed' ? <CheckCircle2 size={14} /> : stage.index}
              </div>

              <div className="space-y-3">
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold font-heading text-slate-900">
                      Stage {stage.index}: {stage.name}
                    </h4>
                    <Badge
                      variant={
                        stage.status === 'Completed'
                          ? 'success'
                          : stage.status === 'In Progress'
                          ? 'teal'
                          : 'default'
                      }
                      size="xs"
                      dot={stage.status === 'In Progress'}
                    >
                      {stage.status}
                    </Badge>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    {stage.timestamp}
                  </span>
                </div>

                {/* Operational Update Description */}
                <p className="text-xs text-slate-600 font-body leading-relaxed">
                  {stage.update}
                </p>

                {/* Evidence Photo / Document Attachment Thumbnail if available */}
                {stage.photo && (
                  <div className="pt-2 flex items-center gap-3">
                    <div
                      onClick={() => setPreviewPhoto(stage.photo)}
                      className="w-24 h-16 rounded-xl overflow-hidden border border-teal-200 bg-slate-100 relative group cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                    >
                      <img
                        src={stage.photo.url}
                        alt={stage.photo.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera size={14} />
                      </div>
                    </div>
                    <div className="text-xs font-mono">
                      <span className="text-[10px] text-teal-700 font-bold uppercase block">
                        Shop Floor Evidence
                      </span>
                      <p className="text-slate-800 font-semibold">{stage.photo.caption}</p>
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(stage.photo)}
                        className="text-[11px] text-teal-700 hover:underline cursor-pointer font-bold"
                      >
                        Inspect Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <Modal
          isOpen={!!previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          title={previewPhoto.caption}
          description="Shop Floor Verification Photograph"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-teal-100 h-80 bg-slate-100">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-600 font-body">
              Verified operational evidence uploaded directly by the manufacturing shop floor cell for order {activeOrder.orderNumber}.
            </p>
            <div className="flex justify-end pt-2 border-t border-teal-100">
              <Button variant="outline" size="sm" onClick={() => setPreviewPhoto(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerTrackingPage;
