import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { Send, FileText, DollarSign, Calendar, Sliders, Box, ShieldCheck } from 'lucide-react';

export const RequestQuotationModal = ({
  isOpen,
  onClose,
  conversation,
  onSubmitQuotationRequest,
}) => {
  if (!conversation) return null;

  const [quantity, setQuantity] = useState(conversation.productMoq || 50);
  const [material, setMaterial] = useState('Standard OEM Specification');
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [budgetINR, setBudgetINR] = useState('₹1,50,000');
  const [expectedDelivery, setExpectedDelivery] = useState('Within 14 working days');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitQuotationRequest({
      productName: conversation.productName,
      productId: conversation.productId,
      category: conversation.productCategory,
      quantity,
      material,
      customizationDetails,
      budgetINR,
      expectedDelivery,
      instructions,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Formal Quotation (RFQ)"
      description={`Submit custom technical specifications directly to ${conversation.manufacturerName}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Reference Banner */}
        <div className="flex items-center gap-3 p-3 bg-[#F5F5F3] rounded-xl border border-gray-200">
          <img
            src={conversation.productImage}
            alt={conversation.productName}
            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold font-heading text-[#111111] truncate">
              {conversation.productName}
            </h4>
            <p className="text-[10px] font-mono text-[#858585]">
              Category: {conversation.productCategory} • Supplier MOQ: {conversation.productMoq} units
            </p>
          </div>
          <Badge variant="orange" size="xs">
            {conversation.productPrice}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Required Quantity (units)"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            helperText={`Minimum batch: ${conversation.productMoq} units`}
          />

          <Input
            label="Target Budget (INR ₹)"
            value={budgetINR}
            onChange={(e) => setBudgetINR(e.target.value)}
            placeholder="e.g. ₹2,50,000"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Preferred Material / Alloy"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="e.g. AlSi10Mg Aluminum or Ti-6Al-4V"
            required
          />

          <Input
            label="Target Delivery Timeline"
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
            placeholder="e.g. 14 calendar days"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#858585] font-semibold">
            Customization & Technical Requirements
          </label>
          <textarea
            rows="3"
            value={customizationDetails}
            onChange={(e) => setCustomizationDetails(e.target.value)}
            placeholder="Specify dimensional modifications, surface finish (e.g. Ra 0.8 µm), heat treatment, or CAD tolerances..."
            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-body text-[#111111] placeholder:text-[#858585] focus:outline-none focus:border-[#FF7138] transition-colors"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#858585] font-semibold">
            Additional Quality & Packaging Instructions
          </label>
          <textarea
            rows="2"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Include Zeiss CMM certificate of conformance and vacuum desiccated packaging."
            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-body text-[#111111] placeholder:text-[#858585] focus:outline-none focus:border-[#FF7138] transition-colors"
          />
        </div>

        <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 text-[11px] font-mono text-[#858585] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#20B8A5]">
            <ShieldCheck size={14} />
            Auto-synced to My Requirements & Vendor Portal
          </span>
          <span>INR Standard</span>
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
            Dispatch RFQ to Supplier
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestQuotationModal;

