import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { Settings, Sliders, Bell, HardDrive, ShieldCheck, Zap } from 'lucide-react';

export const ManufacturerSettingsPage = () => {
  const [rushEnabled, setRushEnabled] = useState(true);
  const [autoQuoteRfq, setAutoQuoteRfq] = useState(false);
  const [baseHourlyRate, setBaseHourlyRate] = useState('3200');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Plant Configuration</Badge>
            <Badge variant="orange">Shop-Floor Telemetry</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Plant Settings & Machinery Parameters
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Manage your spindle hourly rates, rush job multipliers, shift hours, and automated DFM quoting limits.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => alert('Plant parameters saved')}>
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Machine Rate Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="text-[#FF7138] w-4 h-4" />
              Spindle Pricing & Capacity Defaults
            </CardTitle>
            <CardDescription>Base hourly calculation for instant AI quote approximations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Standard 5-Axis CNC Hourly Rate (₹ / hr)"
              value={baseHourlyRate}
              onChange={(e) => setBaseHourlyRate(e.target.value)}
            />

            <Input
              label="Rush 48-Hour Lead Time Multiplier"
              defaultValue="1.45x"
            />

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F3] border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-[#111111]">Accept Rush 48-Hour Expedited Spindle Jobs</span>
              <input
                type="checkbox"
                checked={rushEnabled}
                onChange={(e) => setRushEnabled(e.target.checked)}
                className="accent-[#FF7138] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F3] border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-[#111111]">Automate Standard Quotes with Score &gt; 90 DFM</span>
              <input
                type="checkbox"
                checked={autoQuoteRfq}
                onChange={(e) => setAutoQuoteRfq(e.target.checked)}
                className="accent-[#20B8A5] w-4 h-4 cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>

        {/* Operating Shifts & Plant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="text-[#20B8A5] w-4 h-4" />
              Plant Schedule & Operational Shifts
            </CardTitle>
            <CardDescription>Used to calculate automated dispatch and delivery dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] block">Shift 1 (Day Operations)</span>
                <span className="text-[10px] text-[#858585]">06:00 AM - 02:00 PM (10 Spindles Active)</span>
              </div>
              <Badge variant="teal" size="xs">Active</Badge>
            </div>

            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] block">Shift 2 (Evening Operations)</span>
                <span className="text-[10px] text-[#858585]">02:00 PM - 10:00 PM (8 Spindles Active)</span>
              </div>
              <Badge variant="teal" size="xs">Active</Badge>
            </div>

            <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#111111] block">Shift 3 (Lights-Out Night Automation)</span>
                <span className="text-[10px] text-[#858585]">10:00 PM - 06:00 AM (Robotic Pallet Pools)</span>
              </div>
              <Badge variant="orange" size="xs">Lights-Out</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturerSettingsPage;

