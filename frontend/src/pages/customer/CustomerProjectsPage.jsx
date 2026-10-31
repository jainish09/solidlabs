import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CadViewer from '../../components/cad/CadViewer';
import {
  FolderKanban,
  PlusCircle,
  Search,
  Filter,
  Layers,
  History,
  Download,
  Receipt,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Sliders,
  AlertTriangle,
  MessageSquare,
  Truck,
  Eye,
  Edit3,
  Calendar,
  Box,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const CustomerProjectsPage = () => {
  const navigate = useNavigate();
  const { requirements, quotations, orders, cadAssets = [], showToast, editRequirement } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Detailed Project Modal / View State
  const [selectedProject, setSelectedProject] = useState(null);

  // Edit requirement modal state
  const [editingProject, setEditingProject] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Re-upload revision modal
  const [uploadRevisionProject, setUploadRevisionProject] = useState(null);

  // Unify requirements and CAD assets into rich projects list
  const projectsList = useMemo(() => {
    const list = [];

    // Map requirements to projects
    requirements.forEach((req, idx) => {
      const matchingQuotes = quotations.filter((q) => q.requirementId === req.id);
      const matchingOrder = orders.find((o) => o.productName === req.productName || o.category === req.category);

      let projectStatus = 'Submitted';
      if (matchingOrder) {
        projectStatus = matchingOrder.currentStageIndex === 6 ? 'Completed' : 'In Production';
      } else if (matchingQuotes.some((q) => q.status === 'accepted')) {
        projectStatus = 'Approved';
      } else if (matchingQuotes.length > 0) {
        projectStatus = 'Quotations Received';
      } else if (req.status === 'quoted') {
        projectStatus = 'Quotations Received';
      } else if (req.status === 'open') {
        projectStatus = 'Awaiting Quotation';
      }

      list.push({
        id: req.id,
        name: req.productName,
        category: req.category || 'Automotive Component',
        dateCreated: req.submittedAt || '2026-10-28 14:30',
        lastUpdated: 'Just now',
        requiredQuantity: req.quantity || 50,
        status: projectStatus,
        dfmStatus: '100% Watertight (χ=2)',
        dfmScore: 96,
        quotesCount: matchingQuotes.length || req.quotesCount || 0,
        budgetINR: req.budgetINR || '₹4,50,000',
        material: req.material || 'Aluminum 6061-T6',
        process: req.manufacturingProcess || '5-Axis CNC Milling',
        deliveryLocation: req.deliveryLocation || 'Bengaluru Logistics Park',
        expectedDate: req.expectedDeliveryDate || '2026-11-20',
        preset: idx % 2 === 0 ? 'cylindrical_adapter' : 'simple_bracket',
        description: req.additionalInstructions || 'Precision automotive prototype component engineered for high torsional rigidity.',
        matchingQuotes,
        matchingOrder,
        revisionHistory: [
          { version: 'v1.0', date: '2026-10-26', notes: 'Initial geometry upload from SolidWorks', author: 'Alex Rivera' },
          { version: 'v1.1', date: '2026-10-27', notes: 'DFM radius optimization for 5-axis tooling', author: 'SolidLabs AI' },
          { version: 'v1.2', date: '2026-10-28', notes: 'Final drawing with GD&T datums locked', author: 'Alex Rivera' },
        ],
        files: [
          { name: `${req.productName.replace(/\s+/g, '_')}_rev1.2.step`, size: '14.2 MB', type: 'STEP' },
          { name: 'GDnT_Technical_Drawing.pdf', size: '2.4 MB', type: 'PDF' },
        ],
      });
    });

    // Also include registered CAD assets as projects
    cadAssets.slice(0, 3).forEach((asset, idx) => {
      const projId = `PRJ-CAD-${asset.id || idx + 201}`;
      if (!list.some((p) => p.name === asset.name)) {
        list.push({
          id: projId,
          name: asset.name,
          category: asset.category || 'Precision Component',
          dateCreated: '2026-10-24 10:00',
          lastUpdated: 'Oct 29, 2026',
          requiredQuantity: 100,
          status: 'Under DFM Review',
          dfmStatus: 'Euler Solid Validated',
          dfmScore: 94,
          quotesCount: 1,
          budgetINR: '₹2,80,000',
          material: asset.recommendedMaterial || 'Aluminum 6061-T6',
          process: asset.processName || 'CNC Milling',
          deliveryLocation: 'Pune Assembly Hub',
          expectedDate: '2026-11-25',
          preset: asset.preset || 'simple_bracket',
          description: asset.description || 'Parametrically generated mechanical component for automotive gantry.',
          matchingQuotes: [],
          matchingOrder: null,
          revisionHistory: [
            { version: 'v1.0', date: '2026-10-24', notes: 'Parametric seed creation', author: 'Alex Rivera' },
          ],
          files: [
            { name: `${asset.name.replace(/\s+/g, '_')}.step`, size: '8.6 MB', type: 'STEP' },
          ],
        });
      }
    });

    return list;
  }, [requirements, quotations, orders, cadAssets]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || p.status.toLowerCase().replace(/\s+/g, '') === statusFilter.toLowerCase().replace(/\s+/g, '');
      return matchesSearch && matchesStatus;
    });
  }, [projectsList, searchQuery, statusFilter]);

  const handleDownloadCad = (project) => {
    const fakeBlob = new Blob([`solid ${project.preset || 'model'}\nendsolid`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(fakeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_').toLowerCase()}.step`;
    a.click();
    showToast(`Exported ${project.name}.step file`);
  };

  const handleSaveEdit = () => {
    if (!editingProject) return;
    if (editRequirement) {
      editRequirement(editingProject.id, {
        quantity: Number(editQty) || editingProject.requiredQuantity,
        additionalInstructions: editNotes || editingProject.description,
      });
    }
    showToast(`Project ${editingProject.id} specifications updated.`);
    setEditingProject(null);
  };

  const handleUploadNewRevision = () => {
    if (!uploadRevisionProject) return;
    showToast(`New revision v1.3 uploaded for ${uploadRevisionProject.name}. Note: Suppliers with existing quotations will be prompted to re-verify.`);
    setUploadRevisionProject(null);
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="default" size="xs">Draft</Badge>;
      case 'Submitted':
        return <Badge variant="teal" size="xs">Submitted</Badge>;
      case 'Under DFM Review':
        return <Badge variant="orange" size="xs">Under DFM Review</Badge>;
      case 'Awaiting Quotation':
        return <Badge variant="teal" size="xs">Awaiting Quotation</Badge>;
      case 'Quotations Received':
        return <Badge variant="teal" size="xs" dot>Quotations Received</Badge>;
      case 'Approved':
        return <Badge variant="success" size="xs">Approved</Badge>;
      case 'In Production':
        return <Badge variant="teal" size="xs" dot>In Production</Badge>;
      case 'Completed':
        return <Badge variant="success" size="xs">Completed</Badge>;
      default:
        return <Badge variant="default" size="xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Project Management</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {projectsList.length} Total Projects
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            My Manufacturing Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body max-w-2xl">
            Track all submitted RFQs, inspect 3D geometric revisions, verify automated DFM clearance, and review quotation matrices.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/customer/post-requirement')}
          leftIcon={<PlusCircle size={15} />}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold shrink-0"
        >
          Post New Requirement
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Awaiting Quotation', 'Quotations Received', 'In Production', 'Completed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-700 text-white font-bold shadow-xs'
                  : 'bg-teal-50/60 text-slate-600 hover:bg-teal-100/70 hover:text-teal-900 border border-teal-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by part or ID..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-teal-50/40 border border-teal-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
            />
          </div>

          <div className="flex items-center border border-teal-200 rounded-xl overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold cursor-pointer ${
                viewMode === 'cards' ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 hover:bg-teal-50'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold cursor-pointer ${
                viewMode === 'table' ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 hover:bg-teal-50'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-teal-100 space-y-3 rounded-2xl">
          <FolderKanban className="mx-auto text-teal-600/40" size={40} />
          <h3 className="text-base font-bold font-heading text-slate-900">
            You haven't submitted a manufacturing project yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Start by posting a manufacturing requirement or configuring a component in AI Studio.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/post-requirement')}
            leftIcon={<PlusCircle size={15} />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Post a Requirement
          </Button>
        </Card>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-5 space-y-4 bg-white border border-teal-100 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: ID, Date, Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-800">{project.id}</span>
                  {getStatusBadge(project.status)}
                </div>

                {/* 3D CAD Preview Card Mini */}
                <div className="rounded-xl overflow-hidden border border-teal-100/80 bg-slate-50 relative group">
                  <CadViewer
                    preset={project.preset}
                    height="170px"
                    showControls={false}
                    showHud={false}
                    autoRotate={true}
                    colorTheme="metal"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/90 text-teal-900 shadow-xs border border-teal-200">
                      Euler 2-Manifold
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-[11px] text-teal-700 font-mono font-medium mt-0.5">
                    {project.category} • Batch: <strong>{project.requiredQuantity} pcs</strong>
                  </p>
                </div>

                {/* DFM & Quotes Strip */}
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/70 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">DFM Clearance:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {project.dfmStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Quotations:</span>
                    <span className="font-bold text-teal-800">
                      {project.quotesCount} {project.quotesCount === 1 ? 'Quote' : 'Quotes'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Budget:</span>
                    <span className="font-bold text-slate-900">{project.budgetINR}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Material:</span>
                    <span className="font-bold text-slate-800 truncate block">{project.material.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Created: {project.dateCreated.split(' ')[0]}</span>
                  <span>Updated: {project.lastUpdated}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-teal-100 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 text-xs border-teal-200 text-teal-800 hover:bg-teal-50"
                >
                  View Details
                </Button>

                {project.quotesCount > 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/customer/quotations')}
                    className="flex-1 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  >
                    View Quotes ({project.quotesCount})
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProject(project);
                      setEditQty(project.requiredQuantity);
                      setEditNotes(project.description);
                    }}
                    className="flex-1 text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Edit Specs
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="bg-white border border-teal-100 overflow-hidden shadow-xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-teal-50/70 border-b border-teal-100 text-[11px] font-mono uppercase text-slate-600">
                <tr>
                  <th className="p-3.5">Project ID</th>
                  <th className="p-3.5">Component</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">DFM Metrology</th>
                  <th className="p-3.5">Quotes</th>
                  <th className="p-3.5">Date Created</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50 font-mono">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="p-3.5 font-bold text-teal-800">{proj.id}</td>
                    <td className="p-3.5 font-bold font-heading text-slate-900">{proj.name}</td>
                    <td className="p-3.5 text-slate-600">{proj.category}</td>
                    <td className="p-3.5 text-slate-900 font-bold">{proj.requiredQuantity} units</td>
                    <td className="p-3.5">{getStatusBadge(proj.status)}</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">{proj.dfmStatus}</td>
                    <td className="p-3.5 text-teal-800 font-bold">{proj.quotesCount}</td>
                    <td className="p-3.5 text-slate-500">{proj.dateCreated.split(' ')[0]}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setSelectedProject(proj)}
                        className="border-teal-200 text-teal-800 hover:bg-teal-50"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FULL PROJECT DETAILS MODAL WITH ALL 9 SECTIONS */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          description={`Project Reference: ${selectedProject.id} • ${selectedProject.category}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* 1. Project Overview */}
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-900 uppercase tracking-wider">
                  1. Project Overview & Scope
                </span>
                {getStatusBadge(selectedProject.status)}
              </div>
              <p className="text-xs text-slate-700 font-body leading-relaxed">
                {selectedProject.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono border-t border-teal-200/60">
                <div><span className="text-slate-500">Target Qty:</span> <strong className="text-slate-900">{selectedProject.requiredQuantity} pcs</strong></div>
                <div><span className="text-slate-500">Target Budget:</span> <strong className="text-slate-900">{selectedProject.budgetINR}</strong></div>
                <div><span className="text-slate-500">Delivery Target:</span> <strong className="text-teal-800">{selectedProject.expectedDate}</strong></div>
                <div><span className="text-slate-500">Destination:</span> <strong className="text-slate-900">{selectedProject.deliveryLocation}</strong></div>
              </div>
            </div>

            {/* 2. Uploaded CAD Files & 3D Interactive Viewport */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                2. Uploaded CAD Models & Technical 2D Drawings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-7 rounded-2xl border border-teal-100 overflow-hidden bg-slate-50">
                  <CadViewer
                    preset={selectedProject.preset}
                    height="240px"
                    showControls={true}
                    showHud={true}
                    autoRotate={true}
                    colorTheme="metal"
                  />
                </div>
                <div className="md:col-span-5 space-y-2">
                  {selectedProject.files.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl border border-teal-100 bg-white flex items-center justify-between text-xs font-mono shadow-2xs">
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[170px]">{f.name}</p>
                        <span className="text-[10px] text-slate-400">{f.size} • {f.type}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleDownloadCad(selectedProject)}
                        leftIcon={<Download size={12} />}
                        className="border-teal-200"
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const proj = selectedProject;
                      setSelectedProject(null);
                      setUploadRevisionProject(proj);
                    }}
                    leftIcon={<UploadCloud size={14} />}
                    className="w-full text-xs border-teal-300 text-teal-800 hover:bg-teal-50"
                  >
                    Upload Revised CAD File
                  </Button>
                </div>
              </div>
            </div>

            {/* 3. Design Versions & Revision History */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                <History size={14} className="text-teal-600" />
                <span>3. Design Versions & Immutable Revision History</span>
              </h4>
              <div className="border border-teal-100 rounded-2xl overflow-hidden divide-y divide-teal-50 text-xs font-mono">
                {selectedProject.revisionHistory.map((rev, i) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[10px]">
                        {rev.version}
                      </span>
                      <span className="text-slate-700">{rev.notes}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <span>{rev.date} • {rev.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. DFM Analysis Results */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                <FileCheck2 size={14} className="text-teal-600" />
                <span>4. Automated DFM Analysis Results</span>
              </h4>
              <div className="p-4 bg-white rounded-2xl border border-teal-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Watertight Boundary:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Euler 2-Manifold (χ=2)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tooling Access:</span>
                  <span className="font-bold text-teal-800">5-Axis Cleared (No undercuts)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">DFM Rating:</span>
                  <span className="font-bold text-teal-800">{selectedProject.dfmScore} / 100 Feasibility</span>
                </div>
              </div>
            </div>

            {/* 5. AI Customization Options */}
            <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-teal-700" />
                <div>
                  <p className="font-bold text-slate-900">AI Parametric Customization Studio</p>
                  <p className="text-[11px] text-slate-600">Modify bounding envelope, bore diameters, or mounting bolt patterns.</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={() => {
                  setSelectedProject(null);
                  navigate('/customize/prod_001');
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                Launch Studio
              </Button>
            </div>

            {/* 6. Manufacturing Requirements */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                6. Manufacturing & Material Specifications
              </h4>
              <div className="p-4 bg-white rounded-2xl border border-teal-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div><span className="text-slate-500 block">Technology:</span> <strong className="text-slate-900">{selectedProject.process}</strong></div>
                <div><span className="text-slate-500 block">Material:</span> <strong className="text-slate-900">{selectedProject.material}</strong></div>
                <div><span className="text-slate-500 block">Surface Finish:</span> <strong className="text-slate-900">Ra 1.2 µm (Bead Blasted)</strong></div>
                <div><span className="text-slate-500 block">Tolerances:</span> <strong className="text-slate-900">ISO 2768-f (±0.025 mm)</strong></div>
                <div><span className="text-slate-500 block">Accreditation:</span> <strong className="text-slate-900">AS9100D / ISO 9001</strong></div>
                <div><span className="text-slate-500 block">Metrology:</span> <strong className="text-teal-800">Zeiss CMM 100%</strong></div>
              </div>
            </div>

            {/* 7. Related Quotations */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center justify-between">
                <span>7. Related Formal Quotations ({selectedProject.matchingQuotes.length})</span>
                {selectedProject.matchingQuotes.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      navigate('/customer/quotations');
                    }}
                    className="text-teal-700 hover:underline cursor-pointer"
                  >
                    Compare Side-by-Side
                  </button>
                )}
              </h4>
              {selectedProject.matchingQuotes.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono">
                  No supplier quotes received yet. Machine shops are evaluating your geometry.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.matchingQuotes.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-white border border-teal-100 space-y-1 text-xs font-mono shadow-2xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-teal-800">{q.id}</span>
                        <span className="font-extrabold text-slate-900">₹{q.finalPriceINR.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-slate-600 truncate">{q.manufacturerName}</p>
                      <div className="pt-1 flex justify-between items-center text-[10px]">
                        <span className="text-teal-700 font-semibold">{q.estimatedCompletionDays} Days</span>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => {
                            setSelectedProject(null);
                            navigate('/customer/quotations');
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Review Bid
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Associated Orders */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                8. Associated Orders & Production Dispatch
              </h4>
              {selectedProject.matchingOrder ? (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-teal-900">{selectedProject.matchingOrder.orderNumber}</span>
                    <p className="text-slate-600 text-[11px]">Carrier: {selectedProject.matchingOrder.carrier} ({selectedProject.matchingOrder.trackingNumber})</p>
                  </div>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      setSelectedProject(null);
                      navigate('/customer/orders');
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    View Order Details
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono">
                  No active orders created yet. Accept a quotation above to trigger automated order dispatch.
                </div>
              )}
            </div>

            {/* 9. Messages and Activity History */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center justify-between">
                <span>9. Supplier Communication & Activity Log</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(null);
                    navigate('/customer/messages');
                  }}
                  className="text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>Open Connect Messaging</span>
                </button>
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                Direct channel established with verified machining facilities. Discuss custom tolerances, raw alloy stock, or schedule shop floor visits.
              </div>
            </div>

            {/* Change Warning Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> If geometry or material specifications are changed after formal quotation approval, participating machine shops will be required to re-evaluate toolpaths and reissue price quotations.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-teal-100">
            <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const proj = selectedProject;
                setSelectedProject(null);
                setEditingProject(proj);
                setEditQty(proj.requiredQuantity);
                setEditNotes(proj.description);
              }}
              leftIcon={<Edit3 size={14} />}
              className="border-teal-200 text-teal-800"
            >
              Edit Requirements
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const proj = selectedProject;
                setSelectedProject(null);
                navigate('/customer/quotations');
              }}
              rightIcon={<ArrowRight size={14} />}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              Review Quotations
            </Button>
          </div>
        </Modal>
      )}

      {/* MODAL: EDIT REQUIREMENTS */}
      {editingProject && (
        <Modal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title={`Edit Requirements — ${editingProject.id}`}
          description={`Update parameters for ${editingProject.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              Note: Updating quantities or drawing notes will update the RFQ broadcast for quoting manufacturers.
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-600 block mb-1 font-semibold">
                Required Batch Quantity (pcs)
              </label>
              <input
                type="number"
                min="1"
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-600 block mb-1 font-semibold">
                Additional Instructions / GD&T Notes
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2.5 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-teal-100">
              <Button variant="outline" size="sm" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit} className="bg-teal-600 text-white font-bold">
                Save & Update RFQ
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: UPLOAD REVISED CAD FILE */}
      {uploadRevisionProject && (
        <Modal
          isOpen={!!uploadRevisionProject}
          onClose={() => setUploadRevisionProject(null)}
          title="Upload Revised CAD Design"
          description={`Increment revision tree for ${uploadRevisionProject.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Revision Notice:</strong> Uploading a new geometric revision (v1.3) will invalidate previously issued supplier quotations and prompt automated DFM re-check.
            </div>

            <div className="border-2 border-dashed border-teal-300 rounded-2xl p-6 text-center bg-teal-50/40">
              <UploadCloud className="mx-auto text-teal-600 mb-1" size={32} />
              <p className="text-xs font-bold text-slate-900">Drop STEP or STL file to replace model</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Automated Euler manifold check on upload</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-teal-100">
              <Button variant="outline" size="sm" onClick={() => setUploadRevisionProject(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUploadNewRevision} className="bg-teal-600 text-white font-bold">
                Confirm & Upload v1.3
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerProjectsPage;
