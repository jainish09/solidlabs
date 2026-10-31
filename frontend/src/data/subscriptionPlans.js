/**
 * SolidLabs Subscription & Membership Plans Configuration
 * 
 * Defines three customer tiers:
 * 1. STARTER (₹0 / Free Forever)
 * 2. PROFESSIONAL (₹2,999 / month) - Recommended
 * 3. ENTERPRISE (₹4,999 / month)
 * 
 * Strict Frontend-Only Simulation with architecture ready for future backend integration.
 */

export const PLAN_IDS = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
};

export const SUBSCRIPTION_PLANS = {
  [PLAN_IDS.STARTER]: {
    id: PLAN_IDS.STARTER,
    name: 'Starter',
    displayName: 'Starter Explorer',
    priceINR: 0,
    priceFormatted: '₹0',
    billingFrequency: 'Free Forever',
    badge: 'Free Forever',
    badgeVariant: 'secondary',
    isPopular: false,
    tagline: 'Explore the marketplace & purchase certified off-the-shelf components.',
    targetAudience: 'Hardware engineers and procurement teams evaluating standard industrial components.',
    description: 'Perfect for exploring certified automotive products, reviewing manufacturer specs, and purchasing pre-manufactured listed batches.',
    buttonText: 'Current Plan',
    buttonVariant: 'outline',
    
    // Core summary features displayed on pricing card
    features: [
      { text: 'Browse complete automotive marketplace', included: true },
      { text: 'View product specifications & technical datasheets', included: true },
      { text: 'Inspect verified manufacturer shop profiles', included: true },
      { text: 'Purchase existing listed batch products', included: true },
      { text: 'Basic customer account & order history', included: true },
      { text: 'AI Parametric Customization Studio', included: false, planRequired: 'PROFESSIONAL' },
      { text: 'Custom CAD upload (STEP, STL, IGES, OBJ)', included: false, planRequired: 'PROFESSIONAL' },
      { text: 'Automated AI DFM manufacturability analysis', included: false, planRequired: 'PROFESSIONAL' },
      { text: 'Direct manufacturer messaging & negotiations', included: false, planRequired: 'PROFESSIONAL' },
      { text: 'Custom RFQ & quotation broadcast', included: false, planRequired: 'PROFESSIONAL' },
      { text: 'Live production shopfloor stage tracking', included: false, planRequired: 'ENTERPRISE' },
      { text: 'Zeiss CMM certified quality inspection reports', included: false, planRequired: 'ENTERPRISE' },
    ],

    // Available vs Restricted feature breakdown for subscription dashboard
    availableFeatures: [
      'Browse all 18 demonstration automotive categories',
      'View mechanical tolerances, material grades & thermal thresholds',
      'Public manufacturer factory profiles and equipment rosters',
      'Wholesale ordering of pre-tooled catalog inventory',
      'Basic purchase and invoice history',
    ],
    restrictedFeatures: [
      'AI-powered dimensional and material parametric customization',
      'Custom CAD file uploads (STEP, STP, STL, IGES, OBJ)',
      'Instant Design for Manufacturability (DFM) auditing',
      'Direct real-time supplier chat & negotiation',
      'Broadcasting custom Requests for Quotation (RFQs)',
      'Stage-by-stage shopfloor production tracker',
      'Independent Zeiss CMM metrology inspection dossiers',
    ],
  },

  [PLAN_IDS.PROFESSIONAL]: {
    id: PLAN_IDS.PROFESSIONAL,
    name: 'Professional',
    displayName: 'Professional Maker',
    priceINR: 2999,
    priceFormatted: '₹2,999',
    billingFrequency: 'per month',
    badge: 'Recommended',
    badgeVariant: 'teal',
    isPopular: true,
    tagline: 'Custom engineering, AI design assistance & direct supplier communication.',
    targetAudience: 'Product designers, engineering startups & automotive tier suppliers needing bespoke parts.',
    description: 'Unlock parametric CAD customization, automated DFM validation, RFQ quotation comparisons, and direct factory negotiations.',
    buttonText: 'Upgrade to Professional',
    buttonVariant: 'primary',
    
    features: [
      { text: 'Everything in Starter included', included: true },
      { text: 'AI Parametric Customization Studio', included: true },
      { text: 'Custom CAD upload (STEP, STL, IGES, OBJ, PDF)', included: true },
      { text: 'Real-time DFM manufacturability analysis & warnings', included: true },
      { text: 'Direct manufacturer messaging (SolidLabs Connect)', included: true },
      { text: 'Submit custom manufacturing requirements (RFQs)', included: true },
      { text: 'Receive & side-by-side compare supplier quotations', included: true },
      { text: 'Manage multiple active customer engineering projects', included: true },
      { text: 'Live production shopfloor stage tracking', included: false, planRequired: 'ENTERPRISE' },
      { text: 'Zeiss CMM certified quality inspection reports', included: false, planRequired: 'ENTERPRISE' },
      { text: 'Material heat test certificates (MTR/CoC)', included: false, planRequired: 'ENTERPRISE' },
      { text: 'End-to-end priority logistics tracking', included: false, planRequired: 'ENTERPRISE' },
    ],

    availableFeatures: [
      'Complete catalog browsing and off-the-shelf purchasing',
      'AI-powered custom product builder with geometry sliders',
      'Multi-format technical CAD file upload & 3D viewport',
      'Instant DFM feedback (wall thickness, tool access, draft angles)',
      'Dedicated manufacturer chat channels with attachment support',
      '5-step guided RFQ wizard broadcasting to vetted machine shops',
      'Side-by-side quotation cost & lead-time comparison matrix',
      'Project revision tracking and CAD asset repository',
    ],
    restrictedFeatures: [
      'Real-time machine telemetry & 7-stage production tracking',
      'Authorized third-party CMM inspection dossiers',
      'Certified batch heat numbers & chemical composition certs',
      'End-to-end multi-hub priority delivery tracking',
      'Manufacturing yield and defect root-cause analytics',
    ],
  },

  [PLAN_IDS.ENTERPRISE]: {
    id: PLAN_IDS.ENTERPRISE,
    name: 'Enterprise',
    displayName: 'Enterprise OEM',
    priceINR: 4999,
    priceFormatted: '₹4,999',
    billingFrequency: 'per month',
    badge: 'Complete Visibility',
    badgeVariant: 'orange',
    isPopular: false,
    tagline: 'End-to-end manufacturing oversight, metrology QA & production analytics.',
    targetAudience: 'OEMs, defense contractors, and fleet manufacturers demanding full production transparency.',
    description: 'The complete manufacturing workspace: live stage tracking, third-party CMM inspection reports, material certificates, and dedicated priority support.',
    buttonText: 'Upgrade to Enterprise',
    buttonVariant: 'orange',
    
    features: [
      { text: 'Everything in Professional & Starter', included: true },
      { text: 'Live 7-stage production progress tracking', included: true },
      { text: 'Raw material preparation & CNC spindle telemetry', included: true },
      { text: 'Independent Zeiss Contura CMM metrology reports', included: true },
      { text: 'Batch Heat Numbers & Mill Test Certificates (MTR)', included: true },
      { text: 'Dimensional tolerance verification tables (48 features)', included: true },
      { text: 'Defect analysis & authorized partner sign-offs', included: true },
      { text: 'End-to-end BlueDart priority delivery tracking', included: true },
      { text: 'Plant capacity analytics & yield dashboard', included: true },
      { text: 'Dedicated SolidLabs manufacturing account manager', included: true },
      { text: 'AS9100D & IATF 16949 compliance document package', included: true },
      { text: 'Unlimited custom RFQ broadcasts & priority quotation SLA', included: true },
    ],

    availableFeatures: [
      'All Starter & Professional features unlocked without limits',
      'Interactive 7-stage production timeline (Material prep -> CNC -> Curing -> QA -> Dispatch)',
      'Live factory telemetry notes with operator timestamps',
      'Comprehensive Quality Assurance & metrology dossiers',
      'Downloadable PDF Inspection Certificate of Conformance',
      'Live shipping carrier tracking with dispatch checkpoints',
      'Direct line to SolidLabs partner quality auditors',
    ],
    restrictedFeatures: [],
  },
};

/**
 * Detailed Plan Comparison Matrix for the /pricing page
 */
export const COMPARISON_CATEGORIES = [
  {
    category: 'Marketplace & Discovery',
    items: [
      { feature: 'Browse 18 Automotive Categories', starter: 'Unlimited', pro: 'Unlimited', ent: 'Unlimited' },
      { feature: 'Product Datasheets & Specs', starter: 'Full Access', pro: 'Full Access', ent: 'Full Access' },
      { feature: 'Vetted Machine Shop Profiles', starter: 'Public View', pro: 'Detailed Specs', ent: 'Audited Telemetry' },
      { feature: 'Purchase Pre-Tooled Listed Inventory', starter: true, pro: true, ent: true },
      { feature: 'Wishlist & Component Bookmarking', starter: true, pro: true, ent: true },
    ],
  },
  {
    category: 'Engineering & Customization',
    items: [
      { feature: 'AI Parametric Customization Studio', starter: false, pro: true, ent: true },
      { feature: 'Custom CAD Upload (STEP, STL, IGES, OBJ)', starter: false, pro: 'Up to 50 MB', ent: 'Up to 250 MB' },
      { feature: 'Automated AI DFM Geometry Auditing', starter: false, pro: true, ent: true },
      { feature: 'Lobe, Flange & Thickness Rule Checking', starter: false, pro: true, ent: true },
      { feature: 'Alloy & Surface Finish Selector', starter: false, pro: true, ent: true },
    ],
  },
  {
    category: 'RFQ & Supplier Negotiation',
    items: [
      { feature: '5-Step Guided RFQ Submission', starter: false, pro: true, ent: true },
      { feature: 'Receive Manufacturer Quotations', starter: false, pro: true, ent: true },
      { feature: 'Side-by-Side Quotation Cost Matrix', starter: false, pro: true, ent: true },
      { feature: 'Direct Supplier Messaging & File Attachments', starter: false, pro: true, ent: true },
      { feature: 'Pre-RFQ Technical Clarification Channel', starter: false, pro: true, ent: true },
    ],
  },
  {
    category: 'Production Oversight & Quality Assurance',
    items: [
      { feature: 'Live 7-Stage Shopfloor Progress Tracker', starter: false, pro: false, ent: true },
      { feature: 'Machine Spindle Telemetry & Heat Logs', starter: false, pro: false, ent: true },
      { feature: 'Zeiss Contura CMM Dimensional Reports', starter: false, pro: false, ent: true },
      { feature: 'Mill Test Reports (MTR) & Material Heats', starter: false, pro: false, ent: true },
      { feature: 'Authorized Partner Inspection Sign-Offs', starter: false, pro: false, ent: true },
      { feature: 'BlueDart Automotive Priority Tracking', starter: false, pro: false, ent: true },
      { feature: 'Dedicated Engineering Account Manager', starter: false, pro: false, ent: true },
    ],
  },
];

/**
 * Frequently Asked Questions for the /pricing page
 */
export const PRICING_FAQS = [
  {
    question: 'How do subscription plan changes work in SolidLabs?',
    answer: 'You can upgrade or switch between plans at any time. In this platform demo, plan switches activate instantly so you can immediately test custom product creation, supplier messaging, and live factory tracking.',
  },
  {
    question: 'Can I purchase products without paying for a subscription?',
    answer: 'Yes! The Starter plan is completely free forever. You can browse the entire automotive marketplace, inspect product datasheets, view machine shop profiles, and purchase existing pre-tooled inventory with zero subscription fees.',
  },
  {
    question: 'What is the main difference between Professional and Enterprise?',
    answer: 'The Professional plan (₹2,999/mo) unlocks custom engineering: AI design customization, CAD upload, DFM feedback, RFQs, and direct supplier chat. The Enterprise plan (₹4,999/mo) adds shopfloor visibility: real-time 7-stage production tracking, certified Zeiss CMM inspection dossiers, and batch heat certificates.',
  },
  {
    question: 'Will real payments or card charges occur in this demonstration?',
    answer: 'No. This frontend implementation uses a simulated demo checkout flow designed for product demonstration and hackathon evaluation. No real payment gateways or credit card charges are processed.',
  },
  {
    question: 'Can I switch back to Starter or downgrade later?',
    answer: 'Yes, you can downgrade or switch plans anytime from the Customer Subscription page (/customer/subscription) or using the floating demo plan switcher.',
  },
];

/**
 * Preset Demo Customer Profiles for rapid testing during hackathon presentations
 */
export const DEMO_SUBSCRIPTION_ACCOUNTS = [
  {
    id: 'cust_starter',
    planId: PLAN_IDS.STARTER,
    name: 'Rohan Verma',
    company: 'Apex Auto Enthusiasts & Custom Fab',
    avatar: 'RV',
    email: 'rohan.verma@apexmobility.in',
    description: 'Free Explorer testing marketplace catalog and off-the-shelf orders.',
  },
  {
    id: 'cust_pro',
    planId: PLAN_IDS.PROFESSIONAL,
    name: 'Alex Rivera',
    company: 'AeroVeloce Automotive Systems',
    avatar: 'AR',
    email: 'alex.rivera@aeroveloce.com',
    description: 'Professional hardware engineer submitting custom RFQs & CAD designs.',
  },
  {
    id: 'cust_enterprise',
    planId: PLAN_IDS.ENTERPRISE,
    name: 'Vikram Malhotra',
    company: 'Bharat Heavy Mobility OEM Ltd.',
    avatar: 'VM',
    email: 'v.malhotra@bharatmobility.gov.in',
    description: 'Tier-1 OEM requiring live shopfloor tracking and Zeiss CMM certificates.',
  },
];

