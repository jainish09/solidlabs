import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  TrendingDown,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Sliders,
  Scale,
  Award,
  Calendar,
  Building,
  ChevronRight,
  Eye,
  FileText,
  Info,
} from 'lucide-react';

export const CustomerQuotesPage = () => {
  const navigate = useNavigate();
  const { quotations, acceptQuotation, rejectQuotation, showToast, getOrCreateConversationForProduct } = useAuth();

  // Active quotation for detailed view modal
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Active quotation for confirmation accept modal
  const [confirmAcceptQuote, setConfirmAcceptQuote] = useState(null);

  // Side-by-side comparison modal state
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedQuotesForCompare, setSelectedQuotesForCompare] = useState([]);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Enrich quotations with full breakdown if missing
  const enrichedQuotations = quotations.map((q, idx) => {
    const qty = q.quantity || 120;
    const total = q.finalPriceINR || 498000;
    const unitPrice = Math.round(total / qty);
    const materialCost = q.materialCost || Math.round(total * 0.55);
    const manufacturingCost = q.manufacturingCost || Math.round(total * 0.28);
    const finishingCost = q.finishingCost || Math.round(total * 0.08);
    const inspectionCost = Math.round(total * 0.04);
    const setupFee = Math.round(total * 0.05);
    const gstTax = Math.round(total * 0.18);

    return {
      ...q,
      quantity: qty,
      unitPrice,
      totalPrice: total,
      materialCost,
      manufacturingCost,
      finishingCost,
      inspectionCost,
      setupFee,
      gstTax,
      totalWithTax: total + gstTax,
      validUntil: '2026-11-20',
      isExpired: false,
      paymentTerms: '50% upon CAD lock, 50% upon CMM Metrology Pass',
      leadTimeDays: q.estimatedCompletionDays || 12,
      expectedDeliveryDate: '2026-11-22',
      capabilities: idx === 0 ? '5-Axis Trunnion CNC, Zeiss Contura CMM' : 'Dual-Stage Radial Moulding & Curing',
      certifications: idx === 0 ? ['AS9100D', 'ISO 9001:2015', 'ECE R90'] : ['ISO/TS 16949', 'BIS ISI Certified'],
      deliveryCommitment: 'Doorstep Freight Delivery via BlueDart Express with transit insurance included',
    };
  });

  const filteredQuotes = enrichedQuotations.filter((q) => {
    if (statusFilter === 'All') return true;
    return q.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleOpenComparison = () => {
    if (enrichedQuotations.length > 0) {
      setSelectedQuotesForCompare(enrichedQuotations.slice(0, 3));
      setShowComparisonModal(true);
    }
  };

  const toggleSelectForCompare = (quote) => {
    setSelectedQuotesForCompare((prev) => {
      const exists = prev.some((p) => p.id === quote.id);
      if (exists) {
        return prev.filter((p) => p.id !== quote.id);
      } else {
        if (prev.length >= 3) {
          showToast('You can compare up to 3 quotations side-by-side.', 'info');
          return prev;
        }
        return [...prev, quote];
      }
    });
  };

  const handleConfirmAccept = () => {
    if (!confirmAcceptQuote) return;
    if (confirmAcceptQuote.status === 'rejected' || confirmAcceptQuote.isExpired) {
      showToast('Cannot accept an expired or rejected quotation.', 'danger');
      return;
    }

    const newOrder = acceptQuotation(confirmAcceptQuote.id);
    setConfirmAcceptQuote(null);
    if (newOrder) {
      navigate('/customer/orders');
    }
  };

  const handleChatSupplier = (quote) => {
    const conv = getOrCreateConversationForProduct({
      id: quote.requirementId || quote.id,
      name: quote.productName,
      manufacturer: { name: quote.manufacturerName },
    });
    navigate(`/customer/messages/${conv.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Supplier Quotation Center</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Transparent Factory Cost Architecture
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Manufacturer Quotations & Cost Bids
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body max-w-2xl">
            Review detailed breakdowns of material, machining, and metrology inspection costs. Compare supplier bids side-by-side and accept quotes to initialize automated production.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {enrichedQuotations.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenComparison}
              leftIcon={<Scale size={15} className="text-teal-600" />}
              className="border-teal-200 text-teal-800 hover:bg-teal-50 font-bold"
            >
              Compare Side-by-Side
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/post-requirement')}
            leftIcon={<Receipt size={15} />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Post New RFQ
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-teal-100/70 pb-3 gap-2 flex-wrap text-xs font-mono">
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Accepted', 'Rejected'].map((st) => (
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
          Showing {filteredQuotes.length} of {enrichedQuotations.length} total quotes
        </span>
      </div>

      {/* Empty State */}
      {filteredQuotes.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-teal-100 space-y-3 rounded-2xl">
          <Receipt className="mx-auto text-teal-600/40" size={40} />
          <h3 className="text-base font-bold font-heading text-slate-900">
            No quotations received yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your submitted requirements will appear here once participating machine shops submit their transparent factory cost bids.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/post-requirement')}
            className="bg-teal-600 text-white font-bold"
          >
            Broadcast a Requirement
          </Button>
        </Card>
      ) : (
        /* Quotations List */
        <div className="space-y-6">
          {filteredQuotes.map((quote) => {
            const isComparing = selectedQuotesForCompare.some((q) => q.id === quote.id);

            return (
              <Card
                key={quote.id}
                className="p-6 space-y-5 bg-white border border-teal-100 hover:border-teal-300 transition-all shadow-xs rounded-2xl"
              >
                {/* Header Row: ID, Project, Status, Price */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-teal-50">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-mono font-bold text-teal-800">{quote.id}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <Badge
                        variant={
                          quote.status === 'accepted'
                            ? 'success'
                            : quote.status === 'rejected'
                            ? 'danger'
                            : 'teal'
                        }
                        size="xs"
                        dot={quote.status === 'pending'}
                      >
                        {quote.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        Requirement: <strong className="text-slate-700">{quote.requirementId}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-heading text-slate-900">{quote.productName}</h3>
                    <p className="text-xs text-slate-600 font-body">
                      Supplying Facility: <strong className="text-slate-900">{quote.manufacturerName}</strong>
                    </p>
                  </div>

                  {/* Price & Lead Time */}
                  <div className="text-left lg:text-right shrink-0">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                      Total Bid (Excl. 18% GST)
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                      ₹{quote.totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono text-teal-700 font-bold block mt-0.5">
                      ₹{quote.unitPrice.toLocaleString('en-IN')} / unit ({quote.quantity} units)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                      Est. Production: <strong>{quote.leadTimeDays} Working Days</strong> (Arrival: {quote.expectedDeliveryDate})
                    </span>
                  </div>
                </div>

                {/* Cost Architecture Breakdown Cards */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                    Transparent Itemized Cost Architecture
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Raw Material</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">₹{quote.materialCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-500 uppercase block">CNC Machining</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">₹{quote.manufacturingCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Surface Finish</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">₹{quote.finishingCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-500 uppercase block">Setup & Fixtures</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">₹{quote.setupFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-500 uppercase block">CMM Metrology</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">₹{quote.inspectionCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-slate-500 uppercase block">GST Tax (18%)</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">₹{quote.gstTax.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Terms Strip */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-600">
                      <strong>Payment Terms:</strong> {quote.paymentTerms}
                    </span>
                    <span className="text-slate-500">
                      Quotation Validity: <strong>{quote.validUntil}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    "{quote.additionalTerms || 'Includes Zeiss CMM metrology inspection report and anti-corrosion VCI pallet packaging.'}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSelectForCompare(quote)}
                      leftIcon={<Scale size={14} className={isComparing ? 'text-teal-700' : 'text-slate-400'} />}
                      className={`text-xs ${isComparing ? 'bg-teal-50 border-teal-400 text-teal-900 font-bold' : 'border-slate-200'}`}
                    >
                      {isComparing ? 'Selected for Compare' : 'Add to Compare'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChatSupplier(quote)}
                      leftIcon={<MessageSquare size={14} className="text-teal-600" />}
                      className="text-xs border-teal-200 text-teal-800 hover:bg-teal-50"
                    >
                      Request Clarification
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuote(quote)}
                      className="text-xs border-slate-200 text-slate-700"
                    >
                      View Details
                    </Button>

                    {quote.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectQuotation(quote.id)}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setConfirmAcceptQuote(quote)}
                          leftIcon={<CheckCircle2 size={15} />}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4"
                        >
                          Accept Quotation
                        </Button>
                      </>
                    )}

                    {quote.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/customer/orders')}
                        rightIcon={<ArrowRight size={14} />}
                        className="bg-teal-700 text-white font-bold text-xs"
                      >
                        View Order
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL: SIDE-BY-SIDE COMPARISON FEATURE */}
      {showComparisonModal && (
        <Modal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          title="Side-by-Side Quotation Comparison Matrix"
          description="Direct comparison of factory bids, per-unit economics, manufacturing capabilities, and quality credentials"
          maxWidth="max-w-5xl"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="bg-teal-50/80 border-b border-teal-200 text-slate-900">
                    <th className="p-3 w-48 font-bold">Metric / Feature</th>
                    {selectedQuotesForCompare.map((q) => (
                      <th key={q.id} className="p-3 font-bold text-teal-900">
                        <div>{q.id}</div>
                        <span className="text-[11px] font-normal text-slate-500 block truncate max-w-[200px]">
                          {q.manufacturerName}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {/* Total Cost */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Total Invoiced Cost</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 font-extrabold text-base text-slate-900">
                        ₹{q.totalPrice.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Per Unit Cost */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Per-Unit Cost</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 text-teal-800 font-bold">
                        ₹{q.unitPrice.toLocaleString('en-IN')} / unit
                      </td>
                    ))}
                  </tr>

                  {/* Lead Time */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Production Lead Time</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 font-semibold text-slate-800">
                        {q.leadTimeDays} Business Days
                      </td>
                    ))}
                  </tr>

                  {/* Raw Material Cost */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Raw Material Share</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 text-slate-600">
                        ₹{q.materialCost.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Machining Cost */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Machining & Tooling</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 text-slate-600">
                        ₹{q.manufacturingCost.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Manufacturing Capabilities */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Machine Capabilities</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 text-slate-800">
                        {q.capabilities}
                      </td>
                    ))}
                  </tr>

                  {/* Quality Credentials */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Quality Certifications</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {q.certifications.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Delivery Commitments */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Delivery Commitment</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 text-[11px] text-slate-600">
                        {q.deliveryCommitment}
                      </td>
                    ))}
                  </tr>

                  {/* Payment Terms */}
                  <tr className="hover:bg-teal-50/30">
                    <td className="p-3 font-bold text-slate-700">Payment Terms</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3 text-[11px] text-slate-600">
                        {q.paymentTerms}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr className="bg-teal-50/40">
                    <td className="p-3 font-bold text-slate-900">Decision Action</td>
                    {selectedQuotesForCompare.map((q) => (
                      <td key={q.id} className="p-3">
                        {q.status === 'pending' ? (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              setShowComparisonModal(false);
                              setConfirmAcceptQuote(q);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                          >
                            Accept Quote {q.id}
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700">
                            Status: {q.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-teal-100">
            <Button variant="outline" size="sm" onClick={() => setShowComparisonModal(false)}>
              Close Comparison
            </Button>
          </div>
        </Modal>
      )}

      {/* MODAL: VIEW QUOTATION DETAILS */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Quotation Specification — ${selectedQuote.id}`}
          description={`From ${selectedQuote.manufacturerName} for ${selectedQuote.productName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Requirement Reference:</span>
                <span className="font-bold text-slate-900">{selectedQuote.requirementId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Quantity:</span>
                <span className="font-bold text-slate-900">{selectedQuote.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Per-Unit Factory Rate:</span>
                <span className="font-bold text-teal-800">₹{selectedQuote.unitPrice.toLocaleString('en-IN')} / unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Production:</span>
                <span className="font-semibold text-slate-900">{selectedQuote.leadTimeDays} Business Days</span>
              </div>
            </div>

            {/* Detailed charges table */}
            <div className="border border-teal-100 rounded-xl overflow-hidden text-xs font-mono">
              <div className="p-2.5 bg-slate-50 border-b border-teal-100 font-bold text-slate-700">
                Itemized Cost Breakdown
              </div>
              <div className="divide-y divide-teal-50 p-3 space-y-1.5">
                <div className="flex justify-between"><span>Raw Material Ingot:</span><strong>₹{selectedQuote.materialCost.toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between"><span>5-Axis Machining Hours:</span><strong>₹{selectedQuote.manufacturingCost.toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between"><span>Surface Blasting & Anodize:</span><strong>₹{selectedQuote.finishingCost.toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between"><span>CNC Tooling & Setup:</span><strong>₹{selectedQuote.setupFee.toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between"><span>Zeiss CMM Inspection:</span><strong className="text-emerald-700">₹{selectedQuote.inspectionCost.toLocaleString('en-IN')}</strong></div>
                <div className="flex justify-between pt-1 border-t border-teal-100 text-slate-900 font-bold">
                  <span>Subtotal:</span>
                  <span>₹{selectedQuote.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Applicable GST (18%):</span>
                  <span>₹{selectedQuote.gstTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-teal-200 text-teal-900 font-extrabold text-sm">
                  <span>Grand Total (Incl. GST):</span>
                  <span>₹{selectedQuote.totalWithTax.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-mono">
              <strong>Delivery Commitment:</strong> {selectedQuote.deliveryCommitment}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-teal-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const q = selectedQuote;
                  setSelectedQuote(null);
                  handleChatSupplier(q);
                }}
                leftIcon={<MessageSquare size={14} />}
                className="border-teal-200 text-teal-800"
              >
                Discuss Terms
              </Button>
              {selectedQuote.status === 'pending' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const q = selectedQuote;
                    setSelectedQuote(null);
                    setConfirmAcceptQuote(q);
                  }}
                  className="bg-teal-600 text-white font-bold"
                >
                  Accept Quotation
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: CLEAR CONFIRMATION BEFORE ACCEPTING QUOTATION */}
      {confirmAcceptQuote && (
        <Modal
          isOpen={!!confirmAcceptQuote}
          onClose={() => setConfirmAcceptQuote(null)}
          title="Confirm Quotation Acceptance"
          description={`Commit requirement ${confirmAcceptQuote.requirementId} into live production`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Quotation ID:</span>
                <span className="font-bold text-slate-900">{confirmAcceptQuote.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Supplier:</span>
                <span className="font-bold text-slate-900">{confirmAcceptQuote.manufacturerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Purchase Value:</span>
                <span className="font-extrabold text-teal-900 text-sm">
                  ₹{confirmAcceptQuote.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lead Time Commitment:</span>
                <span className="font-bold text-slate-900">{confirmAcceptQuote.leadTimeDays} Business Days</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-body leading-relaxed">
              Confirming acceptance initializes an official purchase order and locks the component CAD revision. The manufacturer will be notified immediately to allocate machine bays and raw stock.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-teal-100">
              <Button variant="outline" size="sm" onClick={() => setConfirmAcceptQuote(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAccept}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Confirm & Create Order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerQuotesPage;