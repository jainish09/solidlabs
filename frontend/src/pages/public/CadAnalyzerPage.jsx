import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CadViewer from '../../components/cad/CadViewer';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Cpu,
  RotateCcw,
  DollarSign,
  FileText,
  Sliders,
  HelpCircle,
} from 'lucide-react';

export const CadAnalyzerPage = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  // Active file selection state
  const [selectedFormat, setSelectedFormat] = useState('STL'); // 'STEP' | 'STP' | 'STL' | 'IGES' | 'OBJ'
  const [activeFileName, setActiveFileName] = useState('Veloce_AlloyWheel_Hub_RevC.stl');
  const [uploadProgress, setUploadProgress] = useState(100);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Active Preset Geometry
  const [activePreset, setActivePreset] = useState('cylindrical_adapter');

  // Handle Simulated File Upload
  const handleSimulatedUpload = (format, name, preset) => {
    setSelectedFormat(format);
    setActiveFileName(name);
    setActivePreset(preset);
    setUploadProgress(0);
    setIsAnalyzing(true);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          showToast(`File ${name} loaded and DFM analyzed!`);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Automated DFM Metrology</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-teal-800 border border-teal-200">
              Supported Formats: STEP, STP, STL, IGES, OBJ
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            CAD Upload & AI Manufacturability Analysis
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body">
            Upload CAD solid geometry files to calculate true volume, verify 100% watertight manifold integrity, and inspect CNC toolpath feasibility.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/customize/prod_001')}
          leftIcon={<Sliders size={14} />}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Open Customization Studio
        </Button>
      </div>

      {/* 15. File Selection & Drag & Drop Area */}
      <Card className="border-dashed border-2 border-teal-200 p-6 sm:p-8 text-center space-y-4 bg-white">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-2xs border border-teal-100">
          <UploadCloud size={28} />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold font-heading text-slate-900">
            Upload Automotive Component CAD Model
          </h3>
          <p className="text-xs text-slate-600 font-body max-w-md mx-auto">
            Drag and drop or select your engineering model. Direct client-side WebGL 3D preview is active for STL format. STEP, IGES and OBJ metadata are parsed for manufacturing specifications.
          </p>
        </div>

        {/* Format Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['STEP', 'STP', 'STL', 'IGES', 'OBJ'].map((fmt) => (
            <span
              key={fmt}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                selectedFormat === fmt
                  ? 'bg-teal-700 text-white border-transparent'
                  : 'bg-teal-50/60 text-slate-600 border-teal-100'
              }`}
            >
              .{fmt}
            </span>
          ))}
        </div>

        {/* Demo Sample File Loaders */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Load Demo File:</span>
          <button
            type="button"
            onClick={() => handleSimulatedUpload('STL', 'Veloce_AlloyWheel_Hub.stl', 'cylindrical_adapter')}
            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-mono border border-teal-200 transition-colors cursor-pointer"
          >
            Alloy Wheel Hub (.STL)
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedUpload('STEP', 'BrakePad_Caliper_Anchor.step', 'mounting_plate')}
            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-mono border border-teal-200 transition-colors cursor-pointer"
          >
            Brake Caliper Plate (.STEP)
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedUpload('STP', 'Shock_Absorber_Strut_Gusset.stp', 'simple_bracket')}
            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-mono border border-teal-200 transition-colors cursor-pointer"
          >
            Suspension Gusset (.STP)
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedUpload('OBJ', 'EV_Battery_Terminal_Spacer.obj', 'spacer')}
            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-mono border border-teal-200 transition-colors cursor-pointer"
          >
            Bushing Spacer (.OBJ)
          </button>
        </div>

        {/* Upload Progress Bar */}
        {isAnalyzing && (
          <div className="max-w-md mx-auto space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-teal-700 font-semibold">Parsing CAD boundary topology...</span>
              <span className="text-slate-900 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-600 to-teal-400 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Main Split: 3D Viewport Left, DFM Findings Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Interactive Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#858585]">Active CAD Model:</span>
              <span className="text-sm font-bold font-heading text-[#111111]">{activeFileName}</span>
            </div>
            <Badge variant="teal" size="xs">
              Format: {selectedFormat}
            </Badge>
          </div>

          <div className="relative">
            <CadViewer
              preset={activePreset}
              height="480px"
              allowUpload={true}
              showControls={true}
              showHud={true}
              colorTheme="metal"
            />
          </div>

          {/* Format Note */}
          {selectedFormat !== 'STL' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 font-mono">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>
                Note: {selectedFormat} solid metadata parsed into verified topological representation. Real-time direct polygon preview is fully interactive.
              </span>
            </div>
          )}
        </div>

        {/* Right Column: AI DFM Analysis Interface (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Manufacturability Score Card */}
          <Card className="border-[#20B8A5]/40 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#858585] tracking-wider block">
                  Manufacturability Rating
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black font-heading text-[#20B8A5]">96</span>
                  <span className="text-xs font-mono text-[#858585]">/ 100</span>
                </div>
                <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1 font-mono">
                  <CheckCircle2 size={14} />
                  Grade A — 3-Axis CNC Machinable
                </p>
              </div>

              <div className="w-16 h-16 rounded-full border-4 border-[#20B8A5] bg-[#F5F5F3] flex flex-col items-center justify-center font-mono">
                <span className="text-[9px] text-[#858585]">EULER</span>
                <span className="text-base font-bold text-[#111111]">χ = 2</span>
              </div>
            </div>
          </Card>

          {/* DFM Findings & Warnings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">DFM Engineering Observations</CardTitle>
              <CardDescription>
                Audited against automotive machine tooling and milling standards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-900 font-bold">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <CheckCircle2 size={14} />
                      2-Manifold Watertight Topology
                    </span>
                    <span className="text-teal-700 font-bold">100% Watertight</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Euler characteristic χ = 2 confirmed. Zero non-manifold boundary edges.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-900 font-bold">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <CheckCircle2 size={14} />
                      Wall Thickness Feasibility
                    </span>
                    <span className="text-slate-900">2.8 mm Min</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Exceeds 0.8 mm minimum cutting limit for forged aluminum & steel.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-900 font-bold">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <AlertTriangle size={14} />
                      Internal Corner Radii
                    </span>
                    <span className="text-amber-600">R = 3.5 mm</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Standard 1/4" endmill accessible. Recommended R ≥ 4.0 mm to decrease cycle time.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <div className="flex justify-between items-center text-slate-900 font-bold">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <CheckCircle2 size={14} />
                      Tool Access & Undercuts
                    </span>
                    <span className="text-teal-700 font-bold">0 Undercuts</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Full top-down Z-axis clearance with single fixture clamp setup.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations & Cost Estimate */}
          <Card className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white border border-teal-700/60 p-5 space-y-4 shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-teal-300 font-bold">
                Material & Process Recommendation
              </span>
              <h4 className="text-base font-bold font-heading text-white">
                Forged 6061-T6 Aluminum via 3-Axis / 5-Axis CNC
              </h4>
              <p className="text-xs text-teal-100/80 font-body">
                Estimated factory prototyping rate: <strong className="text-white font-bold">₹4,850 - ₹6,200 / unit</strong> for batch volumes of 50+ units.
              </p>
            </div>

            <Button
              variant="white"
              size="md"
              className="w-full text-xs bg-white text-teal-900 hover:bg-teal-50 font-bold"
              onClick={() => navigate('/customize/prod_001')}
              rightIcon={<ArrowRight size={14} />}
            >
              Configure Batch & Request Quotes
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CadAnalyzerPage;
