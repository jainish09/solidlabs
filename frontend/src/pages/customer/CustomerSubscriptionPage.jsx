import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
  Download,
  Zap,
  Building,
  Sliders,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { PLAN_IDS, SUBSCRIPTION_PLANS, DEMO_SUBSCRIPTION_ACCOUNTS } from '../../data/subscriptionPlans';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const CustomerSubscriptionPage = () => {
  const navigate = useNavigate();
  const {
    currentPlan,
    planDetails,
    subscriptionMeta,
    activeAccount,
    switchDemoAccount,
    openUpgradeModal,
    openCheckout,
    downgradePlan,
    showToast,
  } = useSubscription();

  const isStarter = currentPlan === PLAN_IDS.STARTER;
  const isPro = currentPlan === PLAN_IDS.PROFESSIONAL;
  const isEnterprise = currentPlan === PLAN_IDS.ENTERPRISE;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isEnterprise ? 'orange' : isPro ? 'teal' : 'secondary'}>
              {planDetails.name} Tier
            </Badge>
            <Badge variant="outline">
              Status: {subscriptionMeta.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Customer Subscription & Membership
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Manage your manufacturing tier, view active engineering tools, and explore unlocked capabilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pricing')}
            rightIcon={<ExternalLink size={14} />}
            className="border-teal-200 text-teal-800 hover:bg-teal-50"
          >
            Explore Plans
          </Button>

          {!isEnterprise && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => openCheckout(isStarter ? PLAN_IDS.PROFESSIONAL : PLAN_IDS.ENTERPRISE)}
              rightIcon={<ArrowRight size={14} />}
              className={`font-bold shadow-sm ${
                isStarter
                  ? 'bg-[#20B8A5] hover:bg-[#1aa392] text-white'
                  : 'bg-[#FF7138] hover:bg-[#e86028] text-white'
              }`}
            >
              {isStarter ? 'Upgrade to Professional' : 'Upgrade to Enterprise'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Current Plan Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Subscription Card */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden ${
              isEnterprise
                ? 'bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 border-amber-800/40 text-white'
                : isPro
                ? 'bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border-teal-800/40 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span
                  className={`text-xs font-mono uppercase tracking-wider font-bold block mb-1 ${
                    isStarter ? 'text-teal-700' : 'text-teal-300'
                  }`}
                >
                  Active Customer Subscription
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-extrabold font-heading ${
                    isStarter ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  SolidLabs {planDetails.displayName}
                </h2>
                <p
                  className={`mt-1 text-xs sm:text-sm font-body max-w-lg ${
                    isStarter ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {planDetails.description}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span
                    className={`text-3xl font-black font-heading ${
                      isStarter ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {planDetails.priceFormatted}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      isStarter ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {planDetails.priceINR === 0 ? '/ Free Forever' : '/ month'}
                  </span>
                </div>
                <Badge
                  variant={isEnterprise ? 'orange' : isPro ? 'teal' : 'secondary'}
                  size="xs"
                  className="mt-1"
                >
                  {subscriptionMeta.status}
                </Badge>
              </div>
            </div>

            {/* Renewal & Billing Meta Row */}
            <div
              className={`mt-6 pt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t text-xs font-mono ${
                isStarter
                  ? 'border-slate-100 text-slate-600'
                  : 'border-white/10 text-slate-300'
              }`}
            >
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                  Subscription Start
                </span>
                <span className="font-bold">{subscriptionMeta.startDate}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                  Next Renewal / Cycle
                </span>
                <span className="font-bold">{subscriptionMeta.nextRenewalDate}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                  Billing Method
                </span>
                <span className="font-bold">{subscriptionMeta.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Available vs Restricted Features Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-teal-900">
                  <CheckCircle2 size={16} className="text-[#20B8A5]" />
                  <span>Available in Your Plan</span>
                </CardTitle>
                <CardDescription>
                  Features active right now on your {planDetails.name} tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-xs">
                  {planDetails.availableFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ✓
                      </span>
                      <span className="text-slate-800 font-medium font-body leading-tight">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Locked Features on Lower Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                  <Lock size={16} className="text-amber-600" />
                  <span>
                    {isEnterprise ? 'All Capabilities Unlocked' : 'Locked Capabilities'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {isEnterprise
                    ? 'You have complete factory visibility and all premium features'
                    : `Upgrade your plan to unlock these manufacturing features`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEnterprise ? (
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#20B8A5]" />
                      Full Platform Access Unlocked
                    </p>
                    <p className="text-teal-800 text-[11px] leading-relaxed">
                      Your Enterprise OEM membership includes automated DFM, multi-format CAD uploads, direct supplier chat, 7-stage shopfloor tracking, and certified Zeiss CMM inspection dossiers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ul className="space-y-2 text-xs">
                      {planDetails.restrictedFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-500">
                          <Lock size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => openCheckout(isStarter ? PLAN_IDS.PROFESSIONAL : PLAN_IDS.ENTERPRISE)}
                        rightIcon={<ArrowRight size={12} />}
                        className={`w-full font-bold ${
                          isStarter
                            ? 'bg-[#20B8A5] hover:bg-[#1aa392] text-white'
                            : 'bg-[#FF7138] hover:bg-[#e86028] text-white'
                        }`}
                      >
                        {isStarter
                          ? 'Unlock AI & RFQs (Upgrade to Pro - ₹2,999)'
                          : 'Unlock Live Tracking & QA (Upgrade to Enterprise - ₹4,999)'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Col: Quick Testing Switcher & Simulated Invoices */}
        <div className="space-y-6">
          {/* Quick Demo Switcher Widget */}
          <Card className="border-teal-200 bg-gradient-to-b from-white to-teal-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="teal" size="xs">Hackathon Demo Switcher</Badge>
                <Sparkles size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base text-slate-900 mt-1">
                Instant Tier Switching
              </CardTitle>
              <CardDescription>
                Simulate different customer accounts to verify access controls on demand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {DEMO_SUBSCRIPTION_ACCOUNTS.map((acc) => {
                const isActive = currentPlan === acc.planId;
                const isEnt = acc.planId === PLAN_IDS.ENTERPRISE;
                const isPro = acc.planId === PLAN_IDS.PROFESSIONAL;

                return (
                  <button
                    key={acc.id}
                    onClick={() => switchDemoAccount(acc.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? isEnt
                          ? 'border-amber-400 bg-amber-50/90 shadow-xs'
                          : isPro
                          ? 'border-teal-400 bg-teal-50/90 shadow-xs'
                          : 'border-slate-300 bg-slate-100 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-heading text-slate-900">
                          {acc.planId}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({acc.planId === PLAN_IDS.STARTER ? '₹0' : acc.planId === PLAN_IDS.PROFESSIONAL ? '₹2,999/mo' : '₹4,999/mo'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {acc.name}
                      </p>
                    </div>

                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-600 text-white">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-teal-800 underline">
                        Switch
                      </span>
                    )}
                  </button>
                );
              })}

              <p className="text-[10px] font-mono text-slate-500 text-center pt-1">
                Persisted in browser localStorage across page reloads.
              </p>
            </CardContent>
          </Card>

          {/* Simulated Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <CreditCard size={16} className="text-teal-600" />
                <span>Simulated Billing Invoices</span>
              </CardTitle>
              <CardDescription>
                Mock receipts generated during simulated plan upgrades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscriptionMeta.invoices && subscriptionMeta.invoices.length > 0 ? (
                  subscriptionMeta.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{inv.id}</div>
                        <div className="text-[10px] text-slate-500">{inv.date} • {inv.plan}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {inv.amountINR === 0 ? '₹0' : `₹${inv.amountINR.toLocaleString()}`}
                        </div>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No billing activity yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerSubscriptionPage;

