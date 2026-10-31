/**
 * SolidLabs Connect - Messaging Initial Demonstration Datasets
 */

export const QUICK_MESSAGE_SUGGESTIONS = [
  'What is your minimum order quantity?',
  'Can you customize this product?',
  'What is the estimated delivery time?',
  'Can you provide bulk pricing?',
  'Can you share technical specifications?',
  'Can you provide a quotation?',
];

export const INITIAL_DEMO_CONVERSATIONS = [
  {
    id: 'conv_001',
    productId: 'prod_001',
    productName: 'TrackSpec Ceramic Composite Brake Pads',
    productImage: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80',
    productCategory: 'Automotive Brake Pads',
    productPrice: '₹1,850 - ₹4,200',
    productMoq: 150,

    // Manufacturer perspective
    manufacturerId: 'mfg_apex_01',
    manufacturerName: 'Vanguard Friction Systems Pvt. Ltd.',
    manufacturerLogo: 'VF',
    manufacturerLocation: 'Pune, Maharashtra',
    manufacturerOnline: true,
    manufacturerRating: 4.9,
    manufacturerVerified: true,

    // Customer perspective
    customerId: 'cust_01',
    customerName: 'AeroVeloce Automotive Systems (Alex Rivera)',
    customerAvatar: 'AR',
    customerLocation: 'Bengaluru, Karnataka',
    customerOnline: true,
    customerVerified: true,

    unreadCountCustomer: 0,
    unreadCountManufacturer: 1,
    lastMessageTimestamp: '10:18 AM',
    lastMessageText: 'Good morning Alex. Absolutely. We have 5-axis CNC grinding bays dedicated to custom backing plate contours...',

    messages: [
      {
        id: 'msg_001_1',
        senderRole: 'customer',
        senderName: 'Alex Rivera (AeroVeloce)',
        text: 'Hello Rajesh, we are evaluating your TrackSpec Ceramic Brake Pads for our upcoming electric SUV prototype fleet. Can you support custom chamfering on the friction pucks?',
        timestamp: '10:14 AM',
        status: 'read',
        attachments: [],
        quotationRequest: null,
      },
      {
        id: 'msg_001_2',
        senderRole: 'manufacturer',
        senderName: 'Rajesh Singhania (Vanguard Friction)',
        text: 'Good morning Alex. Absolutely. We have 5-axis CNC grinding bays dedicated to custom backing plate contours and slotted puck chamfering. For a 150-unit pilot run, we can tool this within 7 working days.',
        timestamp: '10:18 AM',
        status: 'read',
        attachments: [
          {
            id: 'att_001_1',
            name: 'Vanguard_Ceramic_Compound_Friction_Coefficients.pdf',
            sizeFormatted: '2.4 MB',
            type: 'pdf',
            extension: 'PDF',
            isSimulated: true,
          },
        ],
        quotationRequest: null,
      },
    ],
  },

  {
    id: 'conv_002',
    productId: 'prod_002',
    productName: 'AeroForged 6061-T6 Monoblock Alloy Wheels',
    productImage: '/images/veloce-forged-monoblock-wheel.jpg',
    productCategory: 'Alloy Wheels',
    productPrice: '₹18,500 - ₹34,000',
    productMoq: 40,

    manufacturerId: 'mfg_apex_02',
    manufacturerName: 'Kalyani Precision Forgings Ltd.',
    manufacturerLogo: 'KP',
    manufacturerLocation: 'Pune, Maharashtra',
    manufacturerOnline: true,
    manufacturerRating: 4.95,
    manufacturerVerified: true,

    customerId: 'cust_01',
    customerName: 'AeroVeloce Automotive Systems (Alex Rivera)',
    customerAvatar: 'AR',
    customerLocation: 'Bengaluru, Karnataka',
    customerOnline: true,
    customerVerified: true,

    unreadCountCustomer: 1,
    unreadCountManufacturer: 0,
    lastMessageTimestamp: 'Yesterday, 04:32 PM',
    lastMessageText: 'We verified the FEA spoke deflection under 1,800 kg dynamic radial load. The 6061-T6 forged billet passed with a 2.4x safety factor.',

    messages: [
      {
        id: 'msg_002_1',
        senderRole: 'customer',
        senderName: 'Alex Rivera (AeroVeloce)',
        text: 'Hi Vikram, we sent over the STEP model for the 19x9.5J rim center-bore. Can your shop handle 5x114.3 PCD with an ET+38 offset in Satin Gunmetal finish?',
        timestamp: 'Yesterday, 03:15 PM',
        status: 'read',
        attachments: [
          {
            id: 'att_002_1',
            name: 'AeroForged_Spoke_CenterBore_Rev3.step',
            sizeFormatted: '18.6 MB',
            type: 'cad',
            extension: 'STEP',
            isSimulated: true,
          },
        ],
        quotationRequest: null,
      },
      {
        id: 'msg_002_2',
        senderRole: 'manufacturer',
        senderName: 'Vikram Kalyani (Kalyani Precision)',
        text: 'We verified the FEA spoke deflection under 1,800 kg dynamic radial load. The 6061-T6 forged billet passed with a 2.4x safety factor. For 40 wheels, we can deliver in 14 calendar days.',
        timestamp: 'Yesterday, 04:32 PM',
        status: 'delivered',
        attachments: [],
        quotationRequest: null,
      },
    ],
  },

  {
    id: 'conv_003',
    productId: 'prod_013',
    productName: 'UltraVolt 800V Modular EV Battery Pack',
    productImage: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=600&q=80',
    productCategory: 'EV Battery Packs',
    productPrice: '₹4,80,000 - ₹8,50,000',
    productMoq: 5,

    manufacturerId: 'mfg_apex_03',
    manufacturerName: 'Tata Precision Energy Systems',
    manufacturerLogo: 'TP',
    manufacturerLocation: 'Pune, Maharashtra',
    manufacturerOnline: false,
    manufacturerRating: 4.88,
    manufacturerVerified: true,

    customerId: 'cust_01',
    customerName: 'AeroVeloce Automotive Systems (Alex Rivera)',
    customerAvatar: 'AR',
    customerLocation: 'Bengaluru, Karnataka',
    customerOnline: true,
    customerVerified: true,

    unreadCountCustomer: 0,
    unreadCountManufacturer: 0,
    lastMessageTimestamp: 'Oct 28',
    lastMessageText: 'The dielectric barrier between battery modules is certified to AIS-038 Rev 2 and ISO 6469-1.',

    messages: [
      {
        id: 'msg_003_1',
        senderRole: 'customer',
        senderName: 'Alex Rivera (AeroVeloce)',
        text: 'Can you confirm the liquid coolant loop compatibility with Glysantin G30 ethylene glycol at 60 kPa inlet pressure?',
        timestamp: 'Oct 28, 11:00 AM',
        status: 'read',
        attachments: [],
        quotationRequest: null,
      },
      {
        id: 'msg_003_2',
        senderRole: 'manufacturer',
        senderName: 'Dr. Suresh Rao (Tata Precision Energy)',
        text: 'The dielectric barrier between battery modules is certified to AIS-038 Rev 2 and ISO 6469-1. Coolant manifold channels are burst-pressure tested to 450 kPa. All fittings are quick-disconnect VDA standard.',
        timestamp: 'Oct 28, 02:45 PM',
        status: 'read',
        attachments: [],
        quotationRequest: null,
      },
    ],
  },

  {
    id: 'conv_support',
    productId: 'support_desk',
    productName: 'SOLIDLABS Platform & Metrology Support Desk',
    productImage: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=80',
    productCategory: 'Technical Support',
    productPrice: 'Free Service',
    productMoq: 1,

    manufacturerId: 'mfg_solidlabs_hq',
    manufacturerName: 'SOLIDLABS Engineering & Metrology Desk',
    manufacturerLogo: 'SL',
    manufacturerLocation: 'Bengaluru Metrology Hub',
    manufacturerOnline: true,
    manufacturerRating: 5.0,
    manufacturerVerified: true,

    customerId: 'cust_01',
    customerName: 'AeroVeloce Automotive Systems (Alex Rivera)',
    customerAvatar: 'AR',
    customerLocation: 'Bengaluru, Karnataka',
    customerOnline: true,
    customerVerified: true,

    unreadCountCustomer: 0,
    unreadCountManufacturer: 0,
    lastMessageTimestamp: 'Today, 09:00 AM',
    lastMessageText: 'Welcome to SOLIDLABS Connect. Our engineering concierge is available 24/7 to assist with DFM audits, CMM reports, and supplier arbitration.',

    messages: [
      {
        id: 'msg_support_1',
        senderRole: 'manufacturer',
        senderName: 'SOLIDLABS Engineering Support',
        text: 'Welcome to SOLIDLABS Connect. Our engineering concierge is available 24/7 to assist with DFM audits, CMM metrology reports, and supplier disputes.',
        timestamp: 'Today, 09:00 AM',
        status: 'read',
        attachments: [],
        quotationRequest: null,
      },
    ],
  },
];

/**
 * Intelligent simulated replies for interactive demonstration
 */
export const getSimulatedManufacturerReply = (userMessage, productName, manufacturerName) => {
  const lower = userMessage.toLowerCase();

  if (lower.includes('moq') || lower.includes('minimum order')) {
    return `Regarding minimum order quantities: Our standard production run is calibrated for cost-efficiency, but for prototyping and testing batches we can accommodate pilot runs under a fast-track tooling setup.`;
  }
  if (lower.includes('custom') || lower.includes('cad') || lower.includes('drawing')) {
    return `Yes, our CAD engineering team can modify toolpaths and dimensions according to your STEP/STL specifications. If you upload your native files, we can run full DFM verification within 24 hours.`;
  }
  if (lower.includes('delivery') || lower.includes('time') || lower.includes('lead')) {
    return `Our typical dispatch turnaround is 7 to 14 business days from CAD freeze and material allocation. For expedited requirements, our 48-hour rush spindle bay is currently active.`;
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('bulk')) {
    return `For volume quantities exceeding our standard MOQ, tier discounts of 12% to 22% apply depending on alloy raw material volatility. We provide formal GST invoices and milestone escrow payment terms.`;
  }
  if (lower.includes('quotation') || lower.includes('quote') || lower.includes('rfq')) {
    return `Please click the "Request Quotation" button above to submit your exact quantity, target material, and tolerance limits. We will review and dispatch a formal quotation within 2 business hours.`;
  }
  if (lower.includes('spec') || lower.includes('technical') || lower.includes('tolerance')) {
    return `All components are manufactured to ISO 2768-mK and certified on our Zeiss Contura coordinate-measuring machine (CMM). Full material test reports (MTR) accompany every dispatched lot.`;
  }

  return `Thank you for your message regarding ${productName}. Our engineering desk at ${manufacturerName} has received your inquiry. We are reviewing your specifications and will respond with technical details shortly.`;
};

