import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Zap,
  Sliders,
  Layers,
  Building2,
  FileText,
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { PLAN_IDS, SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const UpgradeModal = () => {
  const {
    currentPlan,
    upgradeModalState,
    closeUpgradeModal,
    checkoutModalState,
    closeCheckout,
    confirmPlanChange,
  } = useSubscription();

  const [paymentStep, setPaymentStep] = useState('review'); // 'review' | 'success'

  // Decide which modal is active: upgradeModalState or checkoutModalState
  const isOpen = upgradeModalState.isOpen || checkoutModalState.isOpen;
  const targetPlanId = checkoutModalState.isOpen
    ? checkoutModalState.targetPlan
    : upgradeModalState.targetPlan || PLAN_IDS.PROFESSIONAL;

  const targetPlan = SUBSCRIPTION_PLANS[targetPlanId] || SUBSCRIPTION_PLANS[PLAN_IDS.PROFESSIONAL];
  const isEnterprise = targetPlanId === PLAN_IDS.ENTERPRISE;

  if (!isOpen) return null;

  const handleClose = () => {
    setPaymentStep('review');
    closeUpgradeModal();
    closeCheckout();
  };

  const handleProceedUpgrade = () => {
    confirmPlanChange(targetPlanId);
  };

  // Specific copy requirements from user specification
  const modalHeading = isEnterprise
    ? 'Get Complete Manufacturing Visibility.'
    : 'Unlock Your Manufacturing Potential.';

  const modalDescription = isEnterprise
    ? 'Track production, monitor quality inspections and follow your orders through delivery.'
    : 'Build customized products, use AI-powered design assistance and connect directly with manufacturers.';

  const ctaText = isEnterprise ? 'Upgrade to Enterprise' : 'Upgrade to Professional';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-teal-100 overflow-hidden text-left transition-all">
        {/* Top Header Banner */}
        <div
          className={`p-6 pb-5 border-b ${
            isEnterprise
              ? 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-amber-900/30 text-white'
              : 'bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-teal-900/30 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 text-white shadow-xs">
                {isEnterprise ? <Layers size={18} className="text-[#FF7138]" /> : <Sliders size={18} className="text-[#20B8A5]" />}
              </span>
              <Badge variant={isEnterprise ? 'orange' : 'teal'} size="xs">
                {targetPlan.badge}
              </Badge>
              <span className="text-[11px] font-mono text-slate-300">
                Tier {isEnterprise ? '3' : '2'} Upgrade
              </span>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              {modalHeading}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
              {modalDescription}
            </p>
          </div>
        </div>

        {/* Feature Trigger Notice */}
        {upgradeModalState.featureName && !checkoutModalState.isOpen && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <Lock size={13} className="text-amber-600 shrink-0" />
            <span>
              <strong>{upgradeModalState.featureName}</strong> requires the {targetPlan.name} plan.
            </span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Plan Pricing Pill */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">
                Target Subscription
              </span>
              <span className="text-lg font-bold font-heading text-slate-900">
                {targetPlan.displayName}
              </span>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-extrabold font-heading text-slate-900">
                  {targetPlan.priceFormatted}
                </span>
                <span className="text-xs font-mono text-slate-500">/ month</span>
              </div>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                Current Plan: {currentPlan}
              </span>
            </div>
          </div>

          {/* Benefits Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles size={14} className={isEnterprise ? 'text-[#FF7138]' : 'text-[#20B8A5]'} />
              <span>What You Get with {targetPlan.name}:</span>
            </span>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {targetPlan.availableFeatures.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <CheckCircle2 size={14} className="text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-body leading-tight">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hackathon Demo Notice */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] font-mono text-teal-900 flex items-start gap-2.5">
            <CreditCard size={15} className="text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-teal-950">Simulated Demo Checkout Flow</p>
              <p className="text-teal-800 text-[10px] leading-relaxed">
                Clicking upgrade simulates an instant subscription activation for testing and evaluation. No real payment or credit card is required.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleProceedUpgrade}
            disabled={checkoutModalState.isProcessing}
            rightIcon={
              checkoutModalState.isProcessing ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={15} />
              )
            }
            className={`font-bold shadow-md cursor-pointer ${
              isEnterprise
                ? 'bg-[#FF7138] hover:bg-[#e86028] text-white'
                : 'bg-[#20B8A5] hover:bg-[#1aa392] text-white'
            }`}
          >
            {checkoutModalState.isProcessing ? 'Activating Subscription...' : ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

