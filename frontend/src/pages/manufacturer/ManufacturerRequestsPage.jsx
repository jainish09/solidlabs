import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  ClipboardList,
  FileCheck2,
  Receipt,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  DollarSign,
  Clock,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
} from 'lucide-react';

export const ManufacturerRequestsPage = () => {
  const navigate = useNavigate();
  const { requirements, submitQuotation, showToast } = useAuth();

  // Active requirement for submitting quote modal
  const [quoteReq, setQuoteReq] = useState(null);
  // Active requirement for view details modal
  const [detailReq, setDetailReq] = useState(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    materialCost: 280000,
    manufacturingCost: 150000,
    finishingCost: 40000,
    deliveryCost: 25000,
    estimatedCompletionDays: 12,
    additionalTerms: 'Includes Zeiss CMM dimensional metrology report and standard wooden pallet crating.',
  });

  const finalCalculatedPrice =
    Number(quoteForm.materialCost) +
    Number(quoteForm.manufacturingCost) +
    Number(quoteForm.finishingCost) +
    Number(quoteForm.deliveryCost);

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    if (!quoteReq) return;

    submitQuotation({
      requirementId: quoteReq.id,
      productName: quoteReq.productName,
      category: quoteReq.category,
      quantity: quoteReq.quantity,
      material: quoteReq.material,
      materialCost: Number(quoteForm.materialCost),
      manufacturingCost: Number(quoteForm.manufacturingCost),
      finishingCost: Number(quoteForm.finishingCost),
      deliveryCost: Number(quoteForm.deliveryCost),
      finalPriceINR: finalCalculatedPrice,
      estimatedCompletionDays: Number(quoteForm.estimatedCompletionDays),
      additionalTerms: quoteForm.additionalTerms,
    });

    setQuoteReq(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Inbound RFQ Queue</Badge>
            <Badge variant="orange" size="xs">Shared Demo State</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Incoming Customer Requirements (RFQs)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#858585] font-body">
            Review customized component requirements submitted by customers and submit competitive factory quotations.
          </p>
        </div>

        <Badge variant="default" size="md">
          {requirements.length} Active RFQs
        </Badge>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requirements.map((req) => (
          <Card key={req.id} className="p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#FF7138]">{req.id}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <Badge variant="teal" size="xs">{req.category}</Badge>
                  <span className="text-xs text-[#858585] font-mono">Submitted: {req.submittedAt}</span>
                </div>

                <h3 className="text-base font-bold font-heading text-[#111111]">{req.productName}</h3>
                <p className="text-xs text-[#858585] font-body">
                  Client: <strong className="text-[#111111]">{req.customerName}</strong>
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2">
                  <div className="p-2.5 rounded-xl bg-[#F5F5F3] border border-gray-100">
                    <span className="text-[10px] text-[#858585] uppercase block">Quantity</span>
                    <span className="font-bold text-[#111111]">{req.quantity} units</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5F5F3] border border-gray-100">
                    <span className="text-[10px] text-[#858585] uppercase block">Client Budget</span>
                    <span className="font-bold text-emerald-600">{req.budgetINR}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5F5F3] border border-gray-100">
                    <span className="text-[10px] text-[#858585] uppercase block">Required Material</span>
                    <span className="font-semibold text-[#111111] truncate block">{req.material}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5F5F3] border border-gray-100">
                    <span className="text-[10px] text-[#858585] uppercase block">Target Delivery</span>
                    <span className="font-semibold text-[#FF7138]">{req.expectedDeliveryDate}</span>
                  </div>
                </div>

                {/* Additional instructions */}
                {req.additionalInstructions && (
                  <p className="text-xs text-[#858585] font-body italic pt-1">
                    "{req.additionalInstructions}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setQuoteReq(req)}
                  leftIcon={<Receipt size={14} />}
                >
                  Submit Quotation
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/manufacturer/messages')}
                  leftIcon={<MessageSquare size={14} className="text-[#FF7138]" />}
                  className="hover:border-[#FF7138]"
                >
                  Reply in Chat
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailReq(req)}
                  leftIcon={<Eye size={14} />}
                >
                  View Details
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/cad-analyzer')}
                  leftIcon={<FileCheck2 size={14} />}
                >
                  Review CAD
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Quotation Modal */}
      {quoteReq && (
        <Modal
          isOpen={!!quoteReq}
          onClose={() => setQuoteReq(null)}
          title={`Submit Formal Quotation for ${quoteReq.id}`}
          description={`Provide cost architecture breakdown for ${quoteReq.quantity} units of ${quoteReq.productName}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmitQuote} className="space-y-4">
            <div className="p-3.5 bg-[#F5F5F3] rounded-xl text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#858585]">Customer:</span>
                <span className="font-bold">{quoteReq.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Client Budget Target:</span>
                <span className="text-emerald-600 font-bold">{quoteReq.budgetINR}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#858585] mb-1">
                  1. Raw Material Stock Cost (INR)
                </label>
                <input
                  type="number"
                  value={quoteForm.materialCost}
                  onChange={(e) => setQuoteForm({ ...quoteForm, materialCost: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#858585] mb-1">
                  2. Spindle & Tooling Machining (INR)
                </label>
                <input
                  type="number"
                  value={quoteForm.manufacturingCost}
                  onChange={(e) => setQuoteForm({ ...quoteForm, manufacturingCost: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#858585] mb-1">
                  3. Surface Treatment & Anodizing (INR)
                </label>
                <input
                  type="number"
                  value={quoteForm.finishingCost}
                  onChange={(e) => setQuoteForm({ ...quoteForm, finishingCost: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#858585] mb-1">
                  4. Packaging & Freight Delivery (INR)
                </label>
                <input
                  type="number"
                  value={quoteForm.deliveryCost}
                  onChange={(e) => setQuoteForm({ ...quoteForm, deliveryCost: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#858585] mb-1">
                Estimated Lead Time (Business Days)
              </label>
              <input
                type="number"
                value={quoteForm.estimatedCompletionDays}
                onChange={(e) => setQuoteForm({ ...quoteForm, estimatedCompletionDays: Number(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#858585] mb-1">
                Additional Warranty & Inspection Terms
              </label>
              <textarea
                rows={2}
                value={quoteForm.additionalTerms}
                onChange={(e) => setQuoteForm({ ...quoteForm, additionalTerms: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* Calculated Final Price Readout */}
            <div className="p-4 bg-[#111111] text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-white/50">Final Quotation Total:</span>
                <div className="text-2xl font-black font-heading text-emerald-400">
                  ₹{finalCalculatedPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-xs font-mono text-[#20B8A5]">
                {quoteForm.estimatedCompletionDays} Days Delivery SLA
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setQuoteReq(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" rightIcon={<Send size={14} />}>
                Submit Quote to Client
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Details Modal */}
      {detailReq && (
        <Modal
          isOpen={!!detailReq}
          onClose={() => setDetailReq(null)}
          title={`RFQ Details: ${detailReq.id}`}
          description={detailReq.productName}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-[#F5F5F3] rounded-xl space-y-2">
              <div className="flex justify-between"><span>Client Organization:</span><span className="font-bold">{detailReq.customerName}</span></div>
              <div className="flex justify-between"><span>Batch Quantity:</span><span className="font-bold text-[#FF7138]">{detailReq.quantity} units</span></div>
              <div className="flex justify-between"><span>Target Budget:</span><span className="font-bold text-emerald-600">{detailReq.budgetINR}</span></div>
              <div className="flex justify-between"><span>Delivery Address:</span><span>{detailReq.deliveryLocation}</span></div>
              <div className="flex justify-between"><span>Target Deadline:</span><span>{detailReq.expectedDeliveryDate}</span></div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase text-[#858585] block font-semibold">Customized Parameters:</span>
              <pre className="p-3 bg-white border border-gray-200 rounded-xl overflow-x-auto text-[11px] text-[#111111]">
                {JSON.stringify(detailReq.customizedSpecs, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setDetailReq(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const req = detailReq;
                  setDetailReq(null);
                  setQuoteReq(req);
                }}
              >
                Quote this RFQ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManufacturerRequestsPage;

