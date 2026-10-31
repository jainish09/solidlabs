import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
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
} from 'lucide-react';

export const CustomerQuotesPage = () => {
  const navigate = useNavigate();
  const { quotations, acceptQuotation, rejectQuotation, showToast } = useAuth();

  const handleAccept = (quoteId) => {
    const newOrder = acceptQuotation(quoteId);
    if (newOrder) {
      navigate('/customer/orders');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" size="xs" dot>Formal B2B Quotations</Badge>
            <Badge variant="teal" size="xs">Shared Demo State</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Manufacturer Quotations & Bids
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#858585] font-body">
            Compare cost architecture breakdowns, production timelines, and accept quotes to initialize automated production dispatch.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/customize/prod_001')}
        >
          Post New Requirement
        </Button>
      </div>

      {/* Quotations List */}
      <div className="space-y-6">
        {quotations.map((quote) => (
          <Card key={quote.id} className="p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#FF7138]">{quote.id}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <Badge variant={quote.status === 'accepted' ? 'success' : 'orange'} size="xs">
                    {quote.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-[#858585] font-mono">For: {quote.requirementId}</span>
                </div>
                <h3 className="text-base font-bold font-heading text-[#111111]">{quote.productName}</h3>
                <p className="text-xs text-[#858585] font-body">
                  Manufacturing Facility: <strong className="text-[#111111]">{quote.manufacturerName}</strong>
                </p>
              </div>

              {/* Price Callout */}
              <div className="text-left lg:text-right">
                <span className="text-[10px] font-mono uppercase text-[#858585] block">Final Quotation (Excl. Tax)</span>
                <span className="text-2xl sm:text-3xl font-black font-heading text-emerald-600">
                  ₹{quote.finalPriceINR.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-mono text-[#20B8A5] block mt-0.5">
                  Est. Delivery: {quote.estimatedCompletionDays} Business Days
                </span>
              </div>
            </div>

            {/* Cost Architecture Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-100">
                <span className="text-[10px] text-[#858585] uppercase block">Raw Material</span>
                <span className="font-bold text-[#111111] mt-0.5 block">₹{quote.materialCost?.toLocaleString('en-IN') || '2,80,000'}</span>
              </div>
              <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-100">
                <span className="text-[10px] text-[#858585] uppercase block">Machining & Tooling</span>
                <span className="font-bold text-[#111111] mt-0.5 block">₹{quote.manufacturingCost?.toLocaleString('en-IN') || '1,45,000'}</span>
              </div>
              <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-100">
                <span className="text-[10px] text-[#858585] uppercase block">Finishing & Coating</span>
                <span className="font-bold text-[#111111] mt-0.5 block">₹{quote.finishingCost?.toLocaleString('en-IN') || '45,000'}</span>
              </div>
              <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-100">
                <span className="text-[10px] text-[#858585] uppercase block">Freight & Delivery</span>
                <span className="font-bold text-[#111111] mt-0.5 block">₹{quote.deliveryCost?.toLocaleString('en-IN') || '28,000'}</span>
              </div>
            </div>

            {/* Terms */}
            {quote.additionalTerms && (
              <p className="text-xs text-[#858585] font-body bg-gray-50 p-3 rounded-xl border border-gray-200">
                <strong>Facility Terms:</strong> {quote.additionalTerms}
              </p>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#20B8A5]">
                <ShieldCheck size={16} />
                <span>AS9100D Audited Facility • Zeiss CMM Metrology Report Guaranteed</span>
              </div>

              {quote.status === 'pending' ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/customer/messages')}
                    leftIcon={<MessageSquare size={14} className="text-[#FF7138]" />}
                    className="hover:border-[#FF7138]"
                  >
                    Chat with Supplier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectQuotation(quote.id)}
                    leftIcon={<XCircle size={14} />}
                  >
                    Decline Quote
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAccept(quote.id)}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Accept Quote & Initiate Production
                  </Button>
                </div>
              ) : (
                <Badge variant={quote.status === 'accepted' ? 'success' : 'danger'} size="sm">
                  {quote.status === 'accepted' ? 'Order Dispatched to Factory' : 'Declined'}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerQuotesPage;
