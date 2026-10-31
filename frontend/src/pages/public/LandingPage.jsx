import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AUTOMOTIVE_PRODUCTS, PRODUCT_CATEGORIES } from '../../data/automotiveProducts';
import ProductCard from '../../components/marketplace/ProductCard';
import CadViewer from '../../components/cad/CadViewer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Factory,
  Search,
  PlusCircle,
  Truck,
  DollarSign,
  ChevronRight,
  Zap,
  Star,
  MapPin,
  Clock,
  HelpCircle,
  MessageSquare,
  Box,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, getOrCreateConversationForProduct } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);

  const handleChatWithManufacturer = (product) => {
    if (!product) return;
    const conv = getOrCreateConversationForProduct(product);
    setActiveDetailProduct(null);
    navigate(`/${role}/messages/${conv.id}`);
  };

  // Filter products for the marketplace preview section
  const previewProducts = AUTOMOTIVE_PRODUCTS.filter((p) => {
    if (selectedCategory === 'All Categories') return true;
    return p.category === selectedCategory;
  }).slice(0, 8);

  // Industry categories list
  const INDUSTRIES = [
    {
      name: 'Electric Vehicles (EV)',
      desc: 'Liquid-cooled battery enclosures, hairpin motor stators, and high-voltage DC-DC housings.',
      icon: <Zap className="text-teal-600" size={24} />,
      partsCount: '3,200+ parts produced',
    },
    {
      name: 'Commercial Fleets & Trucks',
      desc: 'Heavy-duty brake friction discs, pneumatic air filters, and high-torque clutch plates.',
      icon: <Truck className="text-teal-600" size={24} />,
      partsCount: '8,400+ parts produced',
    },
    {
      name: 'Passenger Vehicles & SUVs',
      desc: 'Forged lightweight monoblock wheels, modular bumper fascias, and adaptive matrix LED lamps.',
      icon: <Layers className="text-teal-600" size={24} />,
      partsCount: '15,000+ parts produced',
    },
    {
      name: 'Precision Motorsports',
      desc: 'High-temperature carbon-ceramic brake assemblies and induction-hardened helical differential gears.',
      icon: <Cpu className="text-teal-600" size={24} />,
      partsCount: '980+ custom batches',
    },
  ];

  // Sample Featured Manufacturers
  const FEATURED_MANUFACTURERS = [
    {
      name: 'Vanguard Friction Systems Pvt. Ltd.',
      specialty: 'Automotive Brake Pads & Friction Materials',
      location: 'Pune, Maharashtra, India',
      rating: 4.85,
      reviews: 142,
      years: 14,
      responseRate: '98%',
      certifications: ['ISO/TS 16949', 'ECE R90'],
      monthlyCapacity: '12,000 sets',
    },
    {
      name: 'AeroForge Dynamics Wheels India',
      specialty: '10,000-Ton Forged Monoblock Alloy Wheels',
      location: 'Chennai, Tamil Nadu, India',
      rating: 4.92,
      reviews: 96,
      years: 9,
      responseRate: '95%',
      certifications: ['TUV Approved', 'JWL/VIA Tested'],
      monthlyCapacity: '2,500 wheels',
    },
    {
      name: 'Photonics Auto Lighting Technologies',
      specialty: 'Adaptive Matrix Dynamic LED Systems',
      location: 'Gurugram, Haryana, India',
      rating: 4.88,
      reviews: 115,
      years: 11,
      responseRate: '97%',
      certifications: ['DOT / SAE', 'AIS 010/012'],
      monthlyCapacity: '4,000 units',
    },
  ];

  return (
    <div className="space-y-20 pb-20 bg-[#F8FAFA]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-[#F8FAFA] text-slate-900 pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b border-teal-100/70">
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 left-1/3 -z-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -z-0 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal" size="sm" dot>B2B Automotive Marketplace</Badge>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white text-teal-800 border border-teal-200 shadow-xs">
                AI Parametric Customization
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight leading-[1.08] text-slate-900">
              From Digital Design <br className="hidden sm:inline" />
              to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500">Physical Reality.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-body leading-relaxed max-w-2xl">
              Discover components, customize products with AI and connect with certified manufacturers to bring your engineering ideas to life.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/marketplace')}
                rightIcon={<ArrowRight size={18} />}
                className="font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/25 px-6"
              >
                Explore Products
              </Button>

              <Button
                variant="white"
                size="lg"
                onClick={() => navigate('/customize/prod_001')}
                leftIcon={<PlusCircle size={18} />}
                className="font-bold text-teal-900 border-2 border-teal-600 hover:bg-teal-50 px-6 shadow-xs"
              >
                Post a Requirement
              </Button>
            </div>

            {/* Platform Credibility Metrics */}
            <div className="pt-6 border-t border-teal-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <p className="text-2xl font-black font-heading text-teal-700">18</p>
                <p className="text-slate-500 mt-0.5">Automotive Categories</p>
              </div>
              <div>
                <p className="text-2xl font-black font-heading text-teal-600">100%</p>
                <p className="text-slate-500 mt-0.5">DFM Audited Geometry</p>
              </div>
              <div>
                <p className="text-2xl font-black font-heading text-slate-900">₹0</p>
                <p className="text-slate-500 mt-0.5">Platform Broker Fees</p>
              </div>
              <div>
                <p className="text-2xl font-black font-heading text-teal-700">AS9100D</p>
                <p className="text-slate-500 mt-0.5">Verified Machine Shops</p>
              </div>
            </div>
          </div>

          {/* Right Visual: Automotive CAD Interactive Container (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-teal-100 rounded-3xl p-4 shadow-xl shadow-teal-900/5 relative">
              <div className="flex items-center justify-between px-3 py-2 border-b border-teal-100 mb-3 text-xs font-mono">
                <span className="text-teal-700 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  CAD Geometry Viewport
                </span>
                <span className="text-slate-500 font-semibold">Veloce Forged Alloy</span>
              </div>

              <CadViewer
                preset="cylindrical_adapter"
                height="360px"
                showControls={true}
                showHud={true}
                autoRotate={true}
                colorTheme="metal"
              />

              <div className="mt-3 p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold font-heading text-slate-900">Forged Monoblock 19" Wheel Hub</p>
                  <p className="text-[11px] text-teal-700 font-mono font-medium">Aerospace 6061-T6 • JWL/VIA Tested</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/customize/prod_002')}
                  rightIcon={<Sliders size={13} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTOMOTIVE PRODUCT MARKETPLACE SECTION */}
      <section id="marketplace" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="teal" size="sm" dot>Automotive Catalog</Badge>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 mt-1 tracking-tight">
              Production-Grade Automotive Components
            </h2>
            <p className="text-sm text-slate-600 font-body mt-1 max-w-xl">
              18 distinct categories with category-specific technical specifications, competitive INR wholesale pricing, and direct customization.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/marketplace')}
            rightIcon={<ArrowRight size={16} />}
            className="border-teal-300 text-teal-800 hover:bg-teal-50"
          >
            View All 18 Categories
          </Button>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRODUCT_CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:text-teal-900 hover:bg-teal-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4 Cards Per Row Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(p) => setActiveDetailProduct(p)}
              onContactSupplier={(p) => navigate(`/customize/${p.id}#contact`)}
            />
          ))}
        </div>
      </section>

      {/* 3. INDUSTRY CATEGORIES */}
      <section id="industries" className="bg-teal-50/40 py-16 px-4 sm:px-6 lg:px-8 border-y border-teal-100/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="teal" size="sm" dot>Industry Sectors</Badge>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Engineered for Specialized Vehicle Demands
            </h2>
            <p className="text-sm text-slate-600 font-body">
              From commercial heavy transport to high-speed electric powertrains, SolidLabs connects manufacturers with OEM drawing specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INDUSTRIES.map((ind, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-teal-100/80 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center shadow-2xs">
                  {ind.icon}
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900">{ind.name}</h3>
                <p className="text-xs text-slate-600 font-body leading-relaxed">{ind.desc}</p>
                <div className="pt-2 border-t border-teal-100 text-[10px] font-mono text-teal-700 font-bold">
                  {ind.partsCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED MANUFACTURERS (Sample Profiles) */}
      <section id="manufacturers" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="teal" size="sm" dot>Verified Supplier Network</Badge>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 mt-1 tracking-tight">
              Featured Manufacturing Partners
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-body mt-1">
              * Demonstration sample profiles highlighting equipment capabilities and accredited certifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_MANUFACTURERS.map((mfg, idx) => (
            <Card key={idx} hover className="p-6 space-y-4 bg-white border border-teal-100 hover:border-teal-500">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="teal" size="xs">Sample Profile</Badge>
                  <h3 className="text-base font-bold font-heading text-slate-900 mt-1">{mfg.name}</h3>
                  <p className="text-xs text-teal-700 font-mono font-medium mt-0.5">{mfg.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <MapPin size={12} className="text-teal-600 shrink-0" />
                <span>{mfg.location}</span>
              </div>

              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100/70 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">Rating:</span>
                  <span className="font-bold text-slate-900">★ {mfg.rating} ({mfg.reviews})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Response Rate:</span>
                  <span className="font-bold text-teal-700">{mfg.responseRate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Experience:</span>
                  <span className="font-bold text-slate-900">{mfg.years} Years</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Cap:</span>
                  <span className="font-bold text-teal-800">{mfg.monthlyCapacity}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {mfg.certifications.map((c, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-medium">
                    {c}
                  </span>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-teal-300 text-teal-800 hover:bg-teal-50"
                onClick={() => navigate('/customize/prod_001')}
                rightIcon={<ChevronRight size={14} />}
              >
                Send Request to Supplier
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. AI-POWERED MANUFACTURER MATCHING */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-teal-700/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="teal" size="sm" dot>Intelligent Supplier Dispatch</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-white">
                AI-Powered Precision Manufacturer Matching
              </h2>
              <p className="text-sm text-teal-100/80 font-body leading-relaxed">
                When you post a customized requirement, SolidLabs evaluates machine envelope sizes, spindle RPM capacity, ISO/IATF certifications, and raw alloy stockpiles to route your RFQ to the top 3 best-fit manufacturing facilities.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-teal-100/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-400" />
                  <span>Automated Toolpath Feasibility Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-400" />
                  <span>Real-Time Raw Ingot Price Indexing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-400" />
                  <span>Geographic Logistics Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-400" />
                  <span>Zeiss CMM Inspection Guarantee</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="white"
                  size="md"
                  onClick={() => navigate('/customize/prod_001')}
                  rightIcon={<ArrowRight size={16} />}
                  className="bg-white hover:bg-teal-50 text-teal-900 font-bold shadow-sm"
                >
                  Post Your Custom Requirement
                </Button>
              </div>
            </div>

            {/* Right Mini Telemetry Simulation */}
            <div className="lg:col-span-5 bg-teal-950/80 p-5 rounded-2xl border border-teal-700/60 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-teal-300 font-bold">
                <span>Matching Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              </div>
              <div className="p-3 bg-teal-900/50 rounded-xl space-y-1.5 text-[11px] text-teal-100/80">
                <div className="flex justify-between"><span>Target Tolerance:</span><span className="text-white">±0.025 mm (ISO 2768-f)</span></div>
                <div className="flex justify-between"><span>Required Alloy:</span><span className="text-teal-300 font-bold">6061-T6 Aerospace</span></div>
                <div className="flex justify-between"><span>Matching Machine:</span><span className="text-teal-300 font-bold">5-Axis CNC Mill (Haas VF-4)</span></div>
                <div className="flex justify-between"><span>Supplier Match Score:</span><span className="text-teal-200 font-bold">99.2% Match</span></div>
              </div>
              <div className="p-3 bg-teal-800/40 rounded-xl border border-teal-700/50 text-[11px] text-teal-200 font-medium">
                Top Candidate: Vanguard Friction & AeroForge Network (Dispatched within 2 hrs)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW SOLIDLABS WORKS */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="teal" size="sm" dot>Workflow</Badge>
          <h2 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            How SolidLabs Works
          </h2>
          <p className="text-sm text-slate-600 font-body">
            Four streamlined steps connecting digital design to precision physical hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover & Configure',
              desc: 'Browse 18 automotive component categories or use the AI Customization Studio to tailor materials, dimensions, and grip patterns.',
            },
            {
              step: '02',
              title: 'Automated DFM Clearance',
              desc: 'Our browser-based geometric kernel checks watertightness, wall thicknesses, and tool radii before dispatching RFQs.',
            },
            {
              step: '03',
              title: 'Matched Quotations',
              desc: 'Verified machine shops review your customized specs, submitting physics-informed transparent quotations in INR.',
            },
            {
              step: '04',
              title: 'Production & Tracking',
              desc: 'Follow real-time machine spindle cutting through 7 production stages with certified CMM metrology inspection.',
            },
          ].map((s, idx) => (
            <Card key={idx} className="p-6 relative space-y-3 bg-white border border-teal-100 hover:border-teal-400 hover:shadow-md transition-all">
              <span className="text-3xl font-black font-heading text-teal-600/30">{s.step}</span>
              <h3 className="text-base font-bold font-heading text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-600 font-body leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. PLATFORM BENEFITS */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-teal-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">100% Watertight Guarantee</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-body">
              Zero unclosed meshes, zero inverted normals. All models are Euler 2-manifold validated (χ=2) for seamless CNC and 3D printing.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Transparent Factory Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-body">
              No middleman broker markups. Indicative pricing is computed using live raw ingot commodity rates and CNC machine hourly rates.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Zeiss Metrology Certified</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-body">
              Every production batch includes an inspection report and Certificate of Conformance ensuring drawing tolerance compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl border border-teal-600/40 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/20 text-white border border-white/30">
              Start Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
              Ready to Manufacture Your Custom Component?
            </h2>
            <p className="text-sm opacity-90 font-body leading-relaxed text-teal-100">
              Explore 18 demonstration categories, customize parameters with AI assistance, and broadcast your requirement to verified machine shops in minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="white"
              size="lg"
              onClick={() => navigate('/customize/prod_001')}
              leftIcon={<PlusCircle size={18} />}
              className="bg-white text-teal-900 hover:bg-teal-50 font-bold shadow-sm"
            >
              Post a Requirement
            </Button>
            <Button
              variant="outlineWhite"
              size="lg"
              onClick={() => navigate('/marketplace')}
              rightIcon={<ArrowRight size={18} />}
              className="font-bold shadow-sm"
            >
              Browse Catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Details Modal for card triggers */}
      {activeDetailProduct && (
        <Modal
          isOpen={!!activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
          title={activeDetailProduct.name}
          description={`Category: ${activeDetailProduct.category} • Manufactured by ${activeDetailProduct.manufacturer.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="h-56 w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={activeDetailProduct.image}
                alt={activeDetailProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-slate-600 font-body leading-relaxed">
              {activeDetailProduct.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <div><span className="text-slate-500">Wholesale Price:</span> <span className="font-bold text-slate-900">{activeDetailProduct.priceINR}</span></div>
              <div><span className="text-slate-500">MOQ:</span> <span className="font-bold text-slate-900">{activeDetailProduct.moq} units</span></div>
              <div><span className="text-slate-500">Capacity:</span> <span className="text-teal-700 font-bold">{activeDetailProduct.productionCapacity}</span></div>
              <div><span className="text-slate-500">Timeline:</span> <span className="text-teal-800 font-bold">{activeDetailProduct.deliveryTimeline}</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-teal-100 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setActiveDetailProduct(null)} className="border-slate-200">
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChatWithManufacturer(activeDetailProduct)}
                leftIcon={<MessageSquare size={14} className="text-teal-600" />}
                className="border-teal-200 hover:border-teal-400 text-teal-800 hover:bg-teal-50"
              >
                Chat with Manufacturer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = activeDetailProduct.id;
                  setActiveDetailProduct(null);
                  navigate(`/customize/${id}`);
                }}
                leftIcon={<Sliders size={14} />}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Customize with AI
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LandingPage;
