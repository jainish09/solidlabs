import React, { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  X,
  FileText,
  Box,
  Image as ImageIcon,
  Receipt,
  Sparkles,
} from 'lucide-react';
import Button from '../common/Button';
import { QUICK_MESSAGE_SUGGESTIONS } from '../../data/messagingData';
import { MessagingService } from '../../services/messagingService';

export const ChatInput = ({
  onSendMessage,
  onRequestQuotation,
  disabled = false,
  role = 'customer',
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage({
      text: text.trim(),
      attachments,
    });

    setText('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const processed = await Promise.all(
        files.map((file) => MessagingService.simulateAttachmentUpload(file))
      );
      setAttachments((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error('File simulation error', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleQuickSuggestion = (suggestion) => {
    setText(suggestion);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-4 space-y-3">
      {/* Quick Message Suggestions Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0 mr-1 flex items-center gap-1 font-bold">
          <Sparkles size={11} className="text-teal-600" /> Suggestions:
        </span>
        {QUICK_MESSAGE_SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickSuggestion(suggestion)}
            className="px-2.5 py-1 rounded-full bg-teal-50/60 hover:bg-teal-100 text-teal-900 border border-teal-200/80 shrink-0 transition-colors text-[11px] font-body cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Selected Attachments Tray */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-teal-50/50 rounded-xl border border-teal-100">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-teal-200 text-xs font-mono shrink-0 shadow-2xs"
            >
              {att.type === 'image' && <ImageIcon size={14} className="text-teal-600" />}
              {att.type === 'cad' && <Box size={14} className="text-teal-700" />}
              {att.type === 'pdf' && <FileText size={14} className="text-red-500" />}
              {att.type === 'document' && <FileText size={14} className="text-slate-500" />}

              <span className="max-w-[140px] truncate text-slate-900">{att.name}</span>
              <span className="text-[10px] text-slate-500">({att.sizeFormatted})</span>

              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer ml-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".step,.stp,.stl,.iges,.obj,.dxf,.pdf,image/*"
          className="hidden"
        />

        {/* Attachment Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          title="Attach CAD model, PDF drawing or image"
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-teal-50 text-slate-500 hover:text-teal-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Paperclip size={18} />
        </button>

        {/* Request Quotation Action Button (If buyer/customer) */}
        {role === 'customer' && onRequestQuotation && (
          <button
            type="button"
            onClick={onRequestQuotation}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold font-mono transition-colors cursor-pointer shrink-0"
            title="Request formal price & lead-time quote"
          >
            <Receipt size={14} />
            <span>RFQ</span>
          </button>
        )}

        {/* Message Text Input */}
        <div className="flex-1 min-w-0 relative">
          <textarea
            rows="1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              role === 'customer'
                ? 'Type message to supplier (Press Enter to send)...'
                : 'Reply to engineering client (Press Enter to send)...'
            }
            disabled={disabled}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-none max-h-32"
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          className="h-10 px-4 rounded-xl shrink-0"
        >
          <Send size={15} />
        </Button>
      </form>

      {/* Demo Notification Footnote */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#858585]">
        <span>Supports CAD (.step, .stl), PDF drawings & images</span>
        <span className="text-[#20B8A5]">Simulated local messaging demo</span>
      </div>
    </div>
  );
};

export default ChatInput;

