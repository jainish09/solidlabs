import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  ChevronDown,
  User,
  Zap,
  Check,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { PLAN_IDS, DEMO_SUBSCRIPTION_ACCOUNTS } from '../../data/subscriptionPlans';
import Badge from '../common/Badge';

export const DemoPlanSwitcher = () => {
  const { currentPlan, switchDemoAccount, activeAccount } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50/70 text-slate-800 transition-all shadow-xs cursor-pointer group"
        title="Switch Demo Subscription Tier for Testing"
      >
        <span className="flex items-center gap-1.5 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="hidden sm:inline text-slate-500 text-[10px] uppercase tracking-wider">Plan:</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-md text-[11px] ${
              currentPlan === PLAN_IDS.ENTERPRISE
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : currentPlan === PLAN_IDS.PROFESSIONAL
                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {currentPlan}
          </span>
        </span>
        <ChevronDown size={13} className="text-slate-400 group-hover:text-slate-600 transition-transform" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-teal-100 shadow-2xl z-50 p-3 text-left animate-fade-in">
            <div className="pb-2.5 mb-2.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 font-bold block">
                  Hackathon Tester Mode
                </span>
                <p className="text-xs font-bold text-slate-900">Switch Customer Plan</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Demo Switcher
              </span>
            </div>

            <div className="space-y-1.5">
              {DEMO_SUBSCRIPTION_ACCOUNTS.map((acc) => {
                const isActive = currentPlan === acc.planId;
                const isEnt = acc.planId === PLAN_IDS.ENTERPRISE;
                const isPro = acc.planId === PLAN_IDS.PROFESSIONAL;

                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      switchDemoAccount(acc.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? isEnt
                          ? 'border-amber-400 bg-amber-50/80'
                          : isPro
                          ? 'border-teal-400 bg-teal-50/80'
                          : 'border-slate-300 bg-slate-100/90'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isEnt
                            ? 'bg-[#FF7138] text-white'
                            : isPro
                            ? 'bg-[#20B8A5] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {acc.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{acc.planId}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {acc.planId === PLAN_IDS.STARTER
                              ? '₹0'
                              : acc.planId === PLAN_IDS.PROFESSIONAL
                              ? '₹2,999/mo'
                              : '₹4,999/mo'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                          {acc.name} • {acc.company}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[10px] font-mono text-slate-500 text-center">
              Quickly test Starter locks, Pro AI customization & Enterprise live tracking.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DemoPlanSwitcher;

