import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { Send, FileText, DollarSign, Clock, ShieldCheck, Factory } from 'lucide-react';

export const SubmitQuotationModal = ({
  isOpen,
  onClose,
  conversation,
  rfqData,
  onSubmitQuote,
}) => {
  if (!conversation) return null;

  const [finalPriceINR, setFinalPriceINR] = useState(rfqData?.budgetINR || '₹2,40,000');
  const [leadTimeDays, setLeadTimeDays] = useState('12');
  const [notes, setNotes] = useState(
    'Includes 5-axis CNC machining, hard anodized coating, and Zeiss CMM inspection certificate.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitQuote({
      conversationId: conversation.id,
      rfqId: rfqData?.rfqId || `RFQ-${Date.now()}`,
      finalPriceINR,
      leadTimeDays,
      notes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Formal Quotation Response"
      description={`Send binding price and delivery milestone commitment to ${conversation.customerName}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* RFQ Context Box */}
        <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 text-xs font-mono space-y-1">
          <div className="flex justify-between font-bold text-[#111111]">
            <span>Part: {conversation.productName}</span>
            <span className="text-[#FF7138]">{rfqData?.quantity || 50} units</span>
          </div>
          <p className="text-[11px] text-[#858585]">
            Target Material: {rfqData?.material || 'OEM Alloy'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Total Price in INR (excl. GST)"
            value={finalPriceINR}
            onChange={(e) => setFinalPriceINR(e.target.value)}
            required
            helperText="Milestone escrow terms"
          />

          <Input
            label="Lead Time (Calendar Days)"
            type="number"
            min="1"
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(e.target.value)}
            required
            helperText="From CAD sign-off to dispatch"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#858585] font-semibold">
            Manufacturer Remarks & Process Scope
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-body text-[#111111] placeholder:text-[#858585] focus:outline-none focus:border-[#FF7138] transition-colors"
            required
          />
        </div>

        <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 text-[11px] font-mono text-[#858585] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#20B8A5]">
            <ShieldCheck size={14} />
            Auto-synced to Buyer Quotes & Active Requirements
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<Send size={14} />}
          >
            Submit Formal Quote
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitQuotationModal;

