import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { Settings, Bell, Key, Shield, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';

export const CustomerSettingsPage = () => {
  const [notifyOnStageChange, setNotifyOnStageChange] = useState(true);
  const [notifyOnQuote, setNotifyOnQuote] = useState(true);
  const [autoDfmCheck, setAutoDfmCheck] = useState(true);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Preferences</Badge>
            <Badge variant="orange">CAD Engine v2.4</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Workspace Settings & Integrations
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Configure telemetry, email notifications, CAD export defaults, and enterprise API keys.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => alert('Settings successfully updated')}>
          Save Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="text-[#FF7138] w-4 h-4" />
              Production & RFQ Alerts
            </CardTitle>
            <CardDescription>Configure when SolidLabs sends live updates to your inbox</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F3] border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-[#111111]">Email on Production Stage Advance</span>
              <input
                type="checkbox"
                checked={notifyOnStageChange}
                onChange={(e) => setNotifyOnStageChange(e.target.checked)}
                className="accent-[#FF7138] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F3] border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-[#111111]">Instant Notification on Formal Quotations</span>
              <input
                type="checkbox"
                checked={notifyOnQuote}
                onChange={(e) => setNotifyOnQuote(e.target.checked)}
                className="accent-[#FF7138] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F3] border border-gray-200 cursor-pointer">
              <span className="text-xs font-medium text-[#111111]">Run Automatic DFM Metrology on CAD Drop</span>
              <input
                type="checkbox"
                checked={autoDfmCheck}
                onChange={(e) => setAutoDfmCheck(e.target.checked)}
                className="accent-[#20B8A5] w-4 h-4 cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>

        {/* API & Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="text-[#20B8A5] w-4 h-4" />
              API Key & ERP Webhooks
            </CardTitle>
            <CardDescription>Connect SolidLabs telemetry to SAP, Oracle, or Siemens Teamcenter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <Input
              label="Live Production Webhook URL"
              defaultValue="https://erp.evtechnologies.in/api/v1/solidlabs-webhooks"
            />
            <Input
              label="Bearer Auth Token (Mock)"
              defaultValue="sl_live_9921_88af8b82_prod_secret"
              type="password"
              readOnly
            />
            <div className="pt-2 flex justify-between items-center text-[11px] text-[#858585]">
              <span>Status: <span className="text-[#20B8A5] font-bold">200 OK (Connected)</span></span>
              <span>Last ping: 2 mins ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerSettingsPage;

