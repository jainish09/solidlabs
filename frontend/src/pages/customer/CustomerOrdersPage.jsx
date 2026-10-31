import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CadViewer from '../../components/cad/CadViewer';
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
  Download,
  FileText,
  DollarSign,
  Building,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const { orders, showToast } = useAuth();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const handleCopyTracking = (num) => {
    navigator.clipboard.writeText(num);
    showToast(`Carrier tracking number ${num} copied to clipboard!`);
  };

  const handleDownloadInvoice = (order) => {
    const fakeBlob = new Blob([`SOLIDLABS TAX INVOICE\nOrder: ${order.orderNumber}\nAmount: INR ${order.totalPriceINR}\nStatus: Paid`], { type: 'text/plain' });
    const url = URL.createObjectURL(fakeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${order.orderNumber}.pdf`;
    a.click();
    showToast(`Downloaded Tax Invoice for ${order.orderNumber}`);
  };

  const handleDownloadPO = (order) => {
    const fakeBlob = new Blob([`SOLIDLABS PURCHASE ORDER\nPO Number: PO-${order.orderNumber}\nManufacturer: ${order.manufacturerName}\nQuantity: ${order.quantity}`], { type: 'text/plain' });
    const url = URL.createObjectURL(fakeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PurchaseOrder_${order.orderNumber}.pdf`;
    a.click();
    showToast(`Downloaded Purchase Order document`);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'In Production') return o.currentStageIndex >= 1 && o.currentStageIndex < 5;
    if (statusFilter === 'Dispatched') return o.currentStageIndex === 5;
    if (statusFilter === 'Completed') return o.currentStageIndex === 6;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Commercial Procurement</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {orders.length} Confirmed Orders
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            My Production Orders
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body max-w-2xl">
            Track all orders created from accepted supplier quotations, manage milestone invoices, review approved CAD revisions, and download compliance documents.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/customer/tracking')}
          leftIcon={<Layers size={15} className="text-teal-600" />}
          className="border-teal-200 text-teal-800 hover:bg-teal-50 font-bold"
        >
          Open 7-Stage Tracker
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-teal-100/70 pb-3 gap-2 flex-wrap text-xs font-mono">
        <div className="flex items-center gap-2">
          {['All', 'In Production', 'Dispatched', 'Completed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:text-teal-900 hover:bg-teal-50 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-slate-500">
          Showing {filteredOrders.length} of {orders.length} confirmed orders
        </span>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-teal-100 space-y-3 rounded-2xl">
          <Truck className="mx-auto text-teal-600/40" size={40} />
          <h3 className="text-base font-bold font-heading text-slate-900">
            Your accepted quotations will appear here once orders are confirmed.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not have any orders matching the active filter. Review your received quotations to initialize a new order.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/quotations')}
            className="bg-teal-600 text-white font-bold"
          >
            Review Received Quotations
          </Button>
        </Card>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStage = order.stages[order.currentStageIndex];
            const paymentStatus = order.currentStageIndex >= 5 ? 'Paid in Full (100%)' : '50% Advance Paid (Milestone 1)';

            return (
              <Card
                key={order.id}
                className="p-6 space-y-5 bg-white border border-teal-100 hover:border-teal-300 transition-all shadow-xs rounded-2xl"
              >
                {/* Header Row: Order Number, Category, Status, Price */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-teal-50">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-mono font-bold text-teal-800">{order.orderNumber}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <Badge variant="teal" size="xs">{order.category}</Badge>
                      <span className="text-xs font-mono text-slate-500">Project: {order.productName}</span>
                    </div>

                    <h3 className="text-base font-bold font-heading text-slate-900">{order.productName}</h3>
                    <p className="text-xs text-slate-600 font-body">
                      Manufacturing Facility: <strong className="text-slate-900">{order.manufacturerName}</strong> • Batch: <strong>{order.quantity} units</strong>
                    </p>
                  </div>

                  <div className="text-left lg:text-right shrink-0">
                    <Badge
                      variant={order.currentStageIndex === 6 ? 'success' : 'teal'}
                      size="sm"
                      dot={order.currentStageIndex < 6}
                    >
                      {currentStage?.name || 'In Production'}
                    </Badge>
                    <span className="text-2xl font-black font-heading text-slate-900 block mt-1">
                      ₹{order.totalPriceINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold block mt-0.5">
                      Payment: {paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Metadata Row */}
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Order Date:</span>
                    <span className="font-bold text-slate-800">2026-10-26</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Expected Arrival:</span>
                    <span className="font-bold text-teal-800">2026-11-20</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Carrier Tracking:</span>
                    <span className="font-bold text-slate-800">{order.carrier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Quality Status:</span>
                    <span className="font-bold text-emerald-700">
                      {order.qualityReportReady ? 'QC Passed (CMM)' : 'Pending Metrology'}
                    </span>
                  </div>
                </div>

                {/* 7-Stage Horizontal Stepper */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Current Production Milestone:</span>
                    <span className="text-teal-800 font-bold">
                      Stage {order.currentStageIndex + 1} of 7 — {currentStage?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {order.stages.map((stg, idx) => (
                      <div key={idx} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stg.completed
                              ? 'bg-teal-600'
                              : stg.inProgress
                              ? 'bg-teal-400 animate-pulse'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span className="text-[9px] font-mono text-slate-500 truncate block text-center">
                          {stg.name.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-teal-50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleCopyTracking(order.trackingNumber)}
                      leftIcon={<Copy size={12} />}
                      className="border-slate-200 text-slate-700 font-mono"
                    >
                      {order.trackingNumber}
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleDownloadInvoice(order)}
                      leftIcon={<Download size={12} />}
                      className="border-slate-200 text-slate-700"
                    >
                      Invoice PDF
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs border-teal-200 text-teal-800 hover:bg-teal-50"
                    >
                      View Order Details
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/customer/tracking')}
                      rightIcon={<ChevronRight size={14} />}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                    >
                      Track Live Production
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* FULL ORDER DETAILS MODAL (WITH ALL 10 SUBSECTIONS) */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Dossier — ${selectedOrder.orderNumber}`}
          description={`Component: ${selectedOrder.productName} • Status: ${selectedOrder.stages[selectedOrder.currentStageIndex]?.name}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* 1. Order Summary */}
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-teal-900 uppercase tracking-wider block">
                1. Order Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div><span className="text-slate-500">Order Ref:</span> <strong className="text-slate-900">{selectedOrder.orderNumber}</strong></div>
                <div><span className="text-slate-500">Quantity:</span> <strong className="text-slate-900">{selectedOrder.quantity} units</strong></div>
                <div><span className="text-slate-500">Total Value:</span> <strong className="text-teal-900">₹{selectedOrder.totalPriceINR.toLocaleString('en-IN')}</strong></div>
                <div><span className="text-slate-500">Current Stage:</span> <strong className="text-teal-800">{selectedOrder.stages[selectedOrder.currentStageIndex]?.name}</strong></div>
              </div>
            </div>

            {/* 2. Accepted Quotation Reference */}
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                2. Accepted Quotation Reference
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between">
                <span>Quotation Ref: <strong>QUO-2026-501</strong> (Accepted & Locked on 2026-10-26)</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    navigate('/customer/quotations');
                  }}
                  className="text-teal-700 hover:underline font-bold cursor-pointer"
                >
                  View Accepted Quotation
                </button>
              </div>
            </div>

            {/* 3. Approved Design Version & CAD Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                3. Approved Design Version & Locked CAD Geometry
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-7 rounded-2xl border border-teal-100 overflow-hidden bg-slate-50">
                  <CadViewer
                    preset="cylindrical_adapter"
                    height="200px"
                    showControls={true}
                    showHud={true}
                    autoRotate={true}
                    colorTheme="metal"
                  />
                </div>
                <div className="md:col-span-5 space-y-2 text-xs font-mono">
                  <div className="p-3 bg-white border border-teal-100 rounded-xl">
                    <p className="font-bold text-slate-900">Revision v1.2 (Final Locked)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Hash: sha256:88fa99c1</p>
                    <p className="text-emerald-700 font-bold mt-1">100% Watertight • Euler χ=2</p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => showToast('Exporting approved production package...')}
                    leftIcon={<Download size={13} />}
                    className="w-full border-teal-200 text-teal-800"
                  >
                    Download Production CAD Package
                  </Button>
                </div>
              </div>
            </div>

            {/* 4. Manufacturing Partner Details */}
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                4. Manufacturing Partner & Plant Location
              </h4>
              <div className="p-3 rounded-xl bg-white border border-teal-100 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">{selectedOrder.manufacturerName}</span>
                  <span className="text-emerald-700 font-bold">AS9100D Certified</span>
                </div>
                <p className="text-slate-600">Production Bay: Haas 5-Axis Milling Cell #4 • Pune Assembly Hub, Maharashtra</p>
              </div>
            </div>

            {/* 5. Payment Information & Invoicing */}
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                5. Commercial Payment Schedule & GST Details
              </h4>
              <div className="p-3 rounded-xl bg-white border border-teal-100 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Milestone 1 (50% Advance on CAD Lock):</span>
                  <strong className="text-emerald-700">Paid (₹{Math.round(selectedOrder.totalPriceINR * 0.5).toLocaleString('en-IN')})</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Milestone 2 (50% Balance on CMM Pass):</span>
                  <strong className="text-amber-700">Due on Delivery (₹{Math.round(selectedOrder.totalPriceINR * 0.5).toLocaleString('en-IN')})</strong>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-teal-50">
                  <span>GSTIN Invoiced: 29AABCU9603R1ZN</span>
                  <span>GST 18% Compliant</span>
                </div>
              </div>
            </div>

            {/* 6. Production Milestones */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                6. Production Milestones & Timeline
              </h4>
              <div className="border border-teal-100 rounded-xl divide-y divide-teal-50 text-xs font-mono">
                {selectedOrder.stages.map((stg, i) => (
                  <div key={i} className="p-2.5 bg-white flex items-center justify-between">
                    <span className="font-medium text-slate-800">Stage {i + 1}: {stg.name}</span>
                    <span className={`font-bold ${stg.completed ? 'text-teal-700' : 'text-slate-400'}`}>
                      {stg.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Inspection Requirements */}
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                7. Inspection Specifications & Metrology Protocol
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                <p>• Zeiss Contura G2 CMM touch-trigger measurement of 48 critical dimensions (ISO 2768-f).</p>
                <p>• Mitutoyo stylus surface roughness measurement ensuring Ra &lt; 0.8 µm on all milled faces.</p>
                <p>• Full material heat batch spectrometry verifying 6061-T6 tensile and yield strengths.</p>
              </div>
            </div>

            {/* 8. Quality Approval Status */}
            <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-teal-900 font-bold block">8. Quality Approval Status</span>
                <span className="text-slate-600 text-[11px]">
                  {selectedOrder.qualityReportReady ? 'Official Zeiss Metrology Certificate of Conformance available.' : 'Metrology verification scheduled upon spindle completion.'}
                </span>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={() => {
                  setSelectedOrder(null);
                  navigate('/customer/quality');
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Open Quality Reports
              </Button>
            </div>

            {/* 9. Delivery Details */}
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                9. Freight Carrier & Dispatch Tracking
              </h4>
              <div className="p-3 rounded-xl bg-white border border-teal-100 text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Carrier:</span> <strong>{selectedOrder.carrier}</strong>
                  <span className="mx-2">•</span>
                  <span className="text-slate-500">AWB Number:</span> <strong>{selectedOrder.trackingNumber}</strong>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                  leftIcon={<Copy size={12} />}
                  className="border-slate-200"
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* 10. Order Documents & Invoices */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                10. Official Order Documentation & Invoices
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="p-3 rounded-xl border border-teal-100 bg-white hover:bg-teal-50 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-teal-600" />
                    <div>
                      <p className="font-bold text-slate-900">Commercial Tax Invoice</p>
                      <span className="text-[10px] text-slate-400">PDF • Signed with GSTIN</span>
                    </div>
                  </div>
                  <Download size={14} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPO(selectedOrder)}
                  className="p-3 rounded-xl border border-teal-100 bg-white hover:bg-teal-50 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={16} className="text-teal-600" />
                    <div>
                      <p className="font-bold text-slate-900">Purchase Order (PO)</p>
                      <span className="text-[10px] text-slate-400">Official Locked Contract</span>
                    </div>
                  </div>
                  <Download size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-teal-100">
            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedOrder(null);
                navigate('/customer/tracking');
              }}
              rightIcon={<ArrowRight size={14} />}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              Track 7 Stages in Real-Time
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerOrdersPage;