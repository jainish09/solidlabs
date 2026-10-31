import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Star,
  ExternalLink,
  Box,
  FileText,
  Download,
  Receipt,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign,
  ChevronLeft,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ChatInput from './ChatInput';
import RequestQuotationModal from './RequestQuotationModal';
import SubmitQuotationModal from './SubmitQuotationModal';

export const ActiveChat = ({
  conversation,
  role = 'customer',
  onSendMessage,
  onSubmitQuotationResponse,
  typingInConversation,
  onBackToList,
}) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showQuoteResponseModal, setShowQuoteResponseModal] = useState(false);
  const [activeRfqForResponse, setActiveRfqForResponse] = useState(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, typingInConversation]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFA] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-teal-100 flex items-center justify-center text-teal-700 shadow-sm">
          <Box size={28} />
        </div>
        <div className="max-w-sm space-y-1">
          <h3 className="text-base font-bold font-heading text-slate-900">
            Select a Conversation
          </h3>
          <p className="text-xs text-slate-500 font-body">
            Choose a thread from the list or start a direct conversation from any product in the marketplace.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/marketplace')}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Explore Marketplace
        </Button>
      </div>
    );
  }

  const counterpartName = role === 'customer' ? conversation.manufacturerName : conversation.customerName;
  const counterpartLocation = role === 'customer' ? conversation.manufacturerLocation : conversation.customerLocation;
  const counterpartAvatar = role === 'customer' ? conversation.manufacturerLogo : (conversation.customerAvatar || 'CU');
  const isOnline = role === 'customer' ? conversation.manufacturerOnline : conversation.customerOnline;

  const handleOpenQuoteResponse = (rfqData) => {
    setActiveRfqForResponse(rfqData);
    setShowQuoteResponseModal(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFA] overflow-hidden">
      {/* 1. Chat Header */}
      <div className="p-4 bg-white border-b border-teal-100 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-teal-900 hover:bg-teal-50 transition-colors"
              title="Back to list"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-heading font-black text-xs shadow-xs border border-teal-700">
              {counterpartAvatar}
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white" />
            )}
          </div>

          {/* Supplier / Buyer Identity Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-heading text-slate-900">
                {counterpartName}
              </h3>
              <Badge variant="teal" size="xs">
                {role === 'customer' ? 'Verified Manufacturer' : 'Verified Buyer'}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-teal-600" />
                {counterpartLocation}
              </span>
              <span>•</span>
              <span className="text-teal-700 font-semibold">
                {isOnline ? 'Online now' : 'Active today'}
              </span>
              {role === 'customer' && conversation.manufacturerRating && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-slate-900 font-bold">
                    <Star size={10} className="fill-amber-500 text-amber-500" />
                    {conversation.manufacturerRating}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {role === 'customer' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRfqModal(true)}
              leftIcon={<Receipt size={14} />}
              className="hidden sm:inline-flex"
            >
              Request Quotation
            </Button>
          )}

          <Link
            to={`/products/${conversation.productId}`}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#858585] hover:text-[#111111] transition-colors"
            title="Open Product Specifications"
          >
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>

      {/* 2. Compact Product Context Card (At the top of conversation) */}
      <div className="p-3 bg-white border-b border-teal-100 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 p-2.5 bg-teal-50/50 rounded-xl border border-teal-100">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={conversation.productImage}
              alt={conversation.productName}
              className="w-12 h-12 rounded-lg object-cover border border-teal-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-teal-700 font-bold">
                  {conversation.productCategory}
                </span>
                <span className="text-[10px] text-slate-500">• Product ID: {conversation.productId}</span>
              </div>
              <h4 className="text-xs font-bold font-heading text-slate-900 truncate">
                {conversation.productName}
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-0.5">
                <span>Wholesale: <strong className="text-slate-900">{conversation.productPrice}</strong></span>
                <span>•</span>
                <span>MOQ: <strong className="text-slate-900">{conversation.productMoq} units</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate(`/products/${conversation.productId}`)}
              leftIcon={<Box size={12} />}
              className="border-teal-200 text-teal-800 hover:bg-teal-50"
            >
              View Product
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => navigate(`/customize/${conversation.productId}`)}
              leftIcon={<Sliders size={12} />}
              className="hidden sm:inline-flex border-teal-200 text-teal-900"
            >
              Studio
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-2">
          <span className="px-3 py-1 rounded-full bg-white border border-teal-100 text-[10px] font-mono uppercase text-slate-500 shadow-2xs">
            Direct Discussion Thread • All prices in INR (₹)
          </span>
        </div>

        {/* Message Items */}
        {conversation.messages.map((msg) => {
          const isFromCustomer = msg.senderRole === 'customer';
          // Does the active persona own this message bubble?
          const isSenderActiveUser = msg.senderRole === role;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSenderActiveUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 px-1">
                <span className="font-bold">{msg.senderName}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-md sm:max-w-lg rounded-2xl p-4 shadow-xs text-xs font-body leading-relaxed ${
                  isSenderActiveUser
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white border border-teal-100 text-slate-900 rounded-tl-none'
                }`}
              >
                {/* Standard Message Text */}
                {msg.text && (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Structured Formal Quotation Request Card inside Chat */}
                {msg.quotationRequest && (
                  <div
                    className={`mt-3 p-3.5 rounded-xl border text-xs font-mono space-y-2 ${
                      isSenderActiveUser
                        ? 'bg-teal-800/60 border-white/20 text-white'
                        : 'bg-teal-50/60 border-teal-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-current/20">
                      <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Receipt size={12} />
                        Formal RFQ Submission
                      </span>
                      <Badge variant="teal" size="xs">
                        {msg.quotationRequest.rfqId || 'OPEN RFQ'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="opacity-75 block text-[9px]">Requested Quantity:</span>
                        <span className="font-bold">{msg.quotationRequest.quantity} units</span>
                      </div>
                      <div>
                        <span className="opacity-75 block text-[9px]">Target Budget:</span>
                        <span className="font-bold">{msg.quotationRequest.budgetINR || 'Negotiable'}</span>
                      </div>
                      <div>
                        <span className="opacity-75 block text-[9px]">Material Spec:</span>
                        <span className="font-bold">{msg.quotationRequest.material}</span>
                      </div>
                      <div>
                        <span className="opacity-75 block text-[9px]">Timeline:</span>
                        <span className="font-bold">{msg.quotationRequest.expectedDelivery}</span>
                      </div>
                    </div>

                    {msg.quotationRequest.customizationDetails && (
                      <div className="pt-1 text-[11px]">
                        <span className="opacity-75 block text-[9px]">Custom Specs:</span>
                        <p className="font-body text-[11px] leading-tight">
                          {msg.quotationRequest.customizationDetails}
                        </p>
                      </div>
                    )}

                    {/* Action on RFQ Card */}
                    {role === 'manufacturer' && (
                      <div className="pt-2">
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleOpenQuoteResponse(msg.quotationRequest)}
                          leftIcon={<Receipt size={12} />}
                          className="w-full"
                        >
                          Submit Quotation Response
                        </Button>
                      </div>
                    )}

                    {role === 'customer' && (
                      <div className="pt-1 text-[10px] opacity-80 flex items-center gap-1">
                        <ShieldCheck size={12} />
                        <span>Registered in Customer My Requirements</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Structured Formal Quotation Response from Manufacturer */}
                {msg.formalQuote && (
                  <div className="mt-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50 text-emerald-950 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                      <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 text-emerald-800">
                        <ShieldCheck size={12} />
                        Formal Binding Quotation
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {msg.formalQuote.quoteId}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-emerald-700 block text-[9px]">Quoted Amount:</span>
                        <span className="text-base font-black text-emerald-900">{msg.formalQuote.finalPriceINR}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[9px]">Lead Time:</span>
                        <span className="font-bold">{msg.formalQuote.leadTimeDays} calendar days</span>
                      </div>
                    </div>

                    <p className="text-[11px] font-body text-emerald-800 pt-1">
                      {msg.formalQuote.notes}
                    </p>

                    {role === 'customer' && (
                      <div className="pt-2">
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => navigate('/customer/quotes')}
                          leftIcon={<CheckCheck size={12} />}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          Review & Accept Quote in Portal
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments Section */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className={`flex items-center justify-between gap-3 p-2 rounded-xl text-xs font-mono ${
                          isSenderActiveUser
                            ? 'bg-teal-900/40 text-white'
                            : 'bg-teal-50/60 text-slate-900 border border-teal-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {att.type === 'cad' && <Box size={14} className="text-teal-400 shrink-0" />}
                          {att.type === 'pdf' && <FileText size={14} className="text-red-400 shrink-0" />}
                          {att.type === 'image' && <Sparkles size={14} className="text-teal-500 shrink-0" />}
                          <span className="truncate max-w-[200px]">{att.name}</span>
                          <span className="opacity-70 text-[10px]">({att.sizeFormatted})</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Simulated download/inspection of ${att.name}`)}
                          className="p-1 hover:opacity-75 cursor-pointer"
                          title="Download attachment"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery and Read Status Indicators */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 px-1">
                {isSenderActiveUser && (
                  <span className="flex items-center gap-0.5">
                    <CheckCheck size={12} className="text-teal-600" />
                    <span>Delivered</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingInConversation === conversation.id && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-tl-none border border-teal-100 max-w-xs shadow-2xs">
            <span className="text-[11px] font-mono text-slate-500">
              {counterpartName} is typing
            </span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Chat Input Section */}
      <ChatInput
        onSendMessage={(payload) =>
          onSendMessage({
            conversationId: conversation.id,
            ...payload,
          })
        }
        onRequestQuotation={() => setShowRfqModal(true)}
        role={role}
      />

      {/* 5. Request Quotation Modal */}
      {showRfqModal && (
        <RequestQuotationModal
          isOpen={showRfqModal}
          onClose={() => setShowRfqModal(false)}
          conversation={conversation}
          onSubmitQuotationRequest={(rfqData) => {
            onSendMessage({
              conversationId: conversation.id,
              text: `We have submitted a formal quotation request for ${rfqData.quantity} units of ${conversation.productName}. Please review our target budget and delivery parameters below.`,
              quotationRequest: rfqData,
            });
          }}
        />
      )}

      {/* 6. Submit Quotation Modal (Manufacturer view) */}
      {showQuoteResponseModal && (
        <SubmitQuotationModal
          isOpen={showQuoteResponseModal}
          onClose={() => {
            setShowQuoteResponseModal(false);
            setActiveRfqForResponse(null);
          }}
          conversation={conversation}
          rfqData={activeRfqForResponse}
          onSubmitQuote={onSubmitQuotationResponse}
        />
      )}
    </div>
  );
};

export default ActiveChat;

