import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Sliders,
  Layers,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  PLAN_IDS,
  SUBSCRIPTION_PLANS,
  COMPARISON_CATEGORIES,
  PRICING_FAQS,
} from '../../data/subscriptionPlans';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DemoPlanSwitcher from '../../components/subscription/DemoPlanSwitcher';

export const PricingPage = () => {
  const navigate = useNavigate();
  const { currentPlan, openCheckout, downgradePlan, showToast } = useSubscription();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  const handlePlanAction = (planId) => {
    if (planId === currentPlan) {
      showToast(`You are currently on the ${SUBSCRIPTION_PLANS[planId].name} plan.`);
      return;
    }

    if (planId === PLAN_IDS.STARTER) {
      downgradePlan(PLAN_IDS.STARTER);
      return;
    }

    openCheckout(planId);
  };

  const plans = [
    SUBSCRIPTION_PLANS[PLAN_IDS.STARTER],
    SUBSCRIPTION_PLANS[PLAN_IDS.PROFESSIONAL],
    SUBSCRIPTION_PLANS[PLAN_IDS.ENTERPRISE],
  ];

  return (
    <div className="bg-[#F5F5F3] min-h-screen text-[#111111] pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#111111] via-[#1a2323] to-[#111111] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 border-b border-teal-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#20B8A5_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#20B8A5] animate-ping" />
            <span>Three-Tier Industrial SaaS Membership</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-white">
            Choose How You Manufacture.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-body leading-relaxed">
            Start exploring for free. Unlock intelligent customization and complete manufacturing visibility as your business grows.
          </p>

          {/* Quick Demo Switcher Toolbar in Hero */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-mono text-slate-400">Current Demo Plan:</span>
            <DemoPlanSwitcher />
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isRecommended = plan.isPopular;
            const isEnterprise = plan.id === PLAN_IDS.ENTERPRISE;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  isRecommended
                    ? 'bg-white border-2 border-[#20B8A5] shadow-2xl shadow-teal-950/15 ring-4 ring-teal-500/10 scale-100 lg:-translate-y-3'
                    : isEnterprise
                    ? 'bg-white border-2 border-slate-300 hover:border-[#FF7138] shadow-lg'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {/* Popular / Recommended Tag */}
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#20B8A5] text-white text-xs font-mono font-bold tracking-wide shadow-md uppercase">
                    Recommended Plan
                  </div>
                )}

                {isEnterprise && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF7138] text-white text-xs font-mono font-bold tracking-wide shadow-md uppercase">
                    Full Visibility
                  </div>
                )}

                <div className="p-8">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold font-heading text-[#111111]">
                        {plan.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {plan.displayName}
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1">
                        <Check size={12} /> Active Plan
                      </span>
                    ) : (
                      <Badge variant={plan.badgeVariant} size="xs">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-body min-h-[36px] leading-relaxed mb-6">
                    {plan.tagline}
                  </p>

                  {/* Pricing Display */}
                  <div className="p-5 rounded-2xl bg-[#F5F5F3] border border-slate-200/80 mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold font-heading text-[#111111] tracking-tight">
                        {plan.priceFormatted}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {plan.priceINR === 0 ? '/ Free Forever' : '/ month'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 block mt-1">
                      {plan.priceINR === 0 ? 'Zero platform fees' : 'Billed monthly • Cancel anytime'}
                    </span>
                  </div>

                  {/* Target Audience Note */}
                  <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-body text-slate-600">
                    <strong className="text-slate-900 block font-heading mb-0.5">Best For:</strong>
                    {plan.targetAudience}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Plan Inclusions
                    </span>
                    <ul className="space-y-2.5 text-xs">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          {feat.included ? (
                            <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Lock size={10} />
                            </span>
                          )}
                          <span
                            className={
                              feat.included
                                ? 'text-slate-800 font-medium'
                                : 'text-slate-400 line-through text-[11px]'
                            }
                          >
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-8 pt-0">
                  <Button
                    variant={isRecommended ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => handlePlanAction(plan.id)}
                    className={`w-full font-bold shadow-md cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-default'
                        : isRecommended
                        ? 'bg-[#20B8A5] hover:bg-[#1aa392] text-white'
                        : isEnterprise
                        ? 'bg-[#FF7138] hover:bg-[#e86028] text-white border-transparent'
                        : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {isCurrent ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check size={16} /> Current Plan
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comprehensive Feature Comparison Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="teal" size="sm">Side-by-Side Matrix</Badge>
          <h2 className="text-3xl font-extrabold font-heading text-[#111111] mt-2 tracking-tight">
            Compare Plan Capabilities
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-body">
            Detailed breakdown of manufacturing tools, AI assistance, supplier negotiations, and metrology reporting.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#111111] text-white uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 sm:p-5 w-2/5 font-bold font-heading">Manufacturing Capability</th>
                  <th className="p-4 sm:p-5 w-1/5 text-center">Starter (₹0)</th>
                  <th className="p-4 sm:p-5 w-1/5 text-center bg-teal-950/60 text-teal-300">Professional (₹2,999)</th>
                  <th className="p-4 sm:p-5 w-1/5 text-center text-amber-300">Enterprise (₹4,999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_CATEGORIES.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-[#F5F5F3] font-bold text-slate-900">
                      <td colSpan={4} className="p-3.5 px-5 font-heading text-xs text-slate-800 uppercase tracking-wider">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.items.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 px-5 text-slate-800 font-body font-medium">
                          {row.feature}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.starter === 'boolean' ? (
                            row.starter ? (
                              <Check className="inline-block text-teal-600" size={16} />
                            ) : (
                              <X className="inline-block text-slate-300" size={16} />
                            )
                          ) : (
                            <span className="text-slate-700 font-semibold">{row.starter}</span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-teal-50/30">
                          {typeof row.pro === 'boolean' ? (
                            row.pro ? (
                              <Check className="inline-block text-[#20B8A5] font-bold" size={16} />
                            ) : (
                              <X className="inline-block text-slate-300" size={16} />
                            )
                          ) : (
                            <span className="text-teal-900 font-bold">{row.pro}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof row.ent === 'boolean' ? (
                            row.ent ? (
                              <Check className="inline-block text-[#FF7138] font-bold" size={16} />
                            ) : (
                              <X className="inline-block text-slate-300" size={16} />
                            )
                          ) : (
                            <span className="text-slate-900 font-bold">{row.ent}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-10">
          <Badge variant="orange" size="sm">Subscription FAQ</Badge>
          <h2 className="text-3xl font-extrabold font-heading text-[#111111] mt-2 tracking-tight">
            Got Questions About Memberships?
          </h2>
          <p className="mt-1 text-sm text-slate-600 font-body">
            Everything you need to know about plans, billing simulation, and feature tiers.
          </p>
        </div>

        <div className="space-y-3">
          {PRICING_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold font-heading text-slate-900">
                    {faq.question}
                  </span>
                  <span className="text-teal-600 shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 font-body leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="rounded-3xl bg-[#111111] text-white p-8 sm:p-12 text-center space-y-4 border border-teal-900/60 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <Badge variant="teal" size="sm">Ready to Build?</Badge>
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Start Free or Unlock Complete Factory Visibility.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-body">
              Switch plans anytime to test all customer capabilities. No credit card required in hackathon demo mode.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/customer/subscription')}
                rightIcon={<ArrowRight size={15} />}
                className="bg-[#20B8A5] hover:bg-[#1aa392] text-white font-bold"
              >
                Go to My Subscription
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/marketplace')}
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                Browse Marketplace
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;

