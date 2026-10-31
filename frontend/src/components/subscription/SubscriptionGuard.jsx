import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { PLAN_IDS, SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import { getRequiredPlanForFeature, getFeatureMetadata } from '../../utils/featureAccess';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const SubscriptionGuard = ({
  feature,
  children,
  fallback = null,
  inline = false,
}) => {
  const navigate = useNavigate();
  const { currentPlan, hasAccess, openUpgradeModal, openCheckout } = useSubscription();

  const allowed = hasAccess(feature);

  if (allowed) {
    return <>{children}</>;
  }

  // If a custom fallback was provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  const requiredPlanId = getRequiredPlanForFeature(feature);
  const targetPlan = SUBSCRIPTION_PLANS[requiredPlanId] || SUBSCRIPTION_PLANS[PLAN_IDS.PROFESSIONAL];
  const meta = getFeatureMetadata(feature);
  const isEnterprise = requiredPlanId === PLAN_IDS.ENTERPRISE;

  const handleUpgrade = () => {
    openUpgradeModal(requiredPlanId, meta.name, meta.description, meta.benefits);
  };

  // Inline banner version
  if (inline) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
            <Lock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-heading">{meta.name}</span>
              <Badge variant={isEnterprise ? 'orange' : 'teal'} size="xs">
                {targetPlan.name} Plan Required
              </Badge>
            </div>
            <p className="text-[11px] text-amber-800 font-body mt-0.5">
              {meta.description}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="xs"
          onClick={handleUpgrade}
          rightIcon={<ArrowRight size={12} />}
          className={`shrink-0 font-bold ${
            isEnterprise ? 'bg-[#FF7138] hover:bg-[#e86028]' : 'bg-[#20B8A5] hover:bg-[#1aa392]'
          }`}
        >
          Upgrade ({targetPlan.priceFormatted}/mo)
        </Button>
      </div>
    );
  }

  // Full-page upgrade gate
  return (
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-10 bg-white rounded-3xl border border-teal-100 shadow-sm text-center">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Lock Icon Pill */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-800 shadow-xs mb-2">
          <Lock size={28} className={isEnterprise ? 'text-[#FF7138]' : 'text-[#20B8A5]'} />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge variant={isEnterprise ? 'orange' : 'teal'} size="sm">
            {targetPlan.displayName} Feature
          </Badge>
          <span className="text-xs font-mono text-slate-400">•</span>
          <span className="text-xs font-mono text-slate-500">
            Current Tier: <strong className="text-slate-800">{currentPlan}</strong>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          {meta.headline}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed">
          {meta.description}
        </p>

        {/* Feature Highlights Grid */}
        <div className="pt-2 text-left bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
          <span className="text-xs font-mono font-bold text-slate-700 block mb-2.5">
            Included in {targetPlan.name} Subscription:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {meta.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-teal-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleUpgrade}
            rightIcon={<ArrowRight size={15} />}
            className={`w-full sm:w-auto font-bold shadow-md ${
              isEnterprise
                ? 'bg-[#FF7138] hover:bg-[#e86028] text-white'
                : 'bg-[#20B8A5] hover:bg-[#1aa392] text-white'
            }`}
          >
            {isEnterprise ? 'Upgrade to Enterprise (₹4,999/mo)' : 'Upgrade to Professional (₹2,999/mo)'}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/pricing')}
            rightIcon={<ChevronRight size={14} />}
            className="w-full sm:w-auto border-teal-200 text-teal-900 hover:bg-teal-50"
          >
            Compare All Plans
          </Button>
        </div>

        <p className="text-[11px] font-mono text-slate-400 pt-1">
          Demo activation available instantly without card details.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionGuard;

