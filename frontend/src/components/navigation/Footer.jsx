import React from 'react';
import { Link } from 'react-router-dom';
import { Box, ShieldCheck, CheckCircle2, Award, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-[#111111] text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF7138] flex items-center justify-center text-white font-bold font-heading shadow-md shadow-[#FF7138]/20">
                SL
              </div>
              <div>
                <span className="text-xl font-extrabold font-heading text-white tracking-tight">
                  Solid<span className="text-[#FF7138]">Labs</span>
                </span>
                <span className="block text-[10px] font-mono text-[#858585] tracking-wider uppercase">
                  Automotive B2B Marketplace
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-body leading-relaxed max-w-sm">
              From digital CAD design to physical reality. Discover precision automotive components, 
              customize specifications with AI, and partner with certified manufacturers across India.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="teal" size="xs" dot>Frontend Demo Mode</Badge>
              <Badge variant="orange" size="xs">INR (₹) Standard</Badge>
            </div>
          </div>

          {/* Column 1: Marketplace Categories */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-[#FF7138] font-bold">
              Marketplace
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link to="/marketplace?cat=Automotive+Brake+Pads" className="hover:text-white transition-colors">
                  Brake Pads & Rotors
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=Alloy+Wheels" className="hover:text-white transition-colors">
                  Forged Alloy Wheels
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=Car+Headlights" className="hover:text-white transition-colors">
                  Matrix LED Headlights
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=EV+Battery+Packs" className="hover:text-white transition-colors">
                  EV Battery Packs
                </Link>
              </li>
              <li>
                <Link to="/marketplace?cat=Electric+Vehicle+Motors" className="hover:text-white transition-colors">
                  EV Hairpin Motors
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-[#20B8A5] hover:underline flex items-center gap-1 font-mono text-[11px] pt-1">
                  View all 18 Categories &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Engineering & AI */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-[#20B8A5] font-bold">
              Engineering & AI
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link to="/customize/prod_001" className="hover:text-white transition-colors">
                  AI Customization Studio
                </Link>
              </li>
              <li>
                <Link to="/cad-analyzer" className="hover:text-white transition-colors">
                  DFM Metrology Analyzer
                </Link>
              </li>
              <li>
                <Link to="/cad-analyzer" className="hover:text-white transition-colors">
                  STEP / STL 3D Viewer
                </Link>
              </li>
              <li>
                <Link to="/customer/requirements" className="hover:text-white transition-colors">
                  Automated RFQ Matching
                </Link>
              </li>
              <li>
                <Link to="/customer/orders" className="hover:text-white transition-colors">
                  7-Stage Production Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Verified Standards */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">
              Standards & Portal
            </p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link to="/customer/dashboard" className="hover:text-white transition-colors">
                  Customer Engineer Workspace
                </Link>
              </li>
              <li>
                <Link to="/manufacturer/dashboard" className="hover:text-white transition-colors">
                  Manufacturer Partner Hub
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Demo Role Switcher
                </Link>
              </li>
              <li className="pt-2 text-[11px] font-mono text-gray-400 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <ShieldCheck size={13} className="text-[#20B8A5]" />
                  <span>IATF 16949 / ISO 9001</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Award size={13} className="text-[#FF7138]" />
                  <span>Zeiss CMM Inspection</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#858585]">
          <div className="flex items-center gap-3">
            <span>© 2026 SolidLabs Inc.</span>
            <span>•</span>
            <span>Precision Manufacturing Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#20B8A5] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20B8A5] animate-pulse"></span>
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

