import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Truck,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Zap,
} from 'lucide-react';
import { PRODUCTION_STAGES } from '../../data/demoState';

export const ManufacturerOrdersPage = () => {
  const { orders, updateProductionStage } = useAuth();

  const handleAdvance = (orderId, currentIdx) => {
    if (currentIdx < PRODUCTION_STAGES.length - 1) {
      updateProductionStage(orderId, currentIdx + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Shop Floor Execution</Badge>
            <Badge variant="orange" size="xs">7-Stage State Machine</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Active Production Jobs & Stage Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#858585] font-body">
            Advance jobs through CNC spindle milling, CMM metrology inspection, and freight dispatch. Updates sync instantly to customer view.
          </p>
        </div>

        <Badge variant="default" size="md">
          {orders.length} Active Batches
        </Badge>
      </div>

      {/* Orders List with Stage Advancement Controller */}
      <div className="space-y-6">
        {orders.map((order) => {
          const currentStage = order.stages[order.currentStageIndex];
          const nextStageName = order.currentStageIndex < PRODUCTION_STAGES.length - 1
            ? PRODUCTION_STAGES[order.currentStageIndex + 1]
            : null;

          return (
            <Card key={order.id} className="p-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#FF7138]">{order.orderNumber}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <Badge variant="teal" size="xs">{order.category}</Badge>
                    <span className="text-xs font-mono text-[#858585]">{order.material}</span>
                    <span className="text-xs font-mono text-emerald-600 font-bold">• ₹{order.totalPriceINR.toLocaleString('en-IN')}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-[#111111]">{order.productName}</h3>
                  <p className="text-xs text-[#858585] font-body">
                    Customer: <strong className="text-[#111111]">{order.customerName}</strong> • Quantity: <strong>{order.quantity} units</strong>
                  </p>
                </div>

                {/* Stage Advancement Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#858585]">Current Stage:</span>
                    <Badge variant={order.currentStageIndex === 6 ? 'success' : 'orange'} size="sm" dot>
                      {currentStage?.name}
                    </Badge>
                  </div>

                  {nextStageName ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAdvance(order.id, order.currentStageIndex)}
                      rightIcon={<Play size={12} className="fill-current" />}
                    >
                      Advance to: {nextStageName}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold font-mono">
                      <CheckCircle2 size={16} />
                      <span>Order Delivered & Closed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 7-Stage Stepper Buttons allowing direct jump if desired */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#858585] tracking-wider block">
                  Production Stage Timeline (Click to Update Stage):
                </span>
                <div className="grid grid-cols-7 gap-2">
                  {PRODUCTION_STAGES.map((stgName, idx) => {
                    const isPassed = idx <= order.currentStageIndex;
                    const isCurrent = idx === order.currentStageIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateProductionStage(order.id, idx)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#FF7138] bg-[#FF7138] text-white font-bold shadow-xs'
                            : isPassed
                            ? 'border-[#20B8A5] bg-[#20B8A5]/10 text-[#20B8A5] font-semibold'
                            : 'border-gray-200 bg-[#F5F5F3] text-gray-400 hover:text-gray-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono block opacity-75">{idx + 1}</span>
                        <span className="text-[10px] font-heading font-medium truncate block mt-0.5">
                          {stgName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs font-mono text-[#858585]">
                <span>Carrier: <strong className="text-[#111111]">{order.carrier}</strong> ({order.trackingNumber})</span>
                <span className="text-[#20B8A5]">Sync Status: Reflected Live in Customer Portal</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ManufacturerOrdersPage;
