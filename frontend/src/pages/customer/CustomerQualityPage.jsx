import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  ShieldCheck,
  Award,
  FileCheck2,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CustomerQualityPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const QUALITY_REPORTS = [
    {
      id: 'REP-2026-904',
      orderId: 'ORD-2026-001',
      partName: 'AlSi10Mg Brake Caliper Brackets (Lot of 100)',
      inspectionDate: '2026-10-30',
      inspector: 'Kalyani Quality Lab #3',
      instrument: 'Zeiss Contura G2 CMM',
      status: 'Passed (100%)',
      tolerancesChecked: 48,
      outOfTolerance: 0,
      surfaceRoughnessRa: '0.8 µm (Target: < 1.2 µm)',
      materialBatch: 'AL-HEAT-9921-A',
      density: '2.68 g/cm³ (99.8% nominal)',
      notes: 'All 48 critical GD&T features within ±0.015mm engineering limits. Certificate of Conformance attached.',
    },
    {
      id: 'REP-2026-882',
      orderId: 'ORD-2026-002',
      partName: '6061-T6 Battery Cooling Cold-Plate (Lot of 25)',
      inspectionDate: '2026-10-28',
      inspector: 'Sundaram Advanced Metrology',
      instrument: 'Hexagon Global S CMM + Helium Leak Detector',
      status: 'Passed (100%)',
      tolerancesChecked: 36,
      outOfTolerance: 0,
      surfaceRoughnessRa: '0.4 µm (Target: < 0.8 µm)',
      materialBatch: 'AL6061-T6-B440',
      density: '2.70 g/cm³ (100% nominal)',
      notes: 'Hydrostatic pressure tested to 6.2 bar for 30 minutes. Zero micro-leakage detected.',
    },
    {
      id: 'REP-2026-815',
      orderId: 'ORD-2026-003',
      partName: 'Titanium Ti-6Al-4V Steering Knuckle (Lot of 10)',
      inspectionDate: '2026-10-22',
      inspector: 'Tata Precision Metrology Hub',
      instrument: 'Zeiss Calypso Optical / Touch-Trigger',
      status: 'Passed (100%)',
      tolerancesChecked: 64,
      outOfTolerance: 0,
      surfaceRoughnessRa: '0.6 µm (Target: < 0.8 µm)',
      materialBatch: 'TI-64-AEROSPACE-81',
      density: '4.43 g/cm³',
      notes: 'Full radiographic X-ray non-destructive test (NDT) completed. Zero internal porosity.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Metrology & Compliance</Badge>
            <Badge variant="orange">Zeiss & Hexagon CMM</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Quality Inspection Certificates
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Download verified CMM metrology inspection logs, ultrasonic NDT scans, and material mill test certificates (MTR).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="sm">
            Zero Defects (100% Lot Pass Rate)
          </Badge>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {QUALITY_REPORTS.map((report) => (
          <Card key={report.id} className="hover:border-[#111111] transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#FF7138]">{report.id}</span>
                  <Badge variant="teal" size="xs">{report.orderId}</Badge>
                  <Badge variant="success" size="xs" dot>{report.status}</Badge>
                </div>
                <h3 className="text-base font-bold font-heading text-[#111111]">
                  {report.partName}
                </h3>
                <div className="flex items-center gap-4 text-xs font-mono text-[#858585] flex-wrap">
                  <span>Lab: <span className="text-[#111111] font-medium">{report.inspector}</span></span>
                  <span>•</span>
                  <span>Instrument: <span className="text-[#111111] font-medium">{report.instrument}</span></span>
                  <span>•</span>
                  <span>Date: {report.inspectionDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  leftIcon={<Eye size={14} />}
                >
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert(`Downloading signed PDF Certificate for ${report.id}`)}
                  leftIcon={<Download size={14} />}
                >
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Micro metrology stats */}
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 bg-[#F5F5F3] rounded-lg">
                <span className="text-[#858585] text-[10px] block">Features Checked</span>
                <span className="font-bold text-[#111111]">{report.tolerancesChecked} Geometric Points</span>
              </div>
              <div className="p-2 bg-[#F5F5F3] rounded-lg">
                <span className="text-[#858585] text-[10px] block">Surface Finish</span>
                <span className="font-bold text-[#20B8A5]">Ra {report.surfaceRoughnessRa}</span>
              </div>
              <div className="p-2 bg-[#F5F5F3] rounded-lg">
                <span className="text-[#858585] text-[10px] block">Material Heat Batch</span>
                <span className="font-bold text-[#111111]">{report.materialBatch}</span>
              </div>
              <div className="p-2 bg-[#F5F5F3] rounded-lg">
                <span className="text-[#858585] text-[10px] block">Measured Density</span>
                <span className="font-bold text-[#111111]">{report.density}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Details Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`CMM Inspection Certificate: ${selectedReport.id}`}
          description={`Order ${selectedReport.orderId} • Certified by ${selectedReport.inspector}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-[#F5F5F3] rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#858585]">Component Under Test:</span>
                <span className="font-bold text-[#111111]">{selectedReport.partName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Metrology Machine:</span>
                <span className="text-[#111111] font-bold">{selectedReport.instrument}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#858585]">Calibration Traceability:</span>
                <span className="text-[#20B8A5] font-bold">NABL / NIST Standard Ref #IND-2026-CMM</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#111111] block">Inspector Findings & Remarks:</span>
              <p className="p-3 bg-white rounded-xl border border-gray-200 text-[#858585] font-body text-xs leading-relaxed">
                {selectedReport.notes}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Downloading cryptographic verification hash for ${selectedReport.id}`);
                }}
                leftIcon={<ShieldCheck size={14} />}
              >
                Verify Cryptographic Hash
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerQualityPage;

