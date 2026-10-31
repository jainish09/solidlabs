import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AUTOMOTIVE_PRODUCTS } from '../../data/automotiveProducts';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import CadViewer from '../../components/cad/CadViewer';
import {
  Sliders,
  Sparkles,
  Send,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  FileText,
  UploadCloud,
  Box,
  Truck,
  DollarSign,
  AlertCircle,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const CustomizationStudioPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { postRequirement, showToast } = useAuth();

  // Find target product
  const defaultProduct = AUTOMOTIVE_PRODUCTS[0];
  const initialProduct = AUTOMOTIVE_PRODUCTS.find((p) => p.id === productId) || defaultProduct;
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  // 3D Viewport or Image toggle
  const [viewMode, setViewMode] = useState('image'); // 'image' | '3d'

  // Dynamic Customization Configuration State
  const [config, setConfig] = useState({
    material: selectedProduct.material,
    quantity: selectedProduct.moq,
    colorFinish: 'Default OEM Finish',
    // Category specific attributes
    sizeOrDimension: selectedProduct.specifications[0]?.value || 'Standard',
    performanceTier: 'Balanced OEM Standard',
    customNotes: '',
    // Category detailed properties
    tyreSize: '215/65 R16',
    treadPattern: 'All-Terrain Rugged (AT)',
    rubberCompound: 'High-Silica Wet Grip Performance',
    wheelDiameter: '19"',
    wheelWidth: '8.5J',
    boltPattern: '5x114.3 mm',
    brakeCompound: 'Carbon-Ceramic Matrix',
    headlightVoltage: '12V Standard',
    headlightBeam: 'LHD Adaptive Matrix',
    batteryVoltage: '384V Nominal',
    batteryCapacity: '48 kWh',
    batteryCellType: 'Prismatic LFP Cells',
  });

  // Track original baseline configuration for comparison
  const [baselineConfig, setBaselineConfig] = useState(null);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeAiSuggestion, setActiveAiSuggestion] = useState(null);

  // Post Requirement Modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postFormData, setPostFormData] = useState({
    budgetINR: '₹' + (selectedProduct.priceNumeric * selectedProduct.moq * 1.05).toLocaleString('en-IN'),
    deliveryLocation: 'Pune Assembly Hub, Maharashtra, India',
    expectedDeliveryDate: '2026-11-25',
    manufacturingProcess: 'CNC Milling / Injection Moulding',
    additionalInstructions: 'Require full CMM dimensional report and material certificate of analysis (COA).',
    referenceFile: 'CAD_Specification_RevB.stp',
  });

  const [postSuccessModal, setPostSuccessModal] = useState(null);

  // Sync selectedProduct when URL productId changes
  useEffect(() => {
    if (productId) {
      const match = AUTOMOTIVE_PRODUCTS.find((p) => p.id === productId);
      if (match && match.id !== selectedProduct.id) {
        setSelectedProduct(match);
      }
    }
  }, [productId, selectedProduct.id]);

  // Sync baseline whenever product changes
  useEffect(() => {
    const fresh = {
      material: selectedProduct.material,
      quantity: selectedProduct.moq,
      colorFinish: 'Default OEM Standard',
      sizeOrDimension: selectedProduct.specifications[0]?.value || 'Standard',
      performanceTier: 'Balanced OEM Standard',
      customNotes: '',
      tyreSize: '215/65 R16',
      treadPattern: 'Highway Terrain (HT)',
      rubberCompound: 'Standard Fleet Rubber',
      wheelDiameter: '19"',
      wheelWidth: '8.5J',
      boltPattern: '5x114.3 mm',
      brakeCompound: 'Semi-Metallic Standard',
      headlightVoltage: '12V Standard',
      headlightBeam: 'Standard Halogen/LED',
      batteryVoltage: '384V Nominal',
      batteryCapacity: '48 kWh',
      batteryCellType: 'Prismatic LFP',
    };
    setConfig(fresh);
    setBaselineConfig(fresh);
    setActiveAiSuggestion(null);
  }, [selectedProduct]);

  // AI Prompt Suggestions bank
  const AI_SAMPLE_PROMPTS = [
    {
      label: 'Wet-Road Grip & Mileage (Tyres)',
      prompt: 'I need a tyre configuration with maximum wet-road grip and longer tread durability for commercial highway operations.',
      category: 'Tyres',
      recommendation: {
        title: 'High-Silica Wet-Grip All-Terrain Configuration',
        changes: {
          treadPattern: 'All-Terrain Rugged (AT)',
          rubberCompound: 'High-Silica Wet Grip Performance',
          performanceTier: 'Grade A Wet Braking (< 28m)',
          colorFinish: 'UV-Protected Carbon Black',
        },
        explanation: 'Increased silica loading in the compound reduces rolling resistance while improving wet traction by 28%. Interlocking AT sipes evacuate water rapidly to prevent hydroplaning.',
      },
    },
    {
      label: 'Lightweight Alloy (Alloy Wheels)',
      prompt: 'I want a lightweight forged alloy wheel with high brake ventilation and a matte black finish.',
      category: 'Alloy Wheels',
      recommendation: {
        title: 'Track-Ready Forged Matte Black Specification',
        changes: {
          wheelDiameter: '19"',
          wheelWidth: '8.5J',
          material: 'Aerospace Forged 6061-T6 Aluminum',
          colorFinish: 'Matte Stealth Black Ceramic Coating',
          performanceTier: '820kg Heavy Load Rated',
        },
        explanation: 'Switching to 6061-T6 forged monoblock reduces unsprung rotating mass by 3.2 kg per corner, improving suspension responsiveness and heat dissipation under sustained braking.',
      },
    },
    {
      label: 'Fade-Free Mountain Ceramic (Brake Pads)',
      prompt: 'I need high-temperature ceramic brake pads that prevent fade on steep downhill mountain driving with heavy loads.',
      category: 'Automotive Brake Pads',
      recommendation: {
        title: 'Thermal Dissipation Carbon-Ceramic Matrix',
        changes: {
          brakeCompound: 'Carbon-Ceramic Matrix with Synthetic Copper Fibers',
          performanceTier: 'Fade-Free up to 750°C',
          material: 'Carbon-Ceramic with Titanium Shims',
          colorFinish: 'Powder-Coated Heat-Resistant Red',
        },
        explanation: 'Carbon-ceramic matrix stabilizes the friction coefficient across 100°C - 750°C, virtually eliminating thermal fade while synthetic copper fibers damp high-frequency acoustic squeal.',
      },
    },
    {
      label: 'High-Density EV Battery Pack (EV Battery)',
      prompt: 'I need an EV battery pack with liquid cooling and fast-charging capability for commercial delivery vans.',
      category: 'EV Battery Packs',
      recommendation: {
        title: 'Liquid-Cooled 48kWh High-Cycle Van Pack',
        changes: {
          batteryCapacity: '48.5 kWh Liquid Cooled',
          batteryCellType: 'Automotive Prismatic LFP (Long Life)',
          performanceTier: '2C Fast Charge (80% in 28 mins)',
          material: 'Extruded Aluminum IP67 Structural Box',
        },
        explanation: 'Prismatic LFP chemistry offers 3,000+ deep cycles and superior thermal safety. Integrated serpentine cooling ribbons maintain cell temperature within optimal 25°C - 35°C window.',
      },
    },
  ];

  // Handle Simulated AI Generation
  const handleGenerateAi = (customText) => {
    const text = customText || aiPrompt;
    if (!text) return;

    setIsAiLoading(true);

    setTimeout(() => {
      // Find matching preset or generate dynamic
      const match = AI_SAMPLE_PROMPTS.find((p) =>
        text.toLowerCase().includes(p.category.toLowerCase()) ||
        text.toLowerCase().includes('tyre') ||
        text.toLowerCase().includes('wheel') ||
        text.toLowerCase().includes('brake') ||
        text.toLowerCase().includes('battery')
      ) || AI_SAMPLE_PROMPTS[0];

      setActiveAiSuggestion(match.recommendation);
      setIsAiLoading(false);
      showToast('AI Customization suggestions generated! Review before applying.');
    }, 1200);
  };

  // Apply AI Suggestion to active configuration
  const handleApplyAiSuggestion = () => {
    if (!activeAiSuggestion) return;
    setConfig((prev) => ({
      ...prev,
      ...activeAiSuggestion.changes,
    }));
    showToast('Applied AI configuration recommendations.');
  };

  // Reset to original baseline
  const handleReset = () => {
    if (baselineConfig) {
      setConfig({ ...baselineConfig });
      setActiveAiSuggestion(null);
      showToast('Customization reset to baseline OEM specifications.');
    }
  };

  // Submit Requirement
  const handlePostRequirement = (e) => {
    e.preventDefault();

    const newReq = postRequirement({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: config.quantity,
      budgetINR: postFormData.budgetINR,
      material: config.material,
      deliveryLocation: postFormData.deliveryLocation,
      expectedDeliveryDate: postFormData.expectedDeliveryDate,
      manufacturingProcess: postFormData.manufacturingProcess,
      customizedSpecs: {
        ...config,
      },
      additionalInstructions: postFormData.additionalInstructions,
    });

    setShowPostModal(false);
    setPostSuccessModal(newReq);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Product Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>AI Customization Studio</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-teal-800 border border-teal-200">
              Interactive B2B Configurator
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Automotive Component Customization Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body">
            Tailor mechanical parameters, materials, and tolerances. Use AI suggestions to optimize performance for your vehicle application.
          </p>
        </div>

        {/* Change Target Component dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-500 uppercase shrink-0">Product:</label>
          <select
            value={selectedProduct.id}
            onChange={(e) => {
              const p = AUTOMOTIVE_PRODUCTS.find((item) => item.id === e.target.value);
              if (p) setSelectedProduct(p);
            }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm max-w-xs truncate"
          >
            {AUTOMOTIVE_PRODUCTS.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.category} — {prod.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SECTION (5 Cols): Product Visual, 3D Preview & Baseline Specs */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="overflow-hidden p-0">
            {/* Visual Viewport (Image or 3D CAD Preview) */}
            <div className="relative h-64 sm:h-72 w-full bg-[#111111] flex items-center justify-center overflow-hidden">
              {viewMode === 'image' ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full">
                  <CadViewer
                    preset={
                      selectedProduct.categorySlug === 'alloy-wheels'
                        ? 'cylindrical_adapter'
                        : selectedProduct.categorySlug === 'tyres'
                        ? 'spacer'
                        : 'mounting_plate'
                    }
                    height="100%"
                    showControls={true}
                    showHud={false}
                    autoRotate={true}
                  />
                </div>
              )}

              {/* View Switcher Chips */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs p-1 rounded-lg border border-white/10 z-10">
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    viewMode === 'image' ? 'bg-teal-600 text-white font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Photo View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    viewMode === '3d' ? 'bg-teal-700 text-white font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  3D CAD
                </button>
              </div>

              <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md">
                {selectedProduct.category}
              </div>
            </div>

            {/* Product Meta Header */}
            <div className="p-5 space-y-3">
              <h2 className="text-lg font-bold font-heading text-slate-900">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-slate-600 font-body leading-relaxed">
                {selectedProduct.description}
              </p>

              <div className="pt-3 border-t border-teal-50 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Base Wholesaler Price:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProduct.priceINR}</span>
              </div>
            </div>
          </Card>

          {/* Current Configuration Summary Box */}
          <Card className="bg-white border border-teal-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-900">Configured Specification Snapshot</CardTitle>
                <Badge variant="teal" size="xs">Live State</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono text-slate-900">
                <div className="flex justify-between py-1.5 border-b border-teal-50">
                  <span className="text-slate-500">Material:</span>
                  <span className="font-semibold text-right max-w-[60%] truncate">{config.material}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-50">
                  <span className="text-slate-500">Order Volume:</span>
                  <span className="font-semibold text-teal-700">{config.quantity} units</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-50">
                  <span className="text-slate-500">Finish & Color:</span>
                  <span className="font-semibold text-right">{config.colorFinish}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-teal-50">
                  <span className="text-slate-500">Performance Class:</span>
                  <span className="font-semibold text-teal-800 text-right">{config.performanceTier}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setShowPostModal(true)}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Post Requirement to Manufacturers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SECTION (7 Cols): Customization Controls & AI Assistant */}
        <div className="lg:col-span-7 space-y-6">
          {/* 9. AI Customization Assistant */}
          <Card className="border-teal-200 shadow-sm bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base text-slate-900">AI Customization Assistant</CardTitle>
                    <CardDescription className="text-slate-500">
                      Describe what you want. Let AI help you configure it.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="teal" size="xs">Simulated AI Engine</Badge>
              </div>
            </CardHeader>

            <CardContent>
              {/* Chat-style prompt input */}
              <div className="space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. I need a tyre with better wet-road grip and longer durability..."
                    className="w-full rounded-xl bg-white border border-slate-200 text-sm py-3 pl-4 pr-24 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerateAi();
                    }}
                  />
                  <div className="absolute right-2">
                    <Button
                      variant="teal"
                      size="sm"
                      loading={isAiLoading}
                      onClick={() => handleGenerateAi()}
                      rightIcon={<Send size={13} />}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Prompt suggestions pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                    Example Engineering Prompts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_SAMPLE_PROMPTS.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiPrompt(sample.prompt);
                          handleGenerateAi(sample.prompt);
                        }}
                        className="text-[11px] font-mono text-slate-700 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left shadow-2xs"
                      >
                        ⚡ {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Recommendation Card & Comparison */}
                {activeAiSuggestion && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-teal-200 shadow-xs space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700">
                        <CheckCircle2 size={16} />
                        <span>{activeAiSuggestion.title}</span>
                      </div>
                      <Badge variant="teal" size="xs">AI Proposed</Badge>
                    </div>

                    <p className="text-xs text-slate-600 font-body leading-relaxed">
                      {activeAiSuggestion.explanation}
                    </p>

                    {/* Before & After Comparison Grid */}
                    <div className="pt-2 border-t border-teal-50">
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                        Before vs. After Configuration Comparison:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 block font-semibold">BEFORE (OEM Standard):</span>
                          <p className="text-slate-900 mt-1 text-[11px]">{config.material}</p>
                          <p className="text-slate-500 text-[10px]">{config.performanceTier}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-200">
                          <span className="text-[10px] text-teal-800 block font-semibold">AFTER (AI Recommended):</span>
                          <p className="text-slate-900 mt-1 text-[11px] font-bold">
                            {activeAiSuggestion.changes.rubberCompound ||
                             activeAiSuggestion.changes.material ||
                             activeAiSuggestion.changes.brakeCompound ||
                             'AI Optimized Alloy'}
                          </p>
                          <p className="text-teal-700 text-[10px] font-bold">{activeAiSuggestion.changes.performanceTier || 'Enhanced Durability'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Suggestion Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        leftIcon={<RotateCcw size={14} />}
                      >
                        Reset Customization
                      </Button>
                      <Button
                        variant="teal"
                        size="sm"
                        onClick={handleApplyAiSuggestion}
                        rightIcon={<CheckCircle2 size={14} />}
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category-Specific Manual Customization Controls */}
          <Card className="bg-white border border-teal-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Sliders className="text-teal-600 w-4 h-4" />
                  Engineering Parameters & Specifications
                </CardTitle>
                <Badge variant="teal" size="xs">Category-Specific</Badge>
              </div>
              <CardDescription className="text-slate-500">
                Customize attributes tailored specifically for {selectedProduct.category}.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* 1. TYRES CATEGORY CONTROLS */}
                {selectedProduct.categorySlug === 'tyres' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Tyre Size</label>
                      <select
                        value={config.tyreSize}
                        onChange={(e) => setConfig({ ...config, tyreSize: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="205/55 R16">205/55 R16 (Sedan Standard)</option>
                        <option value="215/65 R16">215/65 R16 (Compact SUV)</option>
                        <option value="235/60 R18">235/60 R18 (Full SUV)</option>
                        <option value="265/70 R17">265/70 R17 (Off-Road Commercial)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Tread Pattern Preference</label>
                      <select
                        value={config.treadPattern}
                        onChange={(e) => setConfig({ ...config, treadPattern: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="Highway Terrain (HT)">Highway Terrain (Quiet & Low Resistance)</option>
                        <option value="All-Terrain Rugged (AT)">All-Terrain Rugged (50% Road / 50% Trail)</option>
                        <option value="Mud Terrain (MT)">Mud Terrain (Deep Siping)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Rubber Compound</label>
                      <select
                        value={config.rubberCompound}
                        onChange={(e) => setConfig({ ...config, rubberCompound: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="High-Mileage Fleet Rubber">High-Mileage Carbon Black Compound</option>
                        <option value="High-Silica Wet Grip Performance">High-Silica Wet Grip Compound</option>
                        <option value="Soft Motorsport Compound">Soft Sticky Track Compound</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Wet / Dry Grip Standard</label>
                      <select
                        value={config.performanceTier}
                        onChange={(e) => setConfig({ ...config, performanceTier: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="Grade A Wet Braking">Grade A (Wet Braking &lt; 28m)</option>
                        <option value="Grade B Standard Commercial">Grade B Standard</option>
                        <option value="Heavy Load Puncture Resistant">Heavy 10-Ply Puncture Resistant</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. ALLOY WHEELS CATEGORY CONTROLS */}
                {selectedProduct.categorySlug === 'alloy-wheels' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Wheel Diameter</label>
                      <select
                        value={config.wheelDiameter}
                        onChange={(e) => setConfig({ ...config, wheelDiameter: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="18&quot;">18 Inch</option>
                        <option value="19&quot;">19 Inch (Standard)</option>
                        <option value="20&quot;">20 Inch</option>
                        <option value="21&quot;">21 Inch Performance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Rim Width</label>
                      <select
                        value={config.wheelWidth}
                        onChange={(e) => setConfig({ ...config, wheelWidth: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="8.0J">8.0J</option>
                        <option value="8.5J">8.5J (Recommended)</option>
                        <option value="9.5J">9.5J (Wide Rear)</option>
                        <option value="10.5J">10.5J</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Bolt Pattern (PCD)</label>
                      <select
                        value={config.boltPattern}
                        onChange={(e) => setConfig({ ...config, boltPattern: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="5x114.3 mm">5 × 114.3 mm (Japanese / Korean / Indian)</option>
                        <option value="5x112 mm">5 × 112 mm (European / VAG)</option>
                        <option value="5x120 mm">5 × 120 mm (BMW / Heavy Duty)</option>
                        <option value="4x100 mm">4 × 100 mm (Compact Hatch)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Finish & Color</label>
                      <select
                        value={config.colorFinish}
                        onChange={(e) => setConfig({ ...config, colorFinish: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="Matte Stealth Black">Matte Stealth Black</option>
                        <option value="Hyper Silver Metallic">Hyper Silver Metallic</option>
                        <option value="Bronze Satin Anodized">Bronze Satin Anodized</option>
                        <option value="Diamond Cut Machined Face">Diamond Cut Machined Face</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. BRAKE PADS CATEGORY CONTROLS */}
                {selectedProduct.categorySlug === 'brake-pads' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Friction Compound</label>
                      <select
                        value={config.brakeCompound}
                        onChange={(e) => setConfig({ ...config, brakeCompound: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="Carbon-Ceramic Matrix">Carbon-Ceramic Low Dust</option>
                        <option value="Semi-Metallic Commercial">Semi-Metallic High Heat</option>
                        <option value="Sintered Endurance">Sintered Fleet Heavy Duty</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Vehicle Platform Compatibility</label>
                      <input
                        type="text"
                        value={config.sizeOrDimension}
                        onChange={(e) => setConfig({ ...config, sizeOrDimension: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                        placeholder="e.g. OEM D1060 Caliper / SUV Front"
                      />
                    </div>
                  </div>
                )}

                {/* 4. EV BATTERY PACKS CATEGORY CONTROLS */}
                {selectedProduct.categorySlug === 'ev-battery-packs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Pack Capacity (kWh)</label>
                      <select
                        value={config.batteryCapacity}
                        onChange={(e) => setConfig({ ...config, batteryCapacity: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="32 kWh">32 kWh (Urban Commercial)</option>
                        <option value="48.5 kWh">48.5 kWh (Mid-Range Van/Sedan)</option>
                        <option value="64 kWh">64 kWh (Long Range SUV)</option>
                        <option value="78 kWh">78 kWh (Heavy Commercial)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Cell Chemistry</label>
                      <select
                        value={config.batteryCellType}
                        onChange={(e) => setConfig({ ...config, batteryCellType: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                      >
                        <option value="Prismatic LFP Cells">Prismatic LFP (High Safety & 3,000+ Cycles)</option>
                        <option value="NMC 811 Cylindrical">NMC 811 (Maximum Energy Density)</option>
                        <option value="Sodium-Ion Low Cost">Sodium-Ion (Sub-Zero Cold Weather)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Common General Parameters for All Categories */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Material */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#858585] mb-1">Base Substrate Material</label>
                    <input
                      type="text"
                      value={config.material}
                      onChange={(e) => setConfig({ ...config, material: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-[#111111]"
                    />
                  </div>

                  {/* Quantity Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-500 uppercase">Batch Quantity:</span>
                      <span className="text-teal-700 font-bold">{config.quantity} units</span>
                    </div>
                    <input
                      type="range"
                      min={selectedProduct.moq}
                      max={selectedProduct.moq * 20}
                      step="5"
                      value={config.quantity}
                      onChange={(e) => setConfig({ ...config, quantity: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>MOQ: {selectedProduct.moq}</span>
                      <span>Max: {selectedProduct.moq * 20}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
                    Special Engineering Instructions or Tolerances
                  </label>
                  <textarea
                    rows={2}
                    value={config.customNotes}
                    onChange={(e) => setConfig({ ...config, customNotes: e.target.value })}
                    placeholder="Specify surface roughness (Ra), anodizing color codes, thermal ratings, or fastener compatibility..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="mt-6 pt-4 border-t border-teal-50 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  leftIcon={<RotateCcw size={14} />}
                  className="border-slate-200"
                >
                  Reset Defaults
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowPostModal(true)}
                  rightIcon={<ArrowRight size={16} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Post Requirement to Manufacturers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 10. Post Requirement Modal Form */}
      {showPostModal && (
        <Modal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          title="Post Manufacturing Requirement to Suppliers"
          description={`Submit your customized ${selectedProduct.name} specification to verified manufacturing partners.`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handlePostRequirement} className="space-y-4">
            {/* Summary preview */}
            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Component:</span>
                <span className="font-bold text-slate-900">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customized Material:</span>
                <span className="text-teal-700 font-semibold">{config.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Size:</span>
                <span className="text-teal-800 font-bold">{config.quantity} units</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Budget (INR)"
                value={postFormData.budgetINR}
                onChange={(e) => setPostFormData({ ...postFormData, budgetINR: e.target.value })}
                required
              />

              <Input
                label="Preferred Manufacturing Process"
                value={postFormData.manufacturingProcess}
                onChange={(e) => setPostFormData({ ...postFormData, manufacturingProcess: e.target.value })}
                required
              />

              <Input
                label="Delivery Destination"
                value={postFormData.deliveryLocation}
                onChange={(e) => setPostFormData({ ...postFormData, deliveryLocation: e.target.value })}
                required
              />

              <Input
                label="Required By Date"
                type="date"
                value={postFormData.expectedDeliveryDate}
                onChange={(e) => setPostFormData({ ...postFormData, expectedDeliveryDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 font-mono mb-1">
                Additional Instructions
              </label>
              <textarea
                rows={2}
                value={postFormData.additionalInstructions}
                onChange={(e) => setPostFormData({ ...postFormData, additionalInstructions: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Reference CAD / Image upload placeholder */}
            <div className="p-3 bg-white border border-dashed border-teal-200 rounded-xl text-center space-y-1">
              <UploadCloud className="mx-auto text-teal-600 w-6 h-6" />
              <p className="text-xs font-mono text-slate-900">Attach Reference STEP, STL or 2D Drawing</p>
              <p className="text-[10px] text-slate-400">Pre-attached: {postFormData.referenceFile}</p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-teal-50">
              <Button variant="outline" size="sm" onClick={() => setShowPostModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" rightIcon={<Send size={14} />} className="bg-teal-600 hover:bg-teal-700 text-white">
                Submit RFQ to Manufacturers
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Success Modal */}
      {postSuccessModal && (
        <Modal
          isOpen={!!postSuccessModal}
          onClose={() => setPostSuccessModal(null)}
          title="Requirement Posted Successfully!"
          description={`Your customized requirement #${postSuccessModal.id} has been broadcast to verified manufacturers.`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 text-teal-700 font-bold">
                <CheckCircle2 size={16} />
                <span>RFQ Registered in Shared State</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">RFQ Identifier:</span>
                <span className="font-bold text-teal-800">{postSuccessModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product Category:</span>
                <span className="text-slate-900 font-semibold">{postSuccessModal.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Quantity:</span>
                <span className="text-slate-900 font-semibold">{postSuccessModal.quantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Broadcast Visibility:</span>
                <span className="text-teal-700 font-semibold">Visible in Manufacturer Incoming Requests</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-body leading-relaxed">
              Because this is a shared state demonstration, this requirement is now immediately available for review and quotation in the <strong>Manufacturer Workspace</strong>.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-teal-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPostSuccessModal(null);
                  navigate('/customer/dashboard');
                }}
              >
                Go to Customer Dashboard
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPostSuccessModal(null);
                  navigate('/manufacturer/orders');
                }}
                rightIcon={<ArrowRight size={14} />}
              >
                View as Manufacturer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomizationStudioPage;

