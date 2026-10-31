import React, { createContext, useContext, useState, useEffect } from 'react';
import { AUTOMOTIVE_PRODUCTS } from '../data/automotiveProducts';
import {
  INITIAL_DEMO_REQUIREMENTS,
  INITIAL_DEMO_QUOTATIONS,
  INITIAL_DEMO_ORDERS,
  PRODUCTION_STAGES,
  MANUFACTURER_ANALYTICS_DATA,
} from '../data/demoState';
import {
  INITIAL_DEMO_CONVERSATIONS,
  getSimulatedManufacturerReply,
} from '../data/messagingData';

const AppContext = createContext();

export const AuthProvider = ({ children }) => {
  // Demo Role: 'customer' or 'manufacturer'
  const [role, setRole] = useState('customer');

  // Shared Demonstration State
  const [products] = useState(AUTOMOTIVE_PRODUCTS);
  const [requirements, setRequirements] = useState(INITIAL_DEMO_REQUIREMENTS);
  const [quotations, setQuotations] = useState(INITIAL_DEMO_QUOTATIONS);
  const [orders, setOrders] = useState(INITIAL_DEMO_ORDERS);
  const [wishlist, setWishlist] = useState(['prod_001', 'prod_002', 'prod_016']);
  const [toast, setToast] = useState(null);

  // SolidLabs Connect - Conversations State with LocalStorage Persistence
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('solidlabs_connect_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved conversations from localStorage', e);
    }
    return INITIAL_DEMO_CONVERSATIONS || [];
  });

  // Typing indicator simulation
  const [typingInConversation, setTypingInConversation] = useState(null);

  // Global Workspace Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('solidlabs_connect_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Could not persist conversations to localStorage', e);
    }
  }, [conversations]);

  // User Profile
  const user = {
    id: role === 'customer' ? 'cust_01' : 'mfg_apex_01',
    name: role === 'customer' ? 'Alex Rivera' : 'Rajesh Singhania',
    title: role === 'customer' ? 'Chief Engineering Officer' : 'Managing Director & Plant Head',
    organization: role === 'customer' ? 'AeroVeloce Automotive Systems' : 'Vanguard Friction Systems Pvt. Ltd.',
    email: role === 'customer' ? 'alex.rivera@aeroveloce.in' : 'rajesh.s@vanguardfriction.in',
    role,
    avatar: role === 'customer' ? 'AR' : 'RS',
    location: role === 'customer' ? 'Bengaluru, India' : 'Pune, India',
    isSampleProfile: true,
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from saved wishlist' : 'Added to customer wishlist');
      return next;
    });
  };

  // Customer posts customized requirement
  const postRequirement = (reqData) => {
    const newReq = {
      id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: user.id,
      customerName: `${user.organization} (${user.name})`,
      submittedAt: new Date().toLocaleString(),
      status: 'open',
      quotesCount: 0,
      ...reqData,
    };
    setRequirements((prev) => [newReq, ...prev]);
    showToast(`Requirement "${newReq.id}" posted successfully to manufacturers!`);
    return newReq;
  };

  // Customer edits requirement
  const editRequirement = (reqId, updatedData) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, ...updatedData } : r))
    );
    showToast(`Requirement ${reqId} updated.`);
  };

  // Customer cancels requirement
  const cancelRequirement = (reqId) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'cancelled' } : r))
    );
    showToast(`Requirement ${reqId} has been cancelled.`);
  };

  // Manufacturer submits quotation
  const submitQuotation = (quoteData) => {
    const newQuote = {
      id: `QUO-2026-${Math.floor(500 + Math.random() * 500)}`,
      manufacturerId: user.id,
      manufacturerName: `${user.organization} (Demo Profile)`,
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
      ...quoteData,
    };

    setQuotations((prev) => [newQuote, ...prev]);

    // Update requirements quotes count
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === quoteData.requirementId
          ? { ...r, status: 'quoted', quotesCount: (r.quotesCount || 0) + 1 }
          : r
      )
    );

    showToast(`Quotation ${newQuote.id} submitted to customer!`);
    return newQuote;
  };

  // Customer accepts quotation -> Creates synchronized Order
  const acceptQuotation = (quoteId) => {
    const targetQuote = quotations.find((q) => q.id === quoteId);
    if (!targetQuote) return;

    // Update quotation status
    setQuotations((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'accepted' } : q))
    );

    // Update corresponding requirement status
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === targetQuote.requirementId ? { ...r, status: 'in_production' } : r
      )
    );

    // Create synchronized order
    const newOrder = {
      id: `ORD-2026-${Math.floor(9000 + Math.random() * 1000)}`,
      orderNumber: `SL-${Math.floor(9000 + Math.random() * 1000)}`,
      productName: targetQuote.productName,
      category: targetQuote.category || 'Automotive Component',
      customerName: `${user.organization} (${user.name})`,
      manufacturerName: targetQuote.manufacturerName,
      quantity: targetQuote.quantity || 50,
      totalPriceINR: targetQuote.finalPriceINR,
      material: targetQuote.material || 'Engineered Composite Alloy',
      deliveryLocation: user.location,
      carrier: 'BlueDart Express Freight',
      trackingNumber: `BD-${Math.floor(1000 + Math.random() * 9000)}-IN`,
      currentStageIndex: 0,
      stages: PRODUCTION_STAGES.map((stageName, idx) => ({
        name: stageName,
        completed: idx === 0,
        inProgress: idx === 0,
        timestamp: idx === 0 ? new Date().toLocaleString() : 'Pending',
      })),
      qualityReportReady: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Quotation accepted! Order ${newOrder.orderNumber} initiated.`);
    return newOrder;
  };

  // Customer rejects quotation
  const rejectQuotation = (quoteId) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'rejected' } : q))
    );
    showToast('Quotation rejected.');
  };

  // Manufacturer advances production stage (0 to 6)
  const updateProductionStage = (orderId, targetStageIndex) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const resolvedIndex = Math.min(Math.max(0, targetStageIndex), PRODUCTION_STAGES.length - 1);
        const updatedStages = order.stages.map((stage, idx) => {
          if (idx < resolvedIndex) {
            return {
              ...stage,
              completed: true,
              inProgress: false,
              timestamp: stage.timestamp === 'Pending' ? new Date().toLocaleString() : stage.timestamp,
            };
          }
          if (idx === resolvedIndex) {
            return {
              ...stage,
              completed: true,
              inProgress: true,
              timestamp: new Date().toLocaleString(),
            };
          }
          return { ...stage, completed: false, inProgress: false };
        });

        return {
          ...order,
          currentStageIndex: resolvedIndex,
          stages: updatedStages,
          qualityReportReady: resolvedIndex >= 3,
        };
      })
    );

    showToast(`Production stage advanced to: ${PRODUCTION_STAGES[targetStageIndex]}`);
  };

  // ==========================================
  // SOLIDLABS CONNECT - MESSAGING METHODS
  // ==========================================

  // Total unread messages count for active role
  const totalUnreadMessages = Array.isArray(conversations)
    ? conversations.reduce((acc, conv) => {
        if (!conv) return acc;
        if (role === 'customer') return acc + (conv.unreadCountCustomer || 0);
        return acc + (conv.unreadCountManufacturer || 0);
      }, 0)
    : 0;

  // Get or create conversation for product
  const getOrCreateConversationForProduct = (product) => {
    const existing = conversations.find(
      (c) => c.productId === product.id || (c.productName === product.name && c.manufacturerName === product.manufacturer?.name)
    );

    if (existing) {
      return existing;
    }

    const newConvId = `conv_${Date.now()}`;
    const newConv = {
      id: newConvId,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      productCategory: product.category,
      productPrice: product.priceINR,
      productMoq: product.moq,

      // Manufacturer perspective
      manufacturerId: product.manufacturer?.id || `mfg_${product.id}`,
      manufacturerName: product.manufacturer?.name || 'Verified Precision Manufacturer',
      manufacturerLogo: (product.manufacturer?.name || 'VP').slice(0, 2).toUpperCase(),
      manufacturerLocation: product.manufacturer?.location || 'India',
      manufacturerOnline: true,
      manufacturerRating: product.rating || 4.9,
      manufacturerVerified: true,

      // Customer perspective
      customerId: user.id,
      customerName: `${user.organization} (${user.name})`,
      customerAvatar: user.avatar,
      customerLocation: user.location,
      customerOnline: true,
      customerVerified: true,

      unreadCountCustomer: 0,
      unreadCountManufacturer: 1,
      lastMessageTimestamp: 'Just now',
      lastMessageText: `Hello! Thank you for connecting with us regarding ${product.name}. How can our engineering team assist today?`,

      messages: [
        {
          id: `msg_init_${Date.now()}`,
          senderRole: 'manufacturer',
          senderName: product.manufacturer?.name || 'Engineering Desk',
          text: `Hello! Thank you for connecting with us regarding ${product.name}. How can our engineering team assist with your CAD dimensions, material selection, or volume batch requirements today?`,
          timestamp: 'Just now',
          status: 'delivered',
          attachments: [],
          quotationRequest: null,
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    showToast(`Conversation started with ${newConv.manufacturerName}`);
    return newConv;
  };

  // Mark conversation as read for active role
  const markConversationAsRead = (convId) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          unreadCountCustomer: role === 'customer' ? 0 : c.unreadCountCustomer,
          unreadCountManufacturer: role === 'manufacturer' ? 0 : c.unreadCountManufacturer,
        };
      })
    );
  };

  // Send message inside conversation
  const sendMessage = ({ conversationId, text, attachments = [], quotationRequest = null }) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderRole = role; // 'customer' or 'manufacturer'
    const senderName = user.name;

    const newMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderRole,
      senderName,
      text,
      timestamp,
      status: 'delivered',
      attachments,
      quotationRequest,
    };

    // If quotation request is provided, automatically register it in shared state
    let registeredRfq = null;
    if (quotationRequest) {
      registeredRfq = postRequirement({
        title: `RFQ: ${quotationRequest.productName} (${quotationRequest.quantity} units)`,
        category: quotationRequest.category || 'Automotive Component',
        targetPriceINR: quotationRequest.budgetINR || '₹2,50,000',
        moqTarget: Number(quotationRequest.quantity) || 50,
        timelineTarget: quotationRequest.expectedDelivery || '14 calendar days',
        materialPreference: quotationRequest.material || 'Standard Spec',
        specs: {
          quantity: quotationRequest.quantity,
          customizationDetails: quotationRequest.customizationDetails,
          instructions: quotationRequest.instructions,
        },
      });
      newMessage.quotationRequest.rfqId = registeredRfq.id;
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;

        return {
          ...c,
          lastMessageText: quotationRequest
            ? `[Quotation Request] ${quotationRequest.quantity} units of ${quotationRequest.productName}`
            : (text || `${attachments.length} attachment(s)`),
          lastMessageTimestamp: timestamp,
          unreadCountCustomer: senderRole === 'manufacturer' ? (c.unreadCountCustomer || 0) + 1 : c.unreadCountCustomer,
          unreadCountManufacturer: senderRole === 'customer' ? (c.unreadCountManufacturer || 0) + 1 : c.unreadCountManufacturer,
          messages: [...c.messages, newMessage],
        };
      })
    );

    // If sender is Customer, simulate intelligent response from manufacturer
    if (senderRole === 'customer') {
      const targetConv = conversations.find((c) => c.id === conversationId);
      if (targetConv) {
        setTypingInConversation(conversationId);

        setTimeout(() => {
          setTypingInConversation(null);

          let replyText = '';
          if (quotationRequest) {
            replyText = `Thank you for submitting this formal quotation request for ${quotationRequest.quantity} units of ${quotationRequest.productName}. Our production planning desk has received your specifications (Ref: ${registeredRfq?.id || 'RFQ'}). We are reviewing our machine schedule and will submit a formal quote with lead-time shortly.`;
          } else {
            replyText = getSimulatedManufacturerReply(text || '', targetConv.productName, targetConv.manufacturerName);
          }

          const autoReplyMsg = {
            id: `msg_auto_${Date.now()}`,
            senderRole: 'manufacturer',
            senderName: targetConv.manufacturerName,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
            attachments: [],
            quotationRequest: null,
            isSimulatedReply: true,
          };

          setConversations((current) =>
            current.map((c) => {
              if (c.id !== conversationId) return c;
              return {
                ...c,
                lastMessageText: replyText,
                lastMessageTimestamp: autoReplyMsg.timestamp,
                unreadCountCustomer: (c.unreadCountCustomer || 0) + 1,
                messages: [...c.messages, autoReplyMsg],
              };
            })
          );

          showToast(`New message from ${targetConv.manufacturerName}`, 'info');
        }, 1400);
      }
    }
  };

  // Manufacturer submits quotation response directly inside chat
  const submitQuotationFromChat = ({ conversationId, rfqId, finalPriceINR, leadTimeDays, notes }) => {
    const targetConv = conversations.find((c) => c.id === conversationId);
    if (!targetConv) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Register quotation in shared state
    const newQuote = submitQuotation({
      requirementId: rfqId,
      productName: targetConv.productName,
      category: targetConv.productCategory,
      finalPriceINR,
      leadTimeDays: Number(leadTimeDays) || 12,
      validUntil: '15 Days',
      material: 'Aircraft & OEM Grade Alloy',
      tolerance: '±0.015 mm Zeiss Certified',
      notes,
    });

    // Append structured quotation message card to chat
    const quoteMessage = {
      id: `msg_quote_${Date.now()}`,
      senderRole: 'manufacturer',
      senderName: user.organization,
      text: `We are pleased to submit our formal quotation for your requirement. Please review the pricing, machine tooling schedule, and delivery milestones below.`,
      timestamp,
      status: 'delivered',
      attachments: [],
      formalQuote: {
        quoteId: newQuote.id,
        rfqId,
        productName: targetConv.productName,
        finalPriceINR,
        leadTimeDays,
        validUntil: '15 Days',
        notes,
      },
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          lastMessageText: `[Formal Quote] ${finalPriceINR} • Lead Time: ${leadTimeDays} days`,
          lastMessageTimestamp: timestamp,
          unreadCountCustomer: (c.unreadCountCustomer || 0) + 1,
          messages: [...c.messages, quoteMessage],
        };
      })
    );

    showToast(`Quotation ${newQuote.id} sent directly to buyer in chat!`);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        setRole,
        products,
        requirements,
        quotations,
        orders,
        wishlist,
        toggleWishlist,
        postRequirement,
        editRequirement,
        cancelRequirement,
        submitQuotation,
        acceptQuotation,
        rejectQuotation,
        updateProductionStage,
        analyticsData: MANUFACTURER_ANALYTICS_DATA,
        showToast,

        // Workspace Sidebar Drawer
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,

        // SolidLabs Connect
        conversations,
        totalUnreadMessages,
        typingInConversation,
        getOrCreateConversationForProduct,
        markConversationAsRead,
        sendMessage,
        submitQuotationFromChat,
      }}
    >
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#111111] border border-[#FF7138]/40 shadow-2xl text-white px-5 py-3.5 rounded-xl animate-in slide-in-from-bottom-5 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7138] animate-pulse" />
          <span className="text-xs sm:text-sm font-medium font-body">{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
