import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import {
  PlusCircle,
  UploadCloud,
  FileCheck2,
  FileText,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  Calendar,
  MapPin,
  Trash2,
  Download,
  Info,
} from 'lucide-react';

const INDUSTRIES_LIST = [
  'Automotive & EV Mobility',
  'Aerospace & Defence',
  'Electronics & Semiconductors',
  'Medical Devices & Implants',
  'Industrial Heavy Machinery',
  'Precision Robotics & Automation',
];

const PROCESSES_LIST = [
  { id: 'cnc_5axis', name: '5-Axis CNC Milling', desc: 'Simultaneous 5-axis machining for complex 3D profiles and deep cavities.' },
  { id: 'cnc_3axis', name: '3-Axis CNC Milling', desc: 'Standard high-speed machining for flat plates, pockets, and mounting tabs.' },
  { id: 'cnc_lathe', name: 'CNC Turning & Live Tooling', desc: 'Precision cylindrical shafts, stepped bushings, and flanges.' },
  { id: 'sls_print', name: 'Industrial SLS 3D Printing', desc: 'Isotropic nylon mechanical parts with complex internal channels.' },
  { id: 'sheet_metal', name: 'Sheet Metal CNC Bending', desc: 'Precision laser cutting and automated press-brake bending.' },
];

const MATERIALS_LIST = [
  'Aluminum 6061-T6 (Aerospace Grade)',
  'Aluminum 7075-T6 (High-Strength Aircraft)',
  'Stainless Steel 316L (Corrosion Resistant)',
  'Titanium Ti-6Al-4V (Grade 5)',
  'Carbon-Ceramic Friction Matrix',
  'Delrin POM-C Engineering Polymer',
];

const SURFACE_FINISHES = [
  'As-Machined (Ra 3.2 µm)',
  'Fine Machined (Ra 1.6 µm)',
  'Bead Blasted Satin (Ra 1.2 µm)',
  'Hard Anodized Type III (Black / Clear)',
  'Electropolished Cleanroom Grade',
  'Zinc-Nickel Plated (Anti-Corrosion)',
];

const TOLERANCE_LEVELS = [
  'Standard: ISO 2768-m (±0.10 mm)',
  'Precision: ISO 2768-f (±0.025 mm)',
  'Ultra-Precision: Metrology Ground (±0.010 mm)',
];

export const CustomerPostRequirementPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, postRequirement, showToast } = useAuth();

  const prefilledPart = searchParams.get('part') || '';
  const prefilledMfg = searchParams.get('mfg') || '';

  // 5 Step Wizard: 1: Product Info, 2: Upload Design, 3: Mfg Specs, 4: DFM Audit, 5: Review
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: prefilledPart || 'Custom Machined Stator Housing',
    industry: 'Automotive & EV Mobility',
    description: prefilledMfg
      ? `Requesting direct manufacturing quote from ${prefilledMfg}. Drawing adheres to ISO 2768-f.`
      : 'Precision engineered liquid-cooled component for high-voltage automotive powertrain.',
    quantity: 50,
    intendedApplication: 'Direct mounting to electric vehicle axle powertrain housing.',
    targetBudgetINR: '₹4,50,000',

    // Files uploaded
    uploadedFiles: [
      { name: 'Stator_Housing_revB.step', size: '14.2 MB', type: 'STEP CAD', status: 'Parsed & Watertight' },
      { name: 'Engineering_Drawing_2D_GDnT.pdf', size: '2.8 MB', type: 'PDF Drawing', status: 'Tolerance Checked' },
    ],

    // Mfg specs
    process: '5-Axis CNC Milling',
    material: 'Aluminum 6061-T6 (Aerospace Grade)',
    surfaceFinish: 'Bead Blasted Satin (Ra 1.2 µm)',
    tolerance: 'Precision: ISO 2768-f (±0.025 mm)',
    certifications: ['ISO 9001:2015', 'AS9100D', 'Zeiss CMM Inspection Certificate'],
    assemblyRequirements: 'Press-fit oil seals and dowel pins to be included prior to dispatch.',
    deliveryLocation: 'Bengaluru Logistics Park, Karnataka, India',
    preferredDeliveryDate: '2026-11-28',
    additionalInstructions: 'All outer faces require batch barcode laser etching. Packaging must be sealed VCI anti-corrosion.',
  });

  // Submission State
  const [submittedReqId, setSubmittedReqId] = useState(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newUploaded = files.map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.name.split('.').pop().toUpperCase(),
      status: 'Parsed & Watertight',
    }));

    setFormData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newUploaded],
    }));

    showToast(`Uploaded and validated ${files.length} design files.`);
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReq = postRequirement({
      productName: formData.name,
      category: formData.industry.split(' ')[0],
      quantity: Number(formData.quantity),
      budgetINR: formData.targetBudgetINR,
      budgetNumeric: Number(formData.targetBudgetINR.replace(/[^0-9]/g, '')) || 450000,
      material: formData.material,
      deliveryLocation: formData.deliveryLocation,
      expectedDeliveryDate: formData.preferredDeliveryDate,
      manufacturingProcess: formData.process,
      customizedSpecs: {
        tolerance: formData.tolerance,
        surfaceFinish: formData.surfaceFinish,
        certifications: formData.certifications.join(', '),
        intendedApplication: formData.intendedApplication,
      },
      additionalInstructions: formData.additionalInstructions,
    });

    setSubmittedReqId(newReq.id);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-teal-100 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="teal" size="xs" dot>Guided Procurement</Badge>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
            5-Step RFQ Wizard
          </span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          Post Manufacturing Requirement
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body">
          Define part specifications, upload CAD geometries, run automated DFM feasibility, and broadcast to accredited machine shops.
        </p>
      </div>

      {submittedReqId ? (
        /* Confirmation Screen */
        <Card className="p-8 sm:p-12 text-center bg-white border border-teal-200 space-y-6 shadow-md rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <Badge variant="teal" size="sm">Broadcast Confirmed</Badge>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              Requirement Posted Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed">
              Your requirement <strong className="text-teal-800 font-mono text-base">{submittedReqId}</strong> for{' '}
              <strong className="text-slate-900">{formData.name}</strong> has been distributed to certified machine shops.
              You will receive transparent INR quotations within 2 to 6 hours.
            </p>
          </div>

          <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 max-w-md mx-auto text-xs font-mono space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Requirement ID:</span>
              <span className="font-bold text-slate-900">{submittedReqId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Quantity:</span>
              <span className="font-bold text-slate-900">{formData.quantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Process & Material:</span>
              <span className="font-bold text-teal-800">{formData.process} • {formData.material.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Target:</span>
              <span className="font-bold text-slate-900">{formData.preferredDeliveryDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSubmittedReqId(null);
                setCurrentStep(1);
              }}
              className="border-slate-300"
            >
              Post Another Requirement
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/customer/projects')}
              rightIcon={<ArrowRight size={16} />}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6"
            >
              Go to My Projects
            </Button>
          </div>
        </Card>
      ) : (
        /* 5-Step Guided Stepper & Form */
        <div className="space-y-6">
          {/* Stepper Navigation Bar */}
          <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
              {[
                { step: 1, label: 'Product Info' },
                { step: 2, label: 'Upload Design' },
                { step: 3, label: 'Manufacturing' },
                { step: 4, label: 'DFM Feasibility' },
                { step: 5, label: 'Review & Submit' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    currentStep === s.step
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : currentStep > s.step
                      ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="block text-[10px] opacity-75">Step {s.step}</span>
                  <span className="truncate block font-heading">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Product Information */}
          {currentStep === 1 && (
            <Card className="p-6 sm:p-8 space-y-6 bg-white border border-teal-100">
              <div className="border-b border-teal-50 pb-3">
                <h2 className="text-lg font-bold font-heading text-slate-900">
                  Step 1: Product Information
                </h2>
                <p className="text-xs text-slate-500 font-body">
                  Provide standard component details, intended vehicle/device application, and target batch size.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Product / Component Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 5-Axis Liquid Cooled Stator Housing"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1.5 font-semibold">
                    Target Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
                  >
                    {INDUSTRIES_LIST.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Required Batch Quantity (pcs) *"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1.5 font-semibold">
                    Product Description & Geometry Purpose
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe functional purpose, critical GD&T datums, or OEM assembly constraints..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Intended Application / Operating Environment"
                    value={formData.intendedApplication}
                    onChange={(e) => setFormData({ ...formData, intendedApplication: e.target.value })}
                    placeholder="e.g. High-torque powertrain motor casing exposed to transmission coolant"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-teal-100">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  rightIcon={<ArrowRight size={16} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6"
                >
                  Continue to Design Upload
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Upload Design */}
          {currentStep === 2 && (
            <Card className="p-6 sm:p-8 space-y-6 bg-white border border-teal-100">
              <div className="border-b border-teal-50 pb-3">
                <h2 className="text-lg font-bold font-heading text-slate-900">
                  Step 2: Upload Technical CAD & 2D Drawings
                </h2>
                <p className="text-xs text-slate-500 font-body">
                  Supported engineering files: STEP (.step, .stp), STL (.stl), IGES (.iges, .igs), Wavefront (.obj), and PDF 2D drawings.
                </p>
              </div>

              {/* Drag & Drop Zone */}
              <div className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-8 text-center bg-teal-50/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".step,.stp,.stl,.iges,.igs,.obj,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <UploadCloud className="mx-auto text-teal-600" size={40} />
                  <p className="text-sm font-bold font-heading text-slate-900">
                    Click to select CAD models or drag files here
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    STEP, STP, STL, IGES, OBJ, or PDF (Max 150 MB per file)
                  </p>
                </div>
              </div>

              {/* Uploaded Files Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Attached Technical Files ({formData.uploadedFiles.length})
                </h3>

                <div className="space-y-2">
                  {formData.uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-teal-100 rounded-xl flex items-center justify-between text-xs font-mono shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-1 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 text-[10px]">
                          {file.type}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{file.name}</p>
                          <span className="text-[10px] text-slate-400">{file.size}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 size={12} /> {file.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-teal-100">
                <Button variant="outline" size="md" onClick={() => setCurrentStep(1)} leftIcon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  rightIcon={<ArrowRight size={16} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6"
                >
                  Continue to Manufacturing Specs
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Manufacturing Requirements */}
          {currentStep === 3 && (
            <Card className="p-6 sm:p-8 space-y-6 bg-white border border-teal-100">
              <div className="border-b border-teal-50 pb-3">
                <h2 className="text-lg font-bold font-heading text-slate-900">
                  Step 3: Manufacturing & Material Requirements
                </h2>
                <p className="text-xs text-slate-500 font-body">
                  Select machining technology, certified raw alloy, surface finish, and drawing tolerances.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Process */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1.5 font-semibold">
                    Machining Process *
                  </label>
                  <select
                    value={formData.process}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {PROCESSES_LIST.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Material */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1.5 font-semibold">
                    Raw Material Alloy *
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {MATERIALS_LIST.map((mat) => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>

                {/* Surface Finish */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1.5 font-semibold">
                    Surface Roughness & Coating
                  </label>
                  <select
                    value={formData.surfaceFinish}
                    onChange={(e) => setFormData({ ...formData, surfaceFinish: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {SURFACE_FINISHES.map((sf) => (
                      <option key={sf} value={sf}>{sf}</option>
                    ))}
                  </select>
                </div>

                {/* Tolerances */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1.5 font-semibold">
                    Engineering Tolerances (GD&T)
                  </label>
                  <select
                    value={formData.tolerance}
                    onChange={(e) => setFormData({ ...formData, tolerance: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {TOLERANCE_LEVELS.map((tol) => (
                      <option key={tol} value={tol}>{tol}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery Location */}
                <div>
                  <Input
                    label="Consignment Delivery Location *"
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                    required
                  />
                </div>

                {/* Preferred Date */}
                <div>
                  <Input
                    label="Preferred Target Delivery Date *"
                    type="date"
                    value={formData.preferredDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, preferredDeliveryDate: e.target.value })}
                    required
                  />
                </div>

                {/* Target Budget */}
                <div>
                  <Input
                    label="Target Budget Indication (INR)"
                    value={formData.targetBudgetINR}
                    onChange={(e) => setFormData({ ...formData, targetBudgetINR: e.target.value })}
                    placeholder="e.g. ₹4,50,000"
                  />
                </div>

                {/* Assembly */}
                <div>
                  <Input
                    label="Sub-Assembly Requirements"
                    value={formData.assemblyRequirements}
                    onChange={(e) => setFormData({ ...formData, assemblyRequirements: e.target.value })}
                    placeholder="e.g. Press-fit bushings or threaded heli-coils"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-teal-100">
                <Button variant="outline" size="md" onClick={() => setCurrentStep(2)} leftIcon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(4)}
                  rightIcon={<ArrowRight size={16} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6"
                >
                  Run DFM Feasibility Analysis
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Engineering Analysis (DFM Functionality Integrated) */}
          {currentStep === 4 && (
            <Card className="p-6 sm:p-8 space-y-6 bg-white border border-teal-100">
              <div className="border-b border-teal-50 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="text-teal-600" size={20} />
                    <span>Step 4: Automated DFM Feasibility Audit</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-body">
                    Automated browser-side geometric kernel verification for CNC machine toolpaths and watertightness.
                  </p>
                </div>
                <Badge variant="teal" size="sm" dot>Euler 2-Manifold χ=2</Badge>
              </div>

              {/* DFM Audit Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-teal-800 font-bold block">
                    Manufacturability Score
                  </span>
                  <p className="text-3xl font-extrabold font-heading text-teal-900">96 / 100</p>
                  <p className="text-[11px] text-teal-700 font-mono">Cleared for 5-Axis CNC Milling</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-teal-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                    Watertight Manifold Check
                  </span>
                  <p className="text-base font-bold font-heading text-emerald-600 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={16} /> 100% Watertight
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">Zero unclosed boundaries (χ=2)</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-teal-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                    Thin Wall Thickness Check
                  </span>
                  <p className="text-base font-bold font-heading text-slate-900 mt-1">
                    Min 1.82 mm (Pass)
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">Threshold for 6061-T6 is 1.2 mm</p>
                </div>
              </div>

              {/* DFM Warnings & Recommendations */}
              <div className="space-y-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/80">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
                  <Info size={14} className="text-teal-600" />
                  Engineering Observations & Process Recommendations
                </h4>

                <ul className="space-y-2 text-xs font-body text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Toolpath Access:</strong> Deep cavity pockets have a 3.2:1 aspect ratio, fully reachable with standard extended-reach end mills on a 5-axis trunnion table.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Suggested Improvement:</strong> Internal bottom fillet radius is 1.5 mm. Increasing to 2.5 mm will reduce CNC machining cycle time by ~12% with lower tooling wear.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Surface Tolerance:</strong> Ra 1.2 µm bead-blasting is suitable and will remove tool marks uniformly.
                    </span>
                  </li>
                </ul>

                {/* AI Parametric Link */}
                <div className="pt-2 flex items-center justify-between border-t border-teal-100/60 text-xs">
                  <span className="text-slate-500 font-mono">Need parametric dimension modifications?</span>
                  <button
                    type="button"
                    onClick={() => navigate('/customize/prod_001')}
                    className="text-teal-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders size={13} />
                    <span>Open AI Parametric Studio</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-teal-100">
                <Button variant="outline" size="md" onClick={() => setCurrentStep(3)} leftIcon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(5)}
                  rightIcon={<ArrowRight size={16} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6"
                >
                  Proceed to Final Review
                </Button>
              </div>
            </Card>
          )}

          {/* Step 5: Final Review */}
          {currentStep === 5 && (
            <Card className="p-6 sm:p-8 space-y-6 bg-white border border-teal-100">
              <div className="border-b border-teal-50 pb-3">
                <h2 className="text-lg font-bold font-heading text-slate-900">
                  Step 5: Final Review & Broadcast RFQ
                </h2>
                <p className="text-xs text-slate-500 font-body">
                  Confirm all technical specifications and file attachments before distributing your requirement to verified machine shops.
                </p>
              </div>

              {/* Review Sections */}
              <div className="space-y-4 text-xs font-mono">
                {/* 1. Component Summary */}
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/80 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-teal-100/60">
                    <span className="font-bold text-slate-900 font-heading text-sm">1. Component Details</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-teal-700 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Component:</span> <strong className="text-slate-900">{formData.name}</strong></div>
                    <div><span className="text-slate-500">Industry:</span> <strong className="text-slate-900">{formData.industry}</strong></div>
                    <div><span className="text-slate-500">Quantity:</span> <strong className="text-teal-800">{formData.quantity} units</strong></div>
                    <div><span className="text-slate-500">Target Budget:</span> <strong className="text-slate-900">{formData.targetBudgetINR}</strong></div>
                  </div>
                </div>

                {/* 2. Files Summary */}
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/80 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-teal-100/60">
                    <span className="font-bold text-slate-900 font-heading text-sm">2. Design & Technical Files</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-teal-700 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {formData.uploadedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between text-slate-700">
                        <span>• {f.name} ({f.size})</span>
                        <span className="text-emerald-700 font-semibold">{f.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Manufacturing Specs Summary */}
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/80 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-teal-100/60">
                    <span className="font-bold text-slate-900 font-heading text-sm">3. Manufacturing Specifications</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-teal-700 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Machining:</span> <strong className="text-slate-900">{formData.process}</strong></div>
                    <div><span className="text-slate-500">Material:</span> <strong className="text-slate-900">{formData.material}</strong></div>
                    <div><span className="text-slate-500">Surface Finish:</span> <strong className="text-slate-900">{formData.surfaceFinish}</strong></div>
                    <div><span className="text-slate-500">Tolerance:</span> <strong className="text-slate-900">{formData.tolerance}</strong></div>
                    <div><span className="text-slate-500">Delivery Target:</span> <strong className="text-teal-800">{formData.preferredDeliveryDate}</strong></div>
                    <div><span className="text-slate-500">Location:</span> <strong className="text-slate-900">{formData.deliveryLocation}</strong></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-teal-100">
                <Button variant="outline" size="md" onClick={() => setCurrentStep(4)} leftIcon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  rightIcon={<ArrowRight size={18} />}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 shadow-md shadow-teal-600/25"
                >
                  Submit Requirement & Broadcast RFQ
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPostRequirementPage;
