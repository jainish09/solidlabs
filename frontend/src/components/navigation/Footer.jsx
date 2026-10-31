import React from 'react';
import { Link } from 'react-router-dom';
import { Box, ShieldCheck, CheckCircle2, Award, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';

export const Footer = () => {
  return (
    <footer className="border-t border-teal-100 bg-white text-slate-700 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold font-heading shadow-md shadow-teal-600/20">
                <Box size={20} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold font-heading text-[#0F172A] tracking-tight">
                  Solid<span className="text-teal-700">Labs</span>
                </span>
                <span className="block text-[10px] font-mono text-teal-800 font-semibold tracking-wider uppercase">
                  Automotive B2B Marketplace
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-body leading-relaxed max-w-sm">
              From digital CAD design to physical reality. Discover precision automotive components, 
              customize specifications with AI, and partner with certified manufacturers across India.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="teal" size="xs" dot>Frontend Demo Mode</Badge>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                INR (₹) Standard
              </span>
            </div>
          </div>

          {/* Column 1: Marketplace Categories */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-teal-800 font-bold">
              Marketplace
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/marketplace?cat=Automotive+Brake+Pads" className="hover:text-teal-700 transition-colors">
                  Brake Pads & Rotors
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=Alloy+Wheels" className="hover:text-teal-700 transition-colors">
                  Forged Alloy Wheels
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=Car+Headlights" className="hover:text-teal-700 transition-colors">
                  Matrix LED Headlights
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=EV+Battery+Packs" className="hover:text-teal-700 transition-colors">
                  EV Battery Packs
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=Electric+Vehicle+Motors" className="hover:text-teal-700 transition-colors">
                  EV Hairpin Motors
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-teal-700 hover:text-teal-900 flex items-center gap-1 font-mono text-[11px] pt-1 font-semibold">
                  View all 18 Categories &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Engineering & AI */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-teal-800 font-bold">
              Engineering & AI
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/customize/prod_001" className="hover:text-teal-700 transition-colors">
                  AI Customization Studio
                </Link>
              </li>
              <li>
                <Link to="/cad-analyzer" className="hover:text-teal-700 transition-colors">
                  DFM Metrology Analyzer
                </Link>
              </li>
              <li>
                <Link to="/cad-analyzer" className="hover:text-teal-700 transition-colors">
                  STEP / STL 3D Viewer
                </Link>
              </li>
              <li>
                <Link to="/customer/requirements" className="hover:text-teal-700 transition-colors">
                  Automated RFQ Matching
                </Link>
              </li>
              <li>
                <Link to="/customer/orders" className="hover:text-teal-700 transition-colors">
                  7-Stage Production Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Verified Standards */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-teal-800 font-bold">
              Standards & Portal
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/pricing" className="hover:text-teal-700 transition-colors font-bold text-teal-800">
                  Pricing & Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-teal-700 transition-colors">
                  Customer Engineer Workspace
                </Link>
              </li>
              <li>
                <Link to="/manufacturer/dashboard" className="hover:text-teal-700 transition-colors">
                  Manufacturer Partner Hub
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-700 transition-colors">
                  Demo Role Switcher
                </Link>
              </li>
              <li className="pt-2 text-[11px] font-mono text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck size={13} className="text-teal-600" />
                  <span>IATF 16949 / ISO 9001</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Award size={13} className="text-teal-600" />
                  <span>Zeiss CMM Inspection</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="text-slate-700 font-semibold">© 2026 SolidLabs Inc.</span>
            <span>•</span>
            <span>Precision Manufacturing Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-teal-700 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
              All 18 Categories Live
            </span>
            <span>Independent Frontend Scope</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
