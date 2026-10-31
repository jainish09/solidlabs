import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  PLAN_IDS,
  SUBSCRIPTION_PLANS,
  DEMO_SUBSCRIPTION_ACCOUNTS,
} from '../data/subscriptionPlans';
import {
  hasFeatureAccess,
  getRequiredPlanForFeature,
  getFeatureMetadata,
  PLAN_TIERS,
} from '../utils/featureAccess';

const SubscriptionContext = createContext(null);

const STORAGE_KEY_PLAN = 'solidlabs_subscription_plan';
const STORAGE_KEY_META = 'solidlabs_subscription_meta';
const STORAGE_KEY_ACCOUNT = 'solidlabs_subscription_active_account';

export const SubscriptionProvider = ({ children }) => {
  // Initialize plan from localStorage, default to STARTER to cleanly showcase tiers
  const [currentPlan, setCurrentPlan] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAN);
      if (saved && SUBSCRIPTION_PLANS[saved]) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return PLAN_IDS.STARTER;
  });

  // Simulated subscription metadata
  const [subscriptionMeta, setSubscriptionMeta] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_META);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return {
      status: 'Active',
      startDate: '2026-10-01',
      nextRenewalDate: '2026-11-01',
      billingCycle: 'Monthly',
      paymentMethod: 'Simulated Card (Demo Mode • **** 4242)',
      invoices: [
        {
          id: 'INV-2026-0881',
          date: '2026-10-01',
          amountINR: 0,
          plan: 'Starter Explorer',
          status: 'Paid',
          pdfName: 'SolidLabs-Invoice-0881.pdf',
        },
      ],
    };
  });

  // Active demo account index/id
  const [activeAccountKey, setActiveAccountKey] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ACCOUNT) || 'cust_starter';
    } catch {
      return 'cust_starter';
    }
  });

  // Toast / feedback message state
  const [toastMessage, setToastMessage] = useState(null);

  // Upgrade Modal State
  const [upgradeModalState, setUpgradeModalState] = useState({
    isOpen: false,
    targetPlan: PLAN_IDS.PROFESSIONAL,
    featureName: '',
    featureDescription: '',
    benefits: [],
  });

  // Simulated Checkout Modal State
  const [checkoutModalState, setCheckoutModalState] = useState({
    isOpen: false,
    targetPlan: PLAN_IDS.PROFESSIONAL,
    isProcessing: false,
    isSuccess: false,
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAN, currentPlan);
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(subscriptionMeta));
      localStorage.setItem(STORAGE_KEY_ACCOUNT, activeAccountKey);
    } catch {
      // Ignore
    }
  }, [currentPlan, subscriptionMeta, activeAccountKey]);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message) => {
    setToastMessage(message);
  };

  /**
   * Check if current user has access to a specific feature key
   */
  const hasAccess = (feature) => {
    return hasFeatureAccess(feature, currentPlan);
  };

  /**
   * Open the Upgrade Prompt Modal
   */
  const openUpgradeModal = (targetPlan = PLAN_IDS.PROFESSIONAL, featureName = '', featureDescription = '', customBenefits = null) => {
    const defaultMeta = featureName ? getFeatureMetadata(featureName) : null;
    
    setUpgradeModalState({
      isOpen: true,
      targetPlan: targetPlan || defaultMeta?.targetPlan || PLAN_IDS.PROFESSIONAL,
      featureName: featureName || defaultMeta?.name || 'Premium Capability',
      featureDescription: featureDescription || defaultMeta?.description || 'Unlock advanced manufacturing tools with an upgraded subscription.',
      benefits: customBenefits || defaultMeta?.benefits || SUBSCRIPTION_PLANS[targetPlan]?.availableFeatures.slice(0, 4) || [],
    });
  };

  const closeUpgradeModal = () => {
    setUpgradeModalState((prev) => ({ ...prev, isOpen: false }));
  };

  /**
   * Open the Simulated Checkout Modal
   */
  const openCheckout = (targetPlan) => {
    setUpgradeModalState((prev) => ({ ...prev, isOpen: false }));
    setCheckoutModalState({
      isOpen: true,
      targetPlan: targetPlan || PLAN_IDS.PROFESSIONAL,
      isProcessing: false,
      isSuccess: false,
    });
  };

  const closeCheckout = () => {
    setCheckoutModalState((prev) => ({ ...prev, isOpen: false, isProcessing: false, isSuccess: false }));
  };

  /**
   * Confirm simulated plan change / upgrade
   */
  const confirmPlanChange = (targetPlanId) => {
    const targetPlan = SUBSCRIPTION_PLANS[targetPlanId];
    if (!targetPlan) return;

    setCheckoutModalState((prev) => ({ ...prev, isProcessing: true }));

    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const newInvoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newInvoice = {
        id: newInvoiceId,
        date: today,
        amountINR: targetPlan.priceINR,
        plan: targetPlan.displayName,
        status: 'Paid',
        pdfName: `SolidLabs-${targetPlan.name}-Receipt.pdf`,
      };

      setCurrentPlan(targetPlanId);
      setSubscriptionMeta((prev) => ({
        ...prev,
        status: 'Active',
        startDate: today,
        nextRenewalDate: nextMonth,
        invoices: [newInvoice, ...(prev.invoices || [])],
      }));

      // Update active demo account to reflect plan tier
      const matchingAccount = DEMO_SUBSCRIPTION_ACCOUNTS.find((acc) => acc.planId === targetPlanId);
      if (matchingAccount) {
        setActiveAccountKey(matchingAccount.id);
      }

      setCheckoutModalState((prev) => ({
        ...prev,
        isProcessing: false,
        isSuccess: true,
      }));

      showToast(`Subscription upgraded to ${targetPlan.displayName}! All features are now unlocked.`);
    }, 900);
  };

  /**
   * Downgrade plan
   */
  const downgradePlan = (targetPlanId) => {
    const targetPlan = SUBSCRIPTION_PLANS[targetPlanId];
    if (!targetPlan) return;

    setCurrentPlan(targetPlanId);
    showToast(`Subscription plan switched to ${targetPlan.displayName}.`);
  };

  /**
   * Switch between Hackathon Demo Profiles
   */
  const switchDemoAccount = (accountIdOrPlan) => {
    const target = DEMO_SUBSCRIPTION_ACCOUNTS.find(
      (acc) => acc.id === accountIdOrPlan || acc.planId === accountIdOrPlan
    );

    if (target) {
      setActiveAccountKey(target.id);
      setCurrentPlan(target.planId);
      showToast(`Switched active demo profile to: ${target.name} (${target.planId} Tier)`);
    }
  };

  // Current active plan object
  const planDetails = useMemo(() => {
    return SUBSCRIPTION_PLANS[currentPlan] || SUBSCRIPTION_PLANS[PLAN_IDS.STARTER];
  }, [currentPlan]);

  // Current active account profile
  const activeAccount = useMemo(() => {
    return (
      DEMO_SUBSCRIPTION_ACCOUNTS.find((acc) => acc.id === activeAccountKey) ||
      DEMO_SUBSCRIPTION_ACCOUNTS[0]
    );
  }, [activeAccountKey]);

  const value = {
    currentPlan,
    planDetails,
    subscriptionMeta,
    activeAccount,
    PLAN_IDS,
    SUBSCRIPTION_PLANS,
    hasAccess,
    openUpgradeModal,
    closeUpgradeModal,
    upgradeModalState,
    checkoutModalState,
    openCheckout,
    closeCheckout,
    confirmPlanChange,
    downgradePlan,
    switchDemoAccount,
    toastMessage,
    showToast,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="bg-[#111111] text-white text-xs font-mono px-4 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#20B8A5] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;

