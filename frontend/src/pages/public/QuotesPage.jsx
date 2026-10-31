import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CadViewer from '../../components/cad/CadViewer';
import {
  MANUFACTURING_PROCESSES,
  RAW_MATERIALS,
  SURFACE_FINISHES,
  TOLERANCES,
} from '../../data/mockData';
import {
  Receipt,
  CheckCircle2,
  Clock,
  Truck,
  Layers,
  Cpu,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Box,
  FileCheck2,
  FileText,
  DollarSign,
  Info,
} from 'lucide-react';

export const QuotesPage = () => {
  const { cadAssets, createOrder, showToast } = useAuth();
  const navigate = useNavigate();

  // Selected CAD Model
  const [selectedAssetId, setSelectedAssetId] = useState(cadAssets[0]?.id || 'cad_001');
  const selectedAsset = cadAssets.find((a) => a.id === selectedAssetId) || cadAssets[0];

  // Configurator Options
  const [selectedProcessId, setSelectedProcessId] = useState('cnc_3axis');
  const [selectedMaterialId, setSelectedMaterialId] = useState('al_6061_t6');
  const [selectedFinishId, setSelectedFinishId] = useState('anodize_type2_orange');
  const [selectedToleranceId, setSelectedToleranceId] = useState('precision');
  const [quantity, setQuantity] = useState(25);
  const [leadTimeOption, setLeadTimeOption] = useState('standard'); // 'economy' | 'standard' | 'rush'

  // Order Confirmation Dialog state
  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  // Entities
  const selectedProcess = MANUFACTURING_PROCESSES.find((p) => p.id === selectedProcessId) || MANUFACTURING_PROCESSES[0];
  const selectedMaterial = RAW_MATERIALS.find((m) => m.id === selectedMaterialId) || RAW_MATERIALS[0];
  const selectedFinish = SURFACE_FINISHES.find((f) => f.id === selectedFinishId) || SURFACE_FINISHES[0];
  const selectedTolerance = TOLERANCES.find((t) => t.id === selectedToleranceId) || TOLERANCES[0];

  // Physics-Informed Indicative Pricing Engine
  const pricing = useMemo(() => {
    const volumeCm3 = (selectedAsset.volume_mm3 || 18450) / 1000;
    const density = selectedMaterial.density_g_cm3 || 2.70;
    const partWeightGrams = volumeCm3 * density;
    const partWeightKg = partWeightGrams / 1000;

    // 1. Raw material stock cost (with 35% machining scrap allowance)
    const rawStockKg = partWeightKg * 1.5;
    const materialCostPerUnit = Math.max(2.5, rawStockKg * (selectedMaterial.pricePerKg || 12.50));

    // 2. Machine cycle hours (volume / machining rate)
    const cycleTimeHours = Math.max(0.15, volumeCm3 / 110);
    const machineHourlyRate = selectedProcess.baseRatePerHour || 75.0;
    const baseMachiningPerUnit = cycleTimeHours * machineHourlyRate;

    // 3. One-time Setup fee amortized across quantity
    const setupFeeTotal = selectedProcess.setupFee || 45.0;
    const amortizedSetupPerUnit = setupFeeTotal / quantity;

    // 4. Surface finish & tolerance factors
    const finishMultiplier = selectedFinish.costMultiplier || 1.0;
    const toleranceMultiplier = selectedTolerance.costFactor || 1.0;

    // Base subtotal before quantity discount
    const subtotalRaw = (materialCostPerUnit + baseMachiningPerUnit) * finishMultiplier * toleranceMultiplier;

    // 5. Quantity economy of scale discount curve
    let qtyDiscountFactor = 1.0;
    if (quantity >= 500) qtyDiscountFactor = 0.58;
    else if (quantity >= 250) qtyDiscountFactor = 0.65;
    else if (quantity >= 100) qtyDiscountFactor = 0.74;
    else if (quantity >= 50) qtyDiscountFactor = 0.82;
    else if (quantity >= 25) qtyDiscountFactor = 0.88;
    else if (quantity >= 10) qtyDiscountFactor = 0.94;

    const discountedUnitBase = subtotalRaw * qtyDiscountFactor + amortizedSetupPerUnit;

    // 6. Lead time adjustment
    let leadTimeMultiplier = 1.0;
    let days = selectedProcess.leadTimeDays || 4;
    if (leadTimeOption === 'economy') {
      leadTimeMultiplier = 0.90;
      days = Math.round(days * 1.8);
    } else if (leadTimeOption === 'rush') {
      leadTimeMultiplier = 1.35;
      days = Math.max(2, Math.round(days * 0.5));
    }

    const finalUnitPrice = Math.max(5.0, discountedUnitBase * leadTimeMultiplier);
    const totalOrderPrice = finalUnitPrice * quantity;

    // Detailed breakdown items
    const breakdown = {
      materialCostTotal: (materialCostPerUnit * quantity).toFixed(2),
      machiningTotal: (baseMachiningPerUnit * qtyDiscountFactor * quantity).toFixed(2),
      setupFeeTotal: setupFeeTotal.toFixed(2),
      finishingTotal: ((finishMultiplier - 1) * subtotalRaw * quantity).toFixed(2),
      qaMetrologyTotal: (quantity * 2.20).toFixed(2),
    };

    return {
      partWeightGrams: partWeightGrams.toFixed(1),
      unitPrice: finalUnitPrice.toFixed(2),
      totalPrice: totalOrderPrice.toFixed(2),
      leadTimeDays: days,
      discountPercent: Math.round((1 - qtyDiscountFactor) * 100),
      breakdown,
    };
  }, [selectedAsset, selectedProcess, selectedMaterial, selectedFinish, selectedTolerance, quantity, leadTimeOption]);

  const handlePlaceOrder = () => {
    const orderRecord = createOrder({
      title: `Batch: ${selectedAsset.name}`,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      quantity,
      process: selectedProcess.name,
      material: selectedMaterial.name,
      surfaceFinish: selectedFinish.name,
      tolerance: selectedTolerance.name,
      unitPrice: parseFloat(pricing.unitPrice),
      totalPrice: parseFloat(pricing.totalPrice),
      estimatedDeliveryDays: pricing.leadTimeDays,
    });

    setOrderSuccessModal(orderRecord);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" dot>Instant Indicative Quoting</Badge>
            <Badge variant="teal">Physics-Informed Cost Kernel</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#F4F5F2] tracking-tight">
            Production Quotation & Order Engine
          </h1>
          <p className="mt-1 text-sm text-[#F4F5F2]/70 font-body">
            Transparent physics-based pricing calculated directly from volume, bounding envelope, toolpaths, and real raw material indices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/cad-analyzer')}
            leftIcon={<FileCheck2 size={16} />}
          >
            DFM Health Audit
          </Button>
          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/studio')}
            leftIcon={<Cpu size={16} />}
          >
            Parametric Studio
          </Button>
        </div>
      </div>

      {/* Target Asset Selector */}
      <div className="bg-[#1C2935] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-[#FF7138] font-bold flex items-center gap-2">
            <Box size={14} />
            1. Select CAD Geometry for Quotation
          </label>
          <span className="text-xs text-[#29B5A5] font-mono">100% Watertight Manifold Required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cadAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedAssetId === asset.id
                  ? 'border-[#FF7138] bg-[#FF7138]/10 text-white shadow-lg'
                  : 'border-white/10 bg-[#101820] text-[#F4F5F2]/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-heading line-clamp-1">{asset.name}</span>
                <span className="text-[10px] font-mono text-[#29B5A5]">{asset.activeRevision || 'v1.0'}</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-[#F4F5F2]/50 flex justify-between">
                <span>Vol: {(asset.volume_mm3 / 1000).toFixed(1)} cm³</span>
                <span>DFM: {asset.dfmScore || 96}/100</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Quoting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configurator Steps (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 2: Manufacturing Process */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="text-[#29B5A5] w-4 h-4" />
                2. Manufacturing Process
              </CardTitle>
              <CardDescription>
                Select production methodology based on volume, tolerances, and mechanical requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MANUFACTURING_PROCESSES.map((proc) => (
                  <button
                    key={proc.id}
                    onClick={() => setSelectedProcessId(proc.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedProcessId === proc.id
                        ? 'border-[#29B5A5] bg-[#29B5A5]/10 text-white shadow-md'
                        : 'border-white/10 bg-[#101820] text-[#F4F5F2]/70 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-heading text-[#F4F5F2]">{proc.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#29B5A5]">
                          {proc.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#F4F5F2]/50 mt-1 line-clamp-2 leading-relaxed font-body">
                        {proc.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#F4F5F2]/60">
                      <span>Tol: {proc.minTolerance}</span>
                      <span>Lead: {proc.leadTimeDays}d</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Material & Tolerance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Box className="text-[#FF7138] w-4 h-4" />
                3. Raw Material & Surface Treatment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Material Select */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#F4F5F2]/80 mb-1.5">
                    Production Material Alloy
                  </label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full bg-[#101820] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-[#F4F5F2] focus:outline-none focus:ring-2 focus:ring-[#FF7138]"
                  >
                    {RAW_MATERIALS.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name} ({mat.category}) — Density: {mat.density_g_cm3} g/cm³ — Tensile: {mat.tensileStrength_MPa} MPa
                      </option>
                    ))}
                  </select>
                </div>

                {/* Surface Finish Radio Grid */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#F4F5F2]/80 mb-1.5">
                    Surface Treatment & Anodizing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SURFACE_FINISHES.map((fin) => (
                      <button
                        key={fin.id}
                        onClick={() => setSelectedFinishId(fin.id)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                          selectedFinishId === fin.id
                            ? 'border-[#FF7138] bg-[#FF7138]/10 text-white'
                            : 'border-white/10 bg-[#101820] text-[#F4F5F2]/70 hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold">{fin.name}</div>
                        <div className="text-[10px] text-[#F4F5F2]/50 line-clamp-1 mt-0.5">{fin.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precision Tolerancing */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#F4F5F2]/80 mb-1.5">
                    Geometric Tolerance Standard
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TOLERANCES.map((tol) => (
                      <button
                        key={tol.id}
                        onClick={() => setSelectedToleranceId(tol.id)}
                        className={`p-2.5 rounded-lg border text-center text-xs transition-colors ${
                          selectedToleranceId === tol.id
                            ? 'border-[#29B5A5] bg-[#29B5A5]/10 text-white font-semibold'
                            : 'border-white/10 bg-[#101820] text-[#F4F5F2]/60 hover:text-white'
                        }`}
                      >
                        <div>{tol.name.split(' ')[0]}</div>
                        <div className="text-[10px] font-mono text-[#29B5A5] mt-0.5">{tol.tolerance}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Quantity & Lead Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="text-[#29B5A5] w-4 h-4" />
                4. Batch Volume & Delivery SLA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {/* Quantity Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#F4F5F2]/70 uppercase">Batch Quantity:</span>
                    <span className="text-lg font-bold text-[#FF7138]">{quantity} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-[#FF7138] bg-[#101820]"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex items-center justify-between pt-2">
                    {[1, 5, 25, 50, 100, 250, 500].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                          quantity === q
                            ? 'bg-[#FF7138] text-white font-bold'
                            : 'bg-[#101820] text-[#F4F5F2]/50 hover:text-[#F4F5F2]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead Time Options */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#F4F5F2]/80 mb-2">
                    Production Speed / Lead Time
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'economy', label: 'Economy', days: Math.round(selectedProcess.leadTimeDays * 1.8), badge: '-10% Price' },
                      { id: 'standard', label: 'Standard', days: selectedProcess.leadTimeDays, badge: 'Standard' },
                      { id: 'rush', label: '48h Rush Expedited', days: Math.max(2, Math.round(selectedProcess.leadTimeDays * 0.5)), badge: 'Priority Spindle' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setLeadTimeOption(opt.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          leadTimeOption === opt.id
                            ? 'border-[#FF7138] bg-[#FF7138]/10 text-white font-semibold shadow-md'
                            : 'border-white/10 bg-[#101820] text-[#F4F5F2]/60 hover:text-[#F4F5F2]'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-sm font-mono text-[#29B5A5] mt-1">{opt.days} Business Days</div>
                        <div className="text-[10px] text-[#F4F5F2]/40 mt-0.5">{opt.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Quotation Summary & Order Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Main Indicative Price Card */}
          <Card className="border-[#FF7138]/40 shadow-2xl shadow-[#FF7138]/5">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="orange" dot>Live Indicative Quote</Badge>
                <span className="text-[10px] font-mono text-[#F4F5F2]/40">Valid for 14 Days</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#F4F5F2]/50 font-mono uppercase">Unit Price:</span>
                  <div className="text-3xl font-extrabold font-heading text-[#F4F5F2]">
                    ${pricing.unitPrice}
                    <span className="text-xs font-normal text-[#F4F5F2]/40 font-body"> / pc</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#F4F5F2]/50 font-mono uppercase">Total (Excl. Tax):</span>
                  <div className="text-3xl font-extrabold font-heading text-[#FF7138]">
                    ${pricing.totalPrice}
                  </div>
                </div>
              </div>

              {pricing.discountPercent > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <TrendingDown size={14} />
                  <span>{pricing.discountPercent}% Volume Batch Discount applied ({quantity} units)</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Part Details Readout */}
              <div className="p-3 bg-[#101820] rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#F4F5F2]/70">
                  <span>Part Geometry:</span>
                  <span className="text-[#F4F5F2] font-semibold">{selectedAsset.name}</span>
                </div>
                <div className="flex justify-between text-[#F4F5F2]/70">
                  <span>Total Net Mass:</span>
                  <span className="text-[#29B5A5]">{(pricing.partWeightGrams * quantity / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-[#F4F5F2]/70">
                  <span>Guaranteed Delivery:</span>
                  <span className="text-[#FF7138]">{pricing.leadTimeDays} business days</span>
                </div>
              </div>

              {/* Transparent Physics-Informed Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#F4F5F2]/50 tracking-wider">
                  Cost Architecture Breakdown:
                </span>
                <div className="space-y-1.5 font-mono text-[#F4F5F2]/70">
                  <div className="flex justify-between">
                    <span>Raw Stock Material:</span>
                    <span>${pricing.breakdown.materialCostTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Machine Spindle Hours:</span>
                    <span>${pricing.breakdown.machiningTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tooling & CAM Setup:</span>
                    <span>${pricing.breakdown.setupFeeTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface Finishing:</span>
                    <span>${pricing.breakdown.finishingTotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Zeiss CMM Inspection:</span>
                    <span>Included</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-3 bg-[#101820]/60 rounded-lg border border-white/5 space-y-1 text-[11px] text-[#F4F5F2]/60 font-body">
                <div className="flex items-center gap-2 text-[#29B5A5]">
                  <CheckCircle2 size={14} />
                  <span>AS9100D & ISO 9001 Vetted Machine Shops Only</span>
                </div>
                <div className="flex items-center gap-2 text-[#29B5A5]">
                  <CheckCircle2 size={14} />
                  <span>Full Material Test Reports (MTR) & CoC Included</span>
                </div>
              </div>

              {/* CTA: Convert into Manufacturing Order */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={handlePlaceOrder}
                rightIcon={<ArrowRight size={18} />}
              >
                Submit Manufacturing Order (${pricing.totalPrice})
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Success & Lifecycle Launch Modal */}
      {orderSuccessModal && (
        <Modal
          isOpen={!!orderSuccessModal}
          onClose={() => setOrderSuccessModal(null)}
          title="Manufacturing Order Dispatched!"
          description={`Order #${orderSuccessModal.orderNumber} successfully routed to verified machining network.`}
        >
          <div className="space-y-5">
            <div className="p-4 bg-[#101820] rounded-xl border border-[#29B5A5]/30 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#F4F5F2]/50">Order Reference:</span>
                <span className="text-[#FF7138] font-bold">{orderSuccessModal.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F4F5F2]/50">Allocated Partner:</span>
                <span className="text-[#29B5A5]">{orderSuccessModal.manufacturer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F4F5F2]/50">Tracking Carrier:</span>
                <span className="text-[#F4F5F2]">{orderSuccessModal.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F4F5F2]/50">Batch Units:</span>
                <span className="text-[#F4F5F2]">{orderSuccessModal.quantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F4F5F2]/50">Total Committed:</span>
                <span className="text-emerald-400 font-bold">${orderSuccessModal.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-[#F4F5F2]/70 leading-relaxed font-body">
              Your order has cleared automated DFM toolpath checks and entered the manufacturer queue. You can track real-time machine spindle progress, CMM metrology reports, and dispatch tracking in your Customer Workspace.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOrderSuccessModal(null)}
              >
                Continue Quoting
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setOrderSuccessModal(null);
                  navigate('/customer/orders');
                }}
                rightIcon={<ArrowRight size={14} />}
              >
                View in Orders Tracker
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuotesPage;
