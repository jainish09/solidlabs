import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sliders,
  Wrench,
  Download,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';

export const ManufacturerQualityControlPage = () => {
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  const INSPECTION_LOGS = [
    {
      id: 'QC-LOG-1049',
      partName: 'AlSi10Mg Brake Caliper Brackets (Lot of 100)',
      orderId: 'ORD-2026-001',
      spindleBay: '5-Axis DMG Mori Bay #2',
      operator: 'Rajesh K. (Senior Metrology Tech)',
      date: '2026-10-31',
      status: 'Passed (0 Deviations)',
      tolerancesChecked: 48,
      measuredDeviationMax: '+0.006 mm (Spec: ±0.015 mm)',
      roughnessRa: '0.62 µm',
      isoStandard: 'ISO 2768-mK / IATF 16949',
    },
    {
      id: 'QC-LOG-1048',
      partName: '6061-T6 Battery Cooling Enclosure',
      orderId: 'ORD-2026-002',
      spindleBay: 'Horizontal Milling Bay #4',
      operator: 'Anand S. (Quality Inspector)',
      date: '2026-10-30',
      status: 'Passed (0 Deviations)',
      tolerancesChecked: 32,
      measuredDeviationMax: '-0.008 mm (Spec: ±0.020 mm)',
      roughnessRa: '0.45 µm',
      isoStandard: 'DIN ISO 13920',
    },
    {
      id: 'QC-LOG-1047',
      partName: 'Ti-6Al-4V Steering Knuckles',
      orderId: 'ORD-2026-003',
      spindleBay: 'Laser Powder Bed Fusion #1',
      operator: 'Kiran M. (Additive Specialist)',
      date: '2026-10-29',
      status: 'Passed (CT Scanned)',
      tolerancesChecked: 64,
      measuredDeviationMax: '+0.012 mm (Spec: ±0.025 mm)',
      roughnessRa: '0.85 µm',
      isoStandard: 'ASTM F3001-14',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Plant Metrology Lab</Badge>
            <Badge variant="orange">Zeiss Contura Calibration</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Quality Assurance & Shop-Floor Metrology
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Log coordinate-measuring machine (CMM) data, surface roughness measurements, and compliance certificates.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddLogModal(true)}
          leftIcon={<PlusCircle size={16} />}
        >
          New Inspection Run
        </Button>
      </div>

      {/* Calibration Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#858585]">CMM Calibration</span>
            <p className="text-sm font-bold font-heading text-[#111111] mt-0.5">Zeiss Contura G2</p>
            <span className="text-[11px] text-[#20B8A5] font-mono">Calibrated (Expires in 28 days)</span>
          </div>
          <ShieldCheck className="text-[#20B8A5]" size={24} />
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#858585]">Shop-Floor Yield</span>
            <p className="text-sm font-bold font-heading text-[#111111] mt-0.5">99.78% First-Pass</p>
            <span className="text-[11px] text-[#20B8A5] font-mono">2,410 of 2,415 parts OK</span>
          </div>
          <Award className="text-[#FF7138]" size={24} />
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#858585]">Active Standards</span>
            <p className="text-sm font-bold font-heading text-[#111111] mt-0.5">IATF 16949 / ISO 9001</p>
            <span className="text-[11px] text-[#858585] font-mono">Audited by TÜV Rheinland</span>
          </div>
          <FileCheck2 className="text-[#111111]" size={24} />
        </div>
      </div>

      {/* Inspection Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent CMM Inspection Logs</CardTitle>
          <CardDescription>
            Continuous metrology telemetry linked directly to live customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F5F5F3] text-[#858585] uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Component / Order</th>
                  <th className="p-3">Bay / Tech</th>
                  <th className="p-3">Tolerance Check</th>
                  <th className="p-3">Max Deviation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {INSPECTION_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-[#FF7138]">{log.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-[#111111] font-heading">{log.partName}</p>
                      <p className="text-[10px] text-[#858585]">{log.orderId}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-[#111111]">{log.spindleBay}</p>
                      <p className="text-[10px] text-[#858585]">{log.operator}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-[#111111] font-bold">{log.tolerancesChecked} Points</span>
                      <p className="text-[10px] text-[#858585]">Ra {log.roughnessRa}</p>
                    </td>
                    <td className="p-3 text-[#20B8A5] font-bold">{log.measuredDeviationMax}</td>
                    <td className="p-3">
                      <Badge variant="success" size="xs" dot>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => alert(`Exported calibration sheet for ${log.id}`)}
                        leftIcon={<Download size={12} />}
                      >
                        MTR
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Log Modal */}
      {showAddLogModal && (
        <Modal
          isOpen={showAddLogModal}
          onClose={() => setShowAddLogModal(false)}
          title="Create Metrology Run Entry"
          description="Record touch-trigger CMM probe verification points"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 font-mono text-xs">
            <p className="text-gray-600 font-body">
              Confirm that coordinate zero-datum calibration was verified on the artifact sphere prior to recording run points.
            </p>
            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 space-y-1">
              <span className="text-[#858585] text-[10px] block">Traceability Hash:</span>
              <span className="font-bold text-[#20B8A5]">sha256:88fa02b1c409...</span>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={() => setShowAddLogModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert('Inspection run registered and cryptographically signed.');
                  setShowAddLogModal(false);
                }}
              >
                Sign & Save Run
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManufacturerQualityControlPage;

