import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { MOCK_MANUFACTURER_PROFILES, RAW_MATERIALS } from '../../data/mockData';
import { Settings, ShieldCheck, Cpu, CheckCircle2, Award, Zap, Factory, Wrench, Clock, FileCheck } from 'lucide-react';

export const ManufacturerCapabilitiesPage = () => {
  const profile = MOCK_MANUFACTURER_PROFILES[0];
  const [rushAvailable, setRushAvailable] = useState(true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Manufacturing Capabilities</Badge>
            <Badge variant="orange">AS9100D & IATF 16949 Certified</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Equipment Roster & Process Envelopes
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Configured machine envelopes, supported alloys, and certified quality management standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRushAvailable(!rushAvailable)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border flex items-center gap-2 transition-colors cursor-pointer ${
              rushAvailable
                ? 'border-[#20B8A5] bg-[#20B8A5]/10 text-[#20B8A5]'
                : 'border-gray-200 bg-white text-[#858585]'
            }`}
          >
            <Zap size={14} />
            <span>Rush 48h Spindle: {rushAvailable ? 'OPEN' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Equipment Roster */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-[#111111] flex items-center gap-2">
          <Factory className="text-[#FF7138] w-5 h-5" />
          Active CNC & Metrology Bays
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(profile?.machines || []).map((machine, idx) => {
            const envelopeStr = machine.max_envelope_mm?.x
              ? `${machine.max_envelope_mm.x} × ${machine.max_envelope_mm.y} × ${machine.max_envelope_mm.z} mm`
              : (machine.envelope || 'Standard Machining Envelope');
            const toleranceStr = machine.tolerance_mm || machine.accuracy || machine.resolution || '0.005';
            const quantity = machine.quantity || 1;

            return (
              <Card key={machine.id || machine.name || idx} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="teal" size="sm">
                      {machine.type}
                    </Badge>
                    <span className="text-xs font-mono text-[#858585]">
                      Qty: {quantity} Active
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-heading text-[#111111] mb-1">
                    {machine.name}
                  </h3>
                  <p className="text-xs font-mono text-[#858585] mb-4">
                    Tolerance: ±{toleranceStr} mm
                  </p>

                  <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 text-xs font-mono space-y-1.5">
                    <div className="text-[10px] text-[#858585] uppercase tracking-wider font-semibold">
                      Max Workpiece Envelope
                    </div>
                    <div className="text-[#111111] font-bold">
                      {envelopeStr}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#20B8A5] flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={13} />
                    Calibrated
                  </span>
                  <span className="text-[#858585]">
                    {machine.status || '99.4% Uptime'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Certified Materials & Quality Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="text-[#FF7138] w-4 h-4" />
              Qualified Material Stock (Automotive & Aerospace)
            </CardTitle>
            <CardDescription>
              Pre-inspected certified billets with batch mill test certificates (MTR)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {RAW_MATERIALS.slice(0, 4).map((mat) => (
              <div key={mat.id} className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#111111]">{mat.name}</p>
                  <p className="text-[10px] font-mono text-[#858585]">Grade: {mat.grade} • Stock: {mat.stock_kg} kg</p>
                </div>
                <Badge variant="teal" size="xs">₹{mat.cost_per_kg_inr}/kg</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="text-[#20B8A5] w-4 h-4" />
              Active Quality Certifications
            </CardTitle>
            <CardDescription>
              Audited by TÜV Rheinland & DNV GL for Tier-1 OEM production
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-[#111111]">IATF 16949:2016</p>
                <p className="text-[10px] text-[#858585]">Automotive Quality Management System</p>
              </div>
              <Badge variant="success" size="xs">Valid thru 2028</Badge>
            </div>

            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-[#111111]">ISO 9001:2015</p>
                <p className="text-[10px] text-[#858585]">General Precision Machining & Assembly</p>
              </div>
              <Badge variant="success" size="xs">Valid thru 2027</Badge>
            </div>

            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-[#111111]">Zeiss Calypso CMM Audited</p>
                <p className="text-[10px] text-[#858585]">Sub-micron 0.005mm volumetric accuracy</p>
              </div>
              <Badge variant="teal" size="xs">Weekly Calibrated</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturerCapabilitiesPage;
