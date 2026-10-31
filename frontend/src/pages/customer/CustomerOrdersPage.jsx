import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';

export const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const { orders, showToast } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCmmModal, setShowCmmModal] = useState(false);

  const handleCopyTracking = (num) => {
    navigator.clipboard.writeText(num);
    showToast(`Carrier tracking ${num} copied!`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" size="xs" dot>Production Tracking</Badge>
            <Badge variant="teal" size="xs">7-Stage Manufacturing State Machine</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Active Orders & Real-Time Production Tracking
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#858585] font-body">
            Follow real-time machine cutting, Zeiss metrology inspection, and carrier freight dispatch.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/marketplace')}
        >
          Explore Catalog
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const currentStage = order.stages[order.currentStageIndex];

          return (
            <Card
              key={order.id}
              hover
              onClick={() => setSelectedOrder(order)}
              className="p-6 space-y-5 group"
            >
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#FF7138]">{order.orderNumber}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <Badge variant="teal" size="xs">{order.category}</Badge>
                    <span className="text-xs text-[#858585] font-mono">{order.material}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-[#111111] group-hover:text-[#FF7138] transition-colors">
                    {order.productName}
                  </h3>
                  <p className="text-xs text-[#858585] font-body">
                    Manufacturer: <strong className="text-[#111111]">{order.manufacturerName}</strong> • Batch: <strong>{order.quantity} pcs</strong>
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <Badge variant={order.currentStageIndex === 6 ? 'success' : 'orange'} size="sm" dot>
                    {currentStage?.name || 'In Production'}
                  </Badge>
                  <span className="text-xl sm:text-2xl font-black font-heading text-emerald-600 block mt-1">
                    ₹{order.totalPriceINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* 7-Stage Horizontal Progress Stepper */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#858585]">Lifecycle Progress:</span>
                  <span className="font-bold text-[#20B8A5]">
                    Stage {order.currentStageIndex + 1} of 7: {currentStage?.name}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {order.stages.map((stg, idx) => (
                    <div key={idx} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stg.completed
                            ? 'bg-[#20B8A5]'
                            : stg.inProgress
                            ? 'bg-[#FF7138] animate-pulse'
                            : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-mono block truncate ${
                          idx === order.currentStageIndex
                            ? 'text-[#FF7138] font-bold'
                            : stg.completed
                            ? 'text-[#20B8A5]'
                            : 'text-gray-400'
                        }`}
                      >
                        {stg.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Strip */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#858585]">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#FF7138]" />
                  <span>Carrier: <strong className="text-[#111111]">{order.carrier}</strong></span>
                  <span className="text-[#20B8A5]">({order.trackingNumber})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTracking(order.trackingNumber);
                    }}
                    className="p-1 hover:text-[#111111]"
                    title="Copy tracking number"
                  >
                    <Copy size={12} />
                  </button>
                </div>

                {order.qualityReportReady && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCmmModal(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
                  >
                    <ShieldCheck size={14} />
                    <span>View Zeiss CMM Report</span>
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* CMM Metrology Certificate Modal */}
      {showCmmModal && (
        <Modal
          isOpen={showCmmModal}
          onClose={() => setShowCmmModal(false)}
          title="Zeiss CMM Metrology Quality Certificate"
          description="High-precision coordinate measuring machine dimensional inspection report"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-[#F5F5F3] rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  100% Dimensional GD&T Conformance Passed
                </span>
                <span>AS9100D Certified</span>
              </div>
              <div className="text-[#858585] text-[11px] space-y-1 pt-1">
                <div className="flex justify-between"><span>Metrology Machine:</span><span className="text-[#111111]">Zeiss Contura CMM (0.0015 mm accuracy)</span></div>
                <div className="flex justify-between"><span>Sample Rate:</span><span className="text-[#111111]">100% Critical Feature Probing</span></div>
                <div className="flex justify-between"><span>Max Deviation:</span><span className="text-emerald-600 font-bold">+0.009 mm (Limit: ±0.050 mm)</span></div>
                <div className="flex justify-between"><span>Surface Roughness (Ra):</span><span className="text-[#111111]">1.45 µm (Pass Ra 1.6 µm)</span></div>
              </div>
            </div>

            <p className="text-xs text-[#858585] font-body">
              This certificate confirms that the machined batch satisfies all GD&T drawing callouts, material tensile specs, and deburring standards.
            </p>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setShowCmmModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
