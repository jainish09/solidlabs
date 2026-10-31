/**
 * SolidLabs Connect - Messaging Service Layer
 * 
 * BOUNDARY RULE:
 * 1. Do not connect to or start the backend.
 * 2. Do not implement real API integration yet.
 * 3. Use mock frontend data and local frontend state for all demonstrations.
 * 4. Keep future API integration placeholders isolated inside frontend/src/services/.
 */

import { api } from './apiClient';

export const MessagingService = {
  /**
   * Placeholder: Fetch all conversations for current authenticated user
   * Future Backend endpoint: GET /api/v1/conversations/
   */
  getConversations: async () => {
    console.warn('[DEMO] MessagingService.getConversations: utilizing local React demo state');
    return { success: true, data: [] };
  },

  /**
   * Placeholder: Fetch message history for a conversation
   * Future Backend endpoint: GET /api/v1/conversations/:id/messages/
   */
  getMessages: async (conversationId) => {
    console.warn(`[DEMO] MessagingService.getMessages for ${conversationId}: utilizing local React demo state`);
    return { success: true, conversationId, messages: [] };
  },

  /**
   * Placeholder: Send message
   * Future Backend endpoint: POST /api/v1/conversations/:id/messages/
   */
  sendMessage: async (conversationId, messagePayload) => {
    console.warn(`[DEMO] MessagingService.sendMessage for ${conversationId}: local state dispatch`, messagePayload);
    return { success: true, id: `msg_${Date.now()}`, ...messagePayload, timestamp: new Date().toLocaleTimeString() };
  },

  /**
   * Placeholder: Request formal quotation inside chat
   * Future Backend endpoint: POST /api/v1/conversations/:id/rfq/
   */
  requestQuotation: async (conversationId, rfqPayload) => {
    console.warn(`[DEMO] MessagingService.requestQuotation for ${conversationId}:`, rfqPayload);
    return { success: true, rfqId: `RFQ-${Date.now()}`, ...rfqPayload };
  },

  /**
   * Placeholder: Submit quotation response from manufacturer
   * Future Backend endpoint: POST /api/v1/conversations/:id/quote/
   */
  submitQuotationResponse: async (conversationId, quotePayload) => {
    console.warn(`[DEMO] MessagingService.submitQuotationResponse for ${conversationId}:`, quotePayload);
    return { success: true, quoteId: `QUO-${Date.now()}`, ...quotePayload };
  },

  /**
   * Simulated attachment processor
   * Handles local file reading for demonstration preview
   */
  simulateAttachmentUpload: async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        let fileType = 'document';
        if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(fileExt)) fileType = 'image';
        else if (['step', 'stp', 'stl', 'iges', 'obj'].includes(fileExt)) fileType = 'cad';
        else if (['pdf'].includes(fileExt)) fileType = 'pdf';

        resolve({
          id: `att_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: file.name,
          sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: fileType,
          extension: fileExt.toUpperCase(),
          url: URL.createObjectURL(file),
          isSimulated: true,
        });
      }, 300);
    });
  },
};

export default MessagingService;

