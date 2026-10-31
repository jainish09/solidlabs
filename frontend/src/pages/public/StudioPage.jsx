import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CadViewer from '../../components/cad/CadViewer';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { RAW_MATERIALS, MANUFACTURING_PROCESSES } from '../../data/mockData';
import {
  Sparkles,
  Cpu,
  Layers,
  Sliders,
  Download,
  FileCheck2,
  Receipt,
  FolderPlus,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const StudioPage = () => {
  const { addCADAsset, showToast } = useAuth();
  const navigate = useNavigate();

  // Active template preset
  const [preset, setPreset] = useState('mounting_plate');
  const [prompt, setPrompt] = useState('NEMA 17 Stepper Mounting Plate with M3 corner holes and 22mm center bore');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);

  // Selected material for physics & mass computation
  const [selectedMaterialId, setSelectedMaterialId] = useState('al_6061_t6');
  const selectedMaterial = RAW_MATERIALS.find((m) => m.id === selectedMaterialId) || RAW_MATERIALS[0];

  // Parametric sliders state
  const [params, setParams] = useState({
    // Mounting plate params
    width: 80,
    length: 80,
    thickness: 8,
    cornerHoleDia: 5.5,
    centerBoreDia: 24,
    filletRadius: 6,
    // Bracket params
    baseLength: 70,
    uprightHeight: 70,
    gussetThickness: 6,
    holeDia: 6.5,
    // Spacer params
    outerDia: 36,
    innerDia: 16,
    height: 25,
    chamfer: 1.0,
    // Adapter params
    flangeDia: 55,
    flangeHeight: 12,
    shaftDia: 32,
    shaftHeight: 35,
    throughBoreDia: 14,
    counterBores: 4,
    // Enclosure params
    finCount: 7,
    finHeight: 12,
  });

  const [liveMetrics, setLiveMetrics] = useState({
    volume_mm3: 18450,
    surface_area_mm2: 8920,
    dimensions: { x: 80, y: 80, z: 8 },
    triangleCount: 4280,
  });

  // Presets list
  const PRESET_TEMPLATES = [
    {
      id: 'mounting_plate',
      label: 'Mounting Plate',
      icon: '📐',
      prompt: 'High-strength NEMA motor mounting plate with 4 bolt-hole pattern and center clearance bore',
      defaultParams: { width: 85, length: 85, thickness: 8, cornerHoleDia: 5.5, centerBoreDia: 24, filletRadius: 6 },
    },
    {
      id: 'simple_bracket',
      label: '90° Structural Bracket',
      icon: '🦾',
      prompt: 'Rigid 90-degree L-bracket with center stiffening gusset and slotted adjustment holes',
      defaultParams: { baseLength: 75, uprightHeight: 75, width: 50, thickness: 8, gussetThickness: 6, holeDia: 6.5 },
    },
    {
      id: 'spacer',
      label: 'Precision Standoff / Bushing',
      icon: '⚙️',
      prompt: 'Precision turned cylindrical spacer bushing with internal through-hole and edge chamfers',
      defaultParams: { outerDia: 36, innerDia: 16, height: 30, chamfer: 1.2 },
    },
    {
      id: 'cylindrical_adapter',
      label: 'Flanged Stepped Adapter',
      icon: '🔄',
      prompt: 'Dual-diameter rotary shaft coupling adapter with 4-hole flange and through bore',
      defaultParams: { flangeDia: 60, flangeHeight: 12, shaftDia: 34, shaftHeight: 40, throughBoreDia: 16, counterBores: 4 },
    },
    {
      id: 'heatsink_enclosure',
      label: 'Heatsink Enclosure',
      icon: '📦',
      prompt: 'Extruded aluminum electronic module housing with integrated thermal dissipating fins',
      defaultParams: { width: 90, length: 65, height: 30, finCount: 8, finHeight: 14 },
    },
  ];

  const handleSelectPreset = (p) => {
    setPreset(p.id);
    setPrompt(p.prompt);
    setParams((prev) => ({ ...prev, ...p.defaultParams }));
  };

  // Simulate AI Parametric Generation
  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setSynthesisStep(1);

    setTimeout(() => setSynthesisStep(2), 600);
    setTimeout(() => setSynthesisStep(3), 1200);
    setTimeout(() => {
      setSynthesisStep(4);
      setIsSynthesizing(false);
      showToast('Parametric CAD geometry synthesized and watertight verified!');
    }, 1800);
  };

  // Calculate live mass in grams: Volume (cm3) * density (g/cm3)
  const volumeCm3 = liveMetrics.volume_mm3 / 1000;
  const estimatedMassGrams = (volumeCm3 * selectedMaterial.density_g_cm3).toFixed(1);

  // Calculate indicative unit price: Material cost + CNC Machining cost
  const rawMaterialCost = (parseFloat(estimatedMassGrams) / 1000) * selectedMaterial.pricePerKg * 2.2;
  const machiningHours = Math.max(0.2, (volumeCm3 / 120));
  const estimatedUnitPrice = (rawMaterialCost + machiningHours * 75 + 15).toFixed(2);

  const handleSaveToAssets = () => {
    addCADAsset({
      name: `${preset.replace('_', ' ').toUpperCase()} (${params.width || params.outerDia || 75}mm)`,
      category: preset,
      preset: preset,
      fileType: 'STL',
      volume_mm3: liveMetrics.volume_mm3,
      surface_area_mm2: liveMetrics.surface_area_mm2,
      dimensions: liveMetrics.dimensions,
      triangleCount: liveMetrics.triangleCount,
      dfmScore: 98,
    });
  };

  const handleExportSTL = () => {
    const fakeStlBlob = new Blob(
      [`solid solidlabs_${preset}\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 10 0 0\n      vertex 0 10 0\n    endloop\n  endfacet\nendsolid`],
      { type: 'application/octet-stream' }
    );
    const url = URL.createObjectURL(fakeStlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solidlabs_${preset}_${Date.now()}.stl`;
    a.click();
    showToast('STL mesh exported successfully.');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" dot>Text-to-CAD Engine</Badge>
            <Badge variant="teal">Watertight 2-Manifold</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#F4F5F2] tracking-tight">
            Parametric CAD Synthesis Studio
          </h1>
          <p className="mt-1 text-sm text-[#F4F5F2]/70 font-body">
            Convert mechanical engineering descriptions into real, fully-parameterized, watertight 3D geometries.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleSaveToAssets} leftIcon={<FolderPlus size={16} />}>
            Save to Assets
          </Button>
          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/quotes')}
            leftIcon={<Receipt size={16} />}
          >
            Instant Quote
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportSTL} leftIcon={<Download size={16} />}>
            Export STL
          </Button>
        </div>
      </div>

      {/* Natural Language Prompt & Synthesis Bar */}
      <Card className="border-[#FF7138]/30">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-[#FF7138] flex items-center gap-1.5 font-bold">
              <Sparkles size={14} />
              AI Prompt to Mechanical Specification
            </label>
            <span className="text-xs text-[#F4F5F2]/40 font-mono">Zero-Hallucination Parametric Kernel</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe part geometry, bolt patterns, dimensions, and operational load requirements..."
                className="w-full bg-[#101820] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F4F5F2] placeholder-[#F4F5F2]/30 focus:outline-none focus:ring-2 focus:ring-[#FF7138] focus:border-transparent font-body"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              loading={isSynthesizing}
              onClick={handleSynthesize}
              rightIcon={<Cpu size={16} />}
              className="px-6 shrink-0"
            >
              Synthesize CAD
            </Button>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
            <span className="text-xs text-[#F4F5F2]/50 font-mono uppercase mr-1 shrink-0">Presets:</span>
            {PRESET_TEMPLATES.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  preset === p.id
                    ? 'bg-[#FF7138] text-white shadow-md shadow-[#FF7138]/20'
                    : 'bg-[#101820] text-[#F4F5F2]/70 hover:bg-white/5 border border-white/10'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Synthesis Telemetry Bar (active when synthesizing) */}
          {isSynthesizing && (
            <div className="bg-[#101820] p-3 rounded-xl border border-[#29B5A5]/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#29B5A5] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#29B5A5] animate-ping" />
                  {synthesisStep === 1 && 'Step 1/3: Parsing constraints & bounding volume...'}
                  {synthesisStep === 2 && 'Step 2/3: Synthesizing parametric CSG geometry...'}
                  {synthesisStep === 3 && 'Step 3/3: Running watertight topology audit...'}
                  {synthesisStep === 4 && 'Complete: 100% Watertight Manifold Verified.'}
                </span>
                <span className="text-[#F4F5F2]/50">{synthesisStep * 25}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF7138] to-[#29B5A5] h-full transition-all duration-300"
                  style={{ width: `${synthesisStep * 25}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Interactive Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <CadViewer
              preset={preset}
              params={params}
              height="520px"
              allowUpload={true}
              showControls={true}
              showHud={true}
              onMetricsChange={setLiveMetrics}
            />
          </div>

          {/* Quick Engineering Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1C2935] p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-[#F4F5F2]/50 font-mono uppercase">Calculated Mass</p>
              <p className="text-lg font-bold font-heading text-[#FF7138] mt-0.5">{estimatedMassGrams} g</p>
              <p className="text-[10px] text-[#F4F5F2]/40 font-mono">{selectedMaterial.name}</p>
            </div>
            <div className="bg-[#1C2935] p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-[#F4F5F2]/50 font-mono uppercase">True Volume</p>
              <p className="text-lg font-bold font-heading text-[#F4F5F2] mt-0.5">{volumeCm3.toFixed(2)} cm³</p>
              <p className="text-[10px] text-[#29B5A5] font-mono">Watertight Mesh</p>
            </div>
            <div className="bg-[#1C2935] p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-[#F4F5F2]/50 font-mono uppercase">Indicative Unit</p>
              <p className="text-lg font-bold font-heading text-[#29B5A5] mt-0.5">${estimatedUnitPrice}</p>
              <p className="text-[10px] text-[#F4F5F2]/40 font-mono">1-Piece Prototype</p>
            </div>
            <div className="bg-[#1C2935] p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-[#F4F5F2]/50 font-mono uppercase">DFM Status</p>
              <p className="text-lg font-bold font-heading text-emerald-400 mt-0.5">Grade A</p>
              <p className="text-[10px] text-[#F4F5F2]/40 font-mono">3-Axis Feasible</p>
            </div>
          </div>
        </div>

        {/* Right Column: Parametric Sliders & Material Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="text-[#FF7138] w-4 h-4" />
                  Parametric Dimensions
                </CardTitle>
                <Badge variant="teal" size="sm">Real-time Three.js Sync</Badge>
              </div>
              <CardDescription>
                Adjust parameters to mutate the solid geometry with instant live feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Dynamic Sliders based on Preset */}
              {preset === 'mounting_plate' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Plate Width</span>
                      <span className="text-[#FF7138] font-bold">{params.width} mm</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={params.width}
                      onChange={(e) => setParams({ ...params, width: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Plate Length</span>
                      <span className="text-[#FF7138] font-bold">{params.length} mm</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={params.length}
                      onChange={(e) => setParams({ ...params, length: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Thickness</span>
                      <span className="text-[#FF7138] font-bold">{params.thickness} mm</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="25"
                      value={params.thickness}
                      onChange={(e) => setParams({ ...params, thickness: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Center Bore Diameter</span>
                      <span className="text-[#29B5A5] font-bold">Ø {params.centerBoreDia} mm</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={params.centerBoreDia}
                      onChange={(e) => setParams({ ...params, centerBoreDia: Number(e.target.value) })}
                      className="w-full accent-[#29B5A5] bg-[#101820]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Corner Bolt Holes (M-Series)</span>
                      <span className="text-[#29B5A5] font-bold">Ø {params.cornerHoleDia} mm</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="10"
                      step="0.5"
                      value={params.cornerHoleDia}
                      onChange={(e) => setParams({ ...params, cornerHoleDia: Number(e.target.value) })}
                      className="w-full accent-[#29B5A5] bg-[#101820]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Corner Fillet Radius</span>
                      <span className="text-[#F4F5F2] font-bold">{params.filletRadius} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      value={params.filletRadius}
                      onChange={(e) => setParams({ ...params, filletRadius: Number(e.target.value) })}
                      className="w-full accent-white bg-[#101820]"
                    />
                  </div>
                </div>
              )}

              {preset === 'simple_bracket' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Base Length</span>
                      <span className="text-[#FF7138] font-bold">{params.baseLength} mm</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="140"
                      value={params.baseLength}
                      onChange={(e) => setParams({ ...params, baseLength: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Upright Height</span>
                      <span className="text-[#FF7138] font-bold">{params.uprightHeight} mm</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="140"
                      value={params.uprightHeight}
                      onChange={(e) => setParams({ ...params, uprightHeight: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Gusset Rib Thickness</span>
                      <span className="text-[#29B5A5] font-bold">{params.gussetThickness} mm</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="14"
                      value={params.gussetThickness}
                      onChange={(e) => setParams({ ...params, gussetThickness: Number(e.target.value) })}
                      className="w-full accent-[#29B5A5] bg-[#101820]"
                    />
                  </div>
                </div>
              )}

              {preset === 'spacer' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Outer Diameter</span>
                      <span className="text-[#FF7138] font-bold">Ø {params.outerDia} mm</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={params.outerDia}
                      onChange={(e) => setParams({ ...params, outerDia: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Inner Bore Diameter</span>
                      <span className="text-[#29B5A5] font-bold">Ø {params.innerDia} mm</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max={params.outerDia - 6}
                      value={params.innerDia}
                      onChange={(e) => setParams({ ...params, innerDia: Number(e.target.value) })}
                      className="w-full accent-[#29B5A5] bg-[#101820]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Standoff Height</span>
                      <span className="text-[#F4F5F2] font-bold">{params.height} mm</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={params.height}
                      onChange={(e) => setParams({ ...params, height: Number(e.target.value) })}
                      className="w-full accent-white bg-[#101820]"
                    />
                  </div>
                </div>
              )}

              {(preset === 'cylindrical_adapter' || preset === 'heatsink_enclosure') && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-[#F4F5F2]/70">Primary Flange Diameter</span>
                      <span className="text-[#FF7138] font-bold">Ø {params.flangeDia || 60} mm</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="90"
                      value={params.flangeDia || 60}
                      onChange={(e) => setParams({ ...params, flangeDia: Number(e.target.value) })}
                      className="w-full accent-[#FF7138] bg-[#101820]"
                    />
                  </div>
                </div>
              )}

              {/* Material Selector */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#F4F5F2]/80">
                  Target Production Material
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full bg-[#101820] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-[#F4F5F2] focus:outline-none focus:ring-2 focus:ring-[#FF7138]"
                >
                  {RAW_MATERIALS.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.category}) — ${mat.pricePerKg}/kg
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#F4F5F2]/50 font-body leading-relaxed">
                  {selectedMaterial.description}
                </p>
              </div>

              {/* Next Steps CTA */}
              <div className="pt-4 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('/cad-analyzer')}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Run Full DFM & Machine Feasibility
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
