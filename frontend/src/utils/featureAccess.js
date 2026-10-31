/**
 * SolidLabs Feature Access Control Utility
 * 
 * Reusable permission system controlling customer feature access based on subscription tiers.
 * Hierarchy:
 * STARTER (1) < PROFESSIONAL (2) < ENTERPRISE (3)
 */

import { PLAN_IDS, SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';

export const FEATURES = {
  // Free / Starter Features
  BROWSE_MARKETPLACE: 'browse_marketplace',
  PURCHASE_LISTED_PRODUCTS: 'purchase_listed_products',
  VIEW_MANUFACTURERS: 'view_manufacturers',
  VIEW_ORDER_HISTORY: 'view_order_history',

  // Professional Features (Requires Plan Level 2+)
  CUSTOMIZE_PRODUCTS: 'customize_products',
  AI_CUSTOMIZATION: 'ai_customization',
  UPLOAD_CAD: 'upload_cad',
  DFM_ANALYSIS: 'dfm_analysis',
  MANUFACTURER_CHAT: 'manufacturer_chat',
  SUBMIT_REQUIREMENTS: 'submit_requirements',
  COMPARE_QUOTATIONS: 'compare_quotations',
  MANAGE_PROJECTS: 'manage_projects',

  // Enterprise Features (Requires Plan Level 3)
  PRODUCTION_TRACKING: 'production_tracking',
  QUALITY_REPORTS: 'quality_reports',
  QUALITY_CERTIFICATES: 'quality_certificates',
  DELIVERY_TRACKING: 'delivery_tracking',
  PRODUCTION_ANALYTICS: 'production_analytics',
};

export const PLAN_TIERS = {
  [PLAN_IDS.STARTER]: 1,
  [PLAN_IDS.PROFESSIONAL]: 2,
  [PLAN_IDS.ENTERPRISE]: 3,
};

/**
 * Feature mapping to the minimum required plan tier
 */
export const FEATURE_REQUIRED_PLAN = {
  // Starter
  [FEATURES.BROWSE_MARKETPLACE]: PLAN_IDS.STARTER,
  [FEATURES.PURCHASE_LISTED_PRODUCTS]: PLAN_IDS.STARTER,
  [FEATURES.VIEW_MANUFACTURERS]: PLAN_IDS.STARTER,
  [FEATURES.VIEW_ORDER_HISTORY]: PLAN_IDS.STARTER,

  // Professional
  [FEATURES.CUSTOMIZE_PRODUCTS]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.AI_CUSTOMIZATION]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.UPLOAD_CAD]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.DFM_ANALYSIS]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.MANUFACTURER_CHAT]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.SUBMIT_REQUIREMENTS]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.COMPARE_QUOTATIONS]: PLAN_IDS.PROFESSIONAL,
  [FEATURES.MANAGE_PROJECTS]: PLAN_IDS.PROFESSIONAL,

  // Enterprise
  [FEATURES.PRODUCTION_TRACKING]: PLAN_IDS.ENTERPRISE,
  [FEATURES.QUALITY_REPORTS]: PLAN_IDS.ENTERPRISE,
  [FEATURES.QUALITY_CERTIFICATES]: PLAN_IDS.ENTERPRISE,
  [FEATURES.DELIVERY_TRACKING]: PLAN_IDS.ENTERPRISE,
  [FEATURES.PRODUCTION_ANALYTICS]: PLAN_IDS.ENTERPRISE,
};

/**
 * Metadata and user-facing copy for feature restriction modals & guards
 */
export const FEATURE_METADATA = {
  [FEATURES.CUSTOMIZE_PRODUCTS]: {
    name: 'AI Parametric Customization',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Build customized products, use AI-powered design assistance and configure technical dimensions to your exact vehicle specs.',
    benefits: [
      'Parametric spoke, bore and flange customization',
      'Instant alloy selection & thermal limit estimates',
      'Instant AI CAD generation and export',
    ],
  },
  [FEATURES.AI_CUSTOMIZATION]: {
    name: 'AI Customization Studio',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Modify product parameters with AI guidance, calculate volume shifts, and verify tolerance conformance in real time.',
    benefits: [
      'AI assistant for material and tolerance selection',
      'Real-time weight and mass optimization',
      'Automated technical specification sheets',
    ],
  },
  [FEATURES.UPLOAD_CAD]: {
    name: 'Technical CAD Upload & 3D Viewport',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Upload your STEP, STL, IGES, or technical drawings directly to get instant manufacturability audits.',
    benefits: [
      'Support for 3D engineering formats up to 50 MB',
      'Interactive WebGL 3D inspection viewport',
      'Automated bounding box & volume calculations',
    ],
  },
  [FEATURES.DFM_ANALYSIS]: {
    name: 'AI DFM Manufacturability Auditing',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Detect thin walls, deep pockets, and tight radiuses before committing capital to machining.',
    benefits: [
      'Identify wall thickness and geometric risks',
      'Process recommendations (CNC 3-Axis vs 5-Axis vs Additive)',
      'Suggested design changes to minimize machining cycle time',
    ],
  },
  [FEATURES.MANUFACTURER_CHAT]: {
    name: 'Direct Manufacturer Messaging',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Connect directly with verified machine shop estimators, discuss drawings, and negotiate custom quotations.',
    benefits: [
      'Encrypted supplier-customer communication channels',
      'Attach CAD revisions and technical drawings directly',
      'Negotiate terms and delivery schedules in real time',
    ],
  },
  [FEATURES.SUBMIT_REQUIREMENTS]: {
    name: 'Post Custom Manufacturing Requirement',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Broadcast your 5-step engineering requirement to qualified CNC, casting, and forging partners across India.',
    benefits: [
      'Guided RFQ wizard with automated CAD attachment',
      'Targeted matching with verified AS9100D machine shops',
      'Receive competitive quotations within 24 to 48 hours',
    ],
  },
  [FEATURES.COMPARE_QUOTATIONS]: {
    name: 'Quotation Comparison & Acceptance',
    targetPlan: PLAN_IDS.PROFESSIONAL,
    headline: 'Unlock Your Manufacturing Potential.',
    description: 'Review unit rates, setup charges, and delivery commitments across multiple machine shops in one view.',
    benefits: [
      'Side-by-side cost breakdown matrix',
      'Filter by lead time, supplier rating, and certifications',
      '1-click quotation acceptance & order generation',
    ],
  },
  [FEATURES.PRODUCTION_TRACKING]: {
    name: 'Live 7-Stage Production Tracking',
    targetPlan: PLAN_IDS.ENTERPRISE,
    headline: 'Get Complete Manufacturing Visibility.',
    description: 'Track shopfloor execution in real time: raw material preparation, CNC milling, heat treatment, and dispatch checkpoints.',
    benefits: [
      'Live factory spindle telemetry & shift progress',
      'Operator logs with heat numbers and timestamps',
      'Predictive delivery dates based on machine throughput',
    ],
  },
  [FEATURES.QUALITY_REPORTS]: {
    name: 'Zeiss CMM Quality Inspection Reports',
    targetPlan: PLAN_IDS.ENTERPRISE,
    headline: 'Get Complete Manufacturing Visibility.',
    description: 'Inspect dimensional inspection dossiers conducted by independent NABL-accredited metrology partners.',
    benefits: [
      '48-point coordinate measurement machine (CMM) data',
      'Certified batch heat numbers & raw material MTRs',
      'Downloadable PDF Certificate of Conformance (CoC)',
    ],
  },
  [FEATURES.QUALITY_CERTIFICATES]: {
    name: 'Quality & Material Certification Documents',
    targetPlan: PLAN_IDS.ENTERPRISE,
    headline: 'Get Complete Manufacturing Visibility.',
    description: 'Access formal ISO/IEC 17025 inspection certificates, ultrasonic defect scans, and metallurgical test sheets.',
    benefits: [
      'Batch traceability for automotive and aerospace audits',
      'Surface roughness (Ra) profilometer verification',
      'Signed compliance releases from certified auditors',
    ],
  },
  [FEATURES.DELIVERY_TRACKING]: {
    name: 'End-to-End Delivery Tracking',
    targetPlan: PLAN_IDS.ENTERPRISE,
    headline: 'Get Complete Manufacturing Visibility.',
    description: 'Monitor cargo logistics, air waybills, and dispatch checkpoints from factory gate to assembly hub.',
    benefits: [
      'Integrated BlueDart / priority logistics tracking',
      'Real-time GPS status and delivery milestone alerts',
      'Proof-of-delivery signatures and pallet barcodes',
    ],
  },
};

/**
 * Checks whether the current plan has access to a specific feature.
 *
 * @param {string} feature - Feature identifier from FEATURES
 * @param {string} currentPlan - Plan identifier from PLAN_IDS
 * @returns {boolean} - true if user has sufficient plan level
 */
export const hasFeatureAccess = (feature, currentPlan = PLAN_IDS.STARTER) => {
  const normalizedPlan = (currentPlan || PLAN_IDS.STARTER).toUpperCase();
  const userTier = PLAN_TIERS[normalizedPlan] || 1;

  const requiredPlan = FEATURE_REQUIRED_PLAN[feature];
  if (!requiredPlan) {
    // If feature not strictly restricted, default to allowed
    return true;
  }

  const requiredTier = PLAN_TIERS[requiredPlan] || 1;
  return userTier >= requiredTier;
};

/**
 * Returns the required plan for a feature.
 */
export const getRequiredPlanForFeature = (feature) => {
  return FEATURE_REQUIRED_PLAN[feature] || PLAN_IDS.STARTER;
};

/**
 * Returns rich modal/guard copy for a feature.
 */
export const getFeatureMetadata = (feature) => {
  return FEATURE_METADATA[feature] || {
    name: 'Premium Manufacturing Feature',
    targetPlan: getRequiredPlanForFeature(feature),
    headline: 'Upgrade Your Subscription',
    description: 'This feature is available on higher subscription tiers.',
    benefits: ['Unlock advanced SolidLabs manufacturing capabilities'],
  };
};

