import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CadViewer from '../../components/cad/CadViewer';
import {
  Box,
  Layers,
  History,
  Download,
  Receipt,
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
  ShieldCheck,
  FileCheck2,
  FolderKanban,
  Sliders,
} from 'lucide-react';

export const CustomerAssetsPage = () => {
  const { cadAssets, showToast } = useAuth();
  const navigate = useNavigate();

  // Active asset for 3D inspection modal
  const [inspectingAsset, setInspectingAsset] = useState(null);
  // Active asset for Revision History modal
  const [revisionAsset, setRevisionAsset] = useState(null);
  // Active asset for Marketplace Publish modal
  const [publishAsset, setPublishAsset] = useState(null);
  const [ipConfirmed, setIpConfirmed] = useState(false);

  const handleDownloadStl = (asset) => {
    const fakeBlob = new Blob([`solid ${asset.preset || 'model'}\nendsolid`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(fakeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.name.replace(/\s+/g, '_').toLowerCase()}.stl`;
    a.click();
    showToast(`Exported ${asset.name}.stl package`);
  };

  const handlePublishToMarketplace = () => {
    if (!ipConfirmed) {
      alert('Please confirm that you own all intellectual property rights to this design.');
      return;
    }
    showToast(`"${publishAsset.name}" submitted for marketplace listing!`);
    setPublishAsset(null);
    setIpConfirmed(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" dot>CAD Version Control</Badge>
            <Badge variant="teal">Immutable Revision Trees</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            CAD Projects & Revision History
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Centralized engineering asset repository with automatic geometric metrics, DFM metrology logs, and revision branching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/cad-analyzer')}
            leftIcon={<UploadCloud size={16} />}
          >
            Upload CAD Model
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customize/prod_001')}
            leftIcon={<Sliders size={16} />}
          >
            AI Studio Synthesizer
          </Button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cadAssets.map((asset) => (
          <Card key={asset.id} className="flex flex-col justify-between group hover:border-[#111111] transition-all">
            <div>
              {/* Preview Box */}
              <div
                onClick={() => setInspectingAsset(asset)}
                className="relative h-48 w-full rounded-xl overflow-hidden bg-white mb-4 border border-gray-200 cursor-pointer group-hover:border-[#FF7138] transition-all"
              >
                <CadViewer
                  preset={asset.preset || 'mounting_plate'}
                  height="100%"
                  showControls={false}
                  showHud={false}
                  autoRotate={false}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                  <Badge variant="teal" size="xs">
                    {asset.activeRevision || 'v1.0'}
                  </Badge>
                  <Badge variant="success" size="xs">
                    Watertight
                  </Badge>
                </div>
              </div>

              {/* Title & Stats */}
              <div className="space-y-1">
                <h3 className="text-base font-bold font-heading text-[#111111] line-clamp-1">
                  {asset.name}
                </h3>
                <p className="text-xs font-mono text-[#858585]">
                  Dimensions: {asset.dimensions?.x || 80} × {asset.dimensions?.y || 80} × {asset.dimensions?.z || 8} mm
                </p>
              </div>

              {/* Engineering Specs */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-[#F5F5F3] rounded-lg border border-gray-200">
                  <span className="text-[10px] text-[#858585] uppercase block font-semibold">True Volume</span>
                  <span className="text-[#20B8A5] font-bold">{(asset.volume_mm3 / 1000).toFixed(1)} cm³</span>
                </div>
                <div className="p-2.5 bg-[#F5F5F3] rounded-lg border border-gray-200">
                  <span className="text-[10px] text-[#858585] uppercase block font-semibold">DFM Score</span>
                  <span className="text-[#111111] font-bold">{asset.dfmScore || 95}/100</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setRevisionAsset(asset)}
                className="text-xs font-mono text-[#858585] hover:text-[#FF7138] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <History size={14} />
                <span>{asset.revisionsCount || 1} Revisions</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadStl(asset)}
                  title="Export STL"
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPublishAsset(asset)}
                  title="Publish to Marketplace"
                >
                  <Share2 size={14} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/customer/requirements')}
                  title="Request Instant RFQ"
                >
                  RFQ
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3D Inspection Modal */}
      {inspectingAsset && (
        <Modal
          isOpen={!!inspectingAsset}
          onClose={() => setInspectingAsset(null)}
          title={`3D Viewport: ${inspectingAsset.name}`}
          description="Interactive orbit, bounding box measurements and watertightness audit"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="h-80 w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
              <CadViewer
                preset={inspectingAsset.preset || 'mounting_plate'}
                height="100%"
                showControls={true}
                showHud={true}
                autoRotate={true}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono p-3 bg-[#F5F5F3] rounded-xl border border-gray-200">
              <div>
                <span className="text-[#858585] block text-[10px]">Total Surface Area</span>
                <span className="font-bold text-[#111111]">{inspectingAsset.surface_area_mm2?.toLocaleString() || '18,400'} mm²</span>
              </div>
              <div>
                <span className="text-[#858585] block text-[10px]">DFM Manufacturability</span>
                <span className="font-bold text-[#20B8A5]">Pass (Score: {inspectingAsset.dfmScore || 95}/100)</span>
              </div>
              <div>
                <span className="text-[#858585] block text-[10px]">Recommended Material</span>
                <span className="font-bold text-[#FF7138]">AlSi10Mg Aluminum Alloy</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <Button variant="outline" size="sm" onClick={() => setInspectingAsset(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setInspectingAsset(null);
                  navigate('/cad-analyzer');
                }}
              >
                Open Full Metrology Analyzer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Revision Tree Modal */}
      {revisionAsset && (
        <Modal
          isOpen={!!revisionAsset}
          onClose={() => setRevisionAsset(null)}
          title={`Revision History: ${revisionAsset.name}`}
          description="Immutable version lineage and engineering change orders"
          maxWidth="max-w-xl"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex items-start gap-3">
              <span className="p-1 bg-[#20B8A5]/10 text-[#20B8A5] rounded font-bold">v1.2</span>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111]">Current Active Branch</span>
                  <span className="text-[10px] text-[#858585]">Today, 11:20 AM</span>
                </div>
                <p className="text-[#858585] text-[11px]">Applied 3.5mm radius fillet to eliminate stress concentration on inner bore.</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-start gap-3 opacity-75">
              <span className="p-1 bg-gray-100 text-gray-700 rounded font-bold">v1.1</span>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111]">Weight Reduction Optimization</span>
                  <span className="text-[10px] text-[#858585]">Yesterday, 04:15 PM</span>
                </div>
                <p className="text-[#858585] text-[11px]">Pocketing depth increased by 2.0mm. Net mass dropped by 14%.</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-start gap-3 opacity-60">
              <span className="p-1 bg-gray-100 text-gray-700 rounded font-bold">v1.0</span>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111]">Initial CAD Ingestion</span>
                  <span className="text-[10px] text-[#858585]">3 days ago</span>
                </div>
                <p className="text-[#858585] text-[11px]">Imported native STEP envelope from SolidWorks 2024.</p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setRevisionAsset(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Publish to Marketplace Modal */}
      {publishAsset && (
        <Modal
          isOpen={!!publishAsset}
          onClose={() => setPublishAsset(null)}
          title={`Publish "${publishAsset.name}" to Marketplace`}
          description="Monetize your verified parametric designs and license CAD blueprints to verified manufacturers"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs font-body">
            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-[#858585]">Suggested Royalty:</span>
                <span className="font-bold text-[#111111]">₹4,500 / production lot</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#858585]">DFM Certification:</span>
                <span className="text-[#20B8A5] font-bold">Verified (Score: {publishAsset.dfmScore || 95}/100)</span>
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ipConfirmed}
                onChange={(e) => setIpConfirmed(e.target.checked)}
                className="mt-0.5 accent-[#FF7138]"
              />
              <span className="text-[11px] text-[#858585] leading-snug">
                I certify that I am the sole intellectual property owner of this CAD geometry and authorize SolidLabs to license it under standard non-exclusive OEM manufacturing terms.
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPublishAsset(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublishToMarketplace}
                disabled={!ipConfirmed}
              >
                Publish to Marketplace
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerAssetsPage;
