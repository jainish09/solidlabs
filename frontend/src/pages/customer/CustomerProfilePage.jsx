import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { User, Building, MapPin, Mail, Phone, ShieldCheck, Award, FileText } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Enterprise Account</Badge>
            <Badge variant="orange">Verified OEM Buyer</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Customer Profile & Organization
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Manage your engineering team credentials, billing addresses, and corporate GSTIN configuration.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => alert('Profile updates saved')}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#111111] text-[#FF7138] flex items-center justify-center font-heading font-black text-2xl border-4 border-[#F5F5F3] shadow-md">
              SL
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-[#111111]">{user.name}</h2>
              <p className="text-xs text-[#858585] font-mono">{user.email}</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="teal" size="xs">Lead Hardware Engineer</Badge>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#858585]">
              <Building size={14} className="text-[#FF7138]" />
              <span className="text-[#111111] font-semibold">{user.organization}</span>
            </div>
            <div className="flex items-center gap-2 text-[#858585]">
              <MapPin size={14} className="text-[#20B8A5]" />
              <span>Bangalore R&D Facility, Karnataka</span>
            </div>
            <div className="flex items-center gap-2 text-[#858585]">
              <ShieldCheck size={14} className="text-[#20B8A5]" />
              <span>GSTIN: 29AABCU9603R1ZN</span>
            </div>
          </div>
        </Card>

        {/* Company & Billing Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization & Delivery Details</CardTitle>
            <CardDescription>
              Used for automated invoicing, customs bills of entry, and dispatch consignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue={user.name} />
              <Input label="Corporate Email" defaultValue={user.email} />
              <Input label="Company Name" defaultValue={user.organization} />
              <Input label="GSTIN Number" defaultValue="29AABCU9603R1ZN" />
              <Input label="Registered Dispatch Address" defaultValue="Plot 42, Electronic City Phase 1" />
              <Input label="City / State" defaultValue="Bangalore, Karnataka - 560100" />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#858585] mb-2 font-semibold">
                Authorized Engineering Standards
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F3] border border-gray-200 text-[#111111]">ISO 2768-mK</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F3] border border-gray-200 text-[#111111]">ASME Y14.5 GD&T</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F3] border border-gray-200 text-[#111111]">AIS-038 Rev 2 (EV)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfilePage;

