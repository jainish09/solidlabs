import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import {
  User,
  Settings,
  Building,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  FileText,
  Bell,
  Key,
  Shield,
  Download,
  CheckCircle2,
  Lock,
  Globe,
  Receipt,
  FileCheck2,
} from 'lucide-react';

export const CustomerProfileSettingsPage = () => {
  const { user, showToast } = useAuth();

  // Active tab: 'profile', 'company', 'settings', 'documents'
  const [activeTab, setActiveTab] = useState('profile');

  // Customer Profile State
  const [profileData, setProfileData] = useState({
    name: user.name || 'Alex Rivera',
    designation: user.title || 'Chief Engineering Officer',
    email: user.email || 'alex.rivera@aeroveloce.in',
    phone: '+91 98450 12345',
    companyName: user.organization || 'AeroVeloce Automotive Systems',
    companyAddress: 'Plot 42, Electronic City Phase 1, Bengaluru, Karnataka - 560100',
    industry: 'Automotive & EV Mobility',
  });

  // Company Information State
  const [companyData, setCompanyData] = useState({
    description: 'Tier-1 automotive engineering supplier specializing in precision CNC structural brackets, thermal cooling plates, and EV battery assemblies.',
    website: 'https://aeroveloce.in',
    gstin: '29AABCU9603R1ZN',
    billingAddress: 'AeroVeloce Automotive Systems Pvt. Ltd., Tech Tower 4, Whitefield, Bengaluru - 560066',
    shippingAddress: 'AeroVeloce Inward Dock #3, Bengaluru Logistics Park, Attibele Road, Karnataka - 562107',
    standards: ['ISO 2768-mK', 'ASME Y14.5 GD&T', 'AIS-038 Rev 2 (EV Safety)', 'AS9100D Certified'],
  });

  // Account Settings State
  const [notifications, setNotifications] = useState({
    onStageAdvance: true,
    onFormalQuote: true,
    onQualityReport: true,
    onShipmentDispatch: true,
    smsAlerts: false,
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Available Customer Documents Repository
  const DOCUMENTS_LIST = [
    {
      id: 'DOC-NDA-01',
      title: 'Mutual Non-Disclosure Agreement (M-NDA)',
      type: 'Legal Agreement',
      date: '2026-01-15',
      size: '1.2 MB',
      status: 'Fully Executed (Countersigned)',
    },
    {
      id: 'DOC-MSA-01',
      title: 'Master Manufacturing & Supply Services Agreement',
      type: 'Commercial Contract',
      date: '2026-02-01',
      size: '2.8 MB',
      status: 'Active Corporate Agreement',
    },
    {
      id: 'DOC-INV-9041',
      title: 'Commercial Tax Invoice — Order SL-9041',
      type: 'Tax Invoice',
      date: '2026-10-26',
      size: '840 KB',
      status: 'GST Compliant • Milestone 1 Paid',
    },
    {
      id: 'DOC-PO-9041',
      title: 'Official Purchase Order — PO-SL-9041',
      type: 'Purchase Order',
      date: '2026-10-26',
      size: '920 KB',
      status: 'Locked & Acknowledged by Vendor',
    },
    {
      id: 'DOC-QC-904',
      title: 'Zeiss Contura CMM Inspection Certificate of Conformance',
      type: 'Metrology Certificate',
      date: '2026-10-30',
      size: '4.6 MB',
      status: '100% Pass Rate (NABL Accredited)',
    },
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Customer profile & designation updated successfully.');
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    showToast('Company details & corporate billing addresses saved.');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (passwordState.newPassword && passwordState.newPassword !== passwordState.confirmPassword) {
      showToast('New passwords do not match.', 'danger');
      return;
    }
    showToast('Account security preferences and notifications updated.');
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDownloadDoc = (doc) => {
    const fakeBlob = new Blob([`SOLIDLABS OFFICIAL DOCUMENT\nTitle: ${doc.title}\nDoc ID: ${doc.id}\nStatus: ${doc.status}`], { type: 'text/plain' });
    const url = URL.createObjectURL(fakeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.id}_${doc.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
    showToast(`Downloaded ${doc.title}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Account Management</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Verified Enterprise OEM Buyer
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Profile & Account Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-body max-w-2xl">
            Manage your personal profile, company details, GSTIN billing addresses, production notifications, security keys, and legal documents.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="success" size="sm">
            GSTIN: 29AABCU9603R1ZN
          </Badge>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-teal-100/70 pb-3 scrollbar-none text-xs font-mono">
        {[
          { id: 'profile', label: 'Customer Profile', icon: <User size={15} /> },
          { id: 'company', label: 'Company Information', icon: <Building size={15} /> },
          { id: 'settings', label: 'Account Settings & Security', icon: <Settings size={15} /> },
          { id: 'documents', label: 'Documents Repository', icon: <FileText size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-teal-900 hover:bg-teal-50 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: CUSTOMER PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Card: User Badge */}
            <Card className="md:col-span-4 p-6 bg-white border border-teal-100 space-y-4 text-center rounded-2xl shadow-xs">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-teal-800 text-white flex items-center justify-center font-heading font-black text-2xl shadow-md border-2 border-teal-600">
                AR
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{profileData.name}</h3>
                <p className="text-xs text-teal-700 font-mono font-medium">{profileData.designation}</p>
                <p className="text-xs text-slate-500 font-body mt-0.5">{profileData.companyName}</p>
              </div>

              <div className="pt-3 border-t border-teal-50 space-y-2 text-xs font-mono text-left">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={13} className="text-teal-600 shrink-0" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={13} className="text-teal-600 shrink-0" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={13} className="text-teal-600 shrink-0" />
                  <span className="truncate">Bengaluru, Karnataka</span>
                </div>
              </div>
            </Card>

            {/* Right Card: Editable Details Form */}
            <Card className="md:col-span-8 p-6 sm:p-8 bg-white border border-teal-100 space-y-5 rounded-2xl shadow-xs">
              <div className="border-b border-teal-50 pb-3">
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Personal & Engineering Contact Details
                </h3>
                <p className="text-xs text-slate-500 font-body">
                  Used for RFQ broadcast attribution and technical drawing approvals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Customer Full Name *"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
                <Input
                  label="Designation / Role in Engineering *"
                  value={profileData.designation}
                  onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                  required
                />
                <Input
                  label="Corporate Email Address *"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number (SMS & WhatsApp Updates) *"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Company Name *"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Company Physical Address"
                    value={profileData.companyAddress}
                    onChange={(e) => setProfileData({ ...profileData, companyAddress: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Primary Industry Segment"
                    value={profileData.industry}
                    onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-teal-100">
                <Button variant="primary" size="md" type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6">
                  Save Profile Changes
                </Button>
              </div>
            </Card>
          </div>
        </form>
      )}

      {/* TAB 2: COMPANY INFORMATION */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="space-y-6">
          <Card className="p-6 sm:p-8 bg-white border border-teal-100 space-y-6 rounded-2xl shadow-xs">
            <div className="border-b border-teal-50 pb-3">
              <h3 className="text-base font-bold font-heading text-slate-900">
                Company Information & Billing Profile
              </h3>
              <p className="text-xs text-slate-500 font-body">
                Configures corporate GSTIN tax compliance, commercial billing addresses, and inward freight delivery bays.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Company Website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
                <Input
                  label="GSTIN Number (Goods & Services Tax India) *"
                  value={companyData.gstin}
                  onChange={(e) => setCompanyData({ ...companyData, gstin: e.target.value })}
                  placeholder="29AABCU9603R1ZN"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-600 block mb-1 font-semibold">
                  Company Description & Capabilities Overview
                </label>
                <textarea
                  rows={3}
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  className="w-full p-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1 font-semibold">
                    Registered Corporate Billing Address *
                  </label>
                  <textarea
                    rows={3}
                    value={companyData.billingAddress}
                    onChange={(e) => setCompanyData({ ...companyData, billingAddress: e.target.value })}
                    className="w-full p-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-600 block mb-1 font-semibold">
                    Inward Consignment Shipping Address *
                  </label>
                  <textarea
                    rows={3}
                    value={companyData.shippingAddress}
                    onChange={(e) => setCompanyData({ ...companyData, shippingAddress: e.target.value })}
                    className="w-full p-3 bg-white border border-teal-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Authorized Engineering Standards */}
              <div className="pt-2">
                <label className="text-xs font-mono uppercase text-slate-600 block mb-2 font-semibold">
                  Authorized Quality & Drawing Standards
                </label>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {companyData.standards.map((std, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} className="text-teal-600" />
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-teal-100">
              <Button variant="primary" size="md" type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6">
                Save Company Information
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 3: ACCOUNT SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <Card className="p-6 bg-white border border-teal-100 space-y-4 rounded-2xl shadow-xs">
              <div className="border-b border-teal-50 pb-2">
                <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Bell className="text-teal-600" size={17} />
                  <span>Production & Notification Alerts</span>
                </h3>
                <p className="text-xs text-slate-500 font-body">
                  Configure real-time alerts dispatched to your registered inbox and phone.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Production Stage Advance</span>
                    <span className="text-[11px] text-slate-500 font-mono">Email on each of the 7 manufacturing milestones</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.onStageAdvance}
                    onChange={(e) => setNotifications({ ...notifications, onStageAdvance: e.target.checked })}
                    className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Formal Quotation Received</span>
                    <span className="text-[11px] text-slate-500 font-mono">Instant alert when a verified shop submits a bid</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.onFormalQuote}
                    onChange={(e) => setNotifications({ ...notifications, onFormalQuote: e.target.checked })}
                    className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Quality Metrology Pass / Rework</span>
                    <span className="text-[11px] text-slate-500 font-mono">Immediate notification upon CMM inspection release</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.onQualityReport}
                    onChange={(e) => setNotifications({ ...notifications, onQualityReport: e.target.checked })}
                    className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Carrier Freight Dispatch Updates</span>
                    <span className="text-[11px] text-slate-500 font-mono">BlueDart tracking waypoints and estimated arrival</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.onShipmentDispatch}
                    onChange={(e) => setNotifications({ ...notifications, onShipmentDispatch: e.target.checked })}
                    className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </Card>

            {/* Change Password & Security */}
            <Card className="p-6 bg-white border border-teal-100 space-y-4 rounded-2xl shadow-xs">
              <div className="border-b border-teal-50 pb-2">
                <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Lock className="text-teal-600" size={17} />
                  <span>Account Password & Access Security</span>
                </h3>
                <p className="text-xs text-slate-500 font-body">
                  Update corporate credentials and toggle multi-factor authentication.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordState.currentPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                  placeholder="Min 8 alphanumeric chars"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                />

                <div className="pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100 cursor-pointer text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Two-Factor Authentication (2FA)</span>
                      <span className="text-[11px] text-slate-500 font-mono">Enforce SMS/OTP verification on CAD downloads</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end pt-3 border-t border-teal-100">
            <Button variant="primary" size="md" type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6">
              Save Settings & Security Preferences
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: DOCUMENTS REPOSITORY */}
      {activeTab === 'documents' && (
        <Card className="p-6 sm:p-8 bg-white border border-teal-100 space-y-6 rounded-2xl shadow-xs">
          <div className="border-b border-teal-50 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Official Corporate Documents Repository
              </h3>
              <p className="text-xs text-slate-500 font-body">
                Access your legally binding Non-Disclosure Agreements, Master Services Agreements, Tax Invoices, and Metrology Reports.
              </p>
            </div>
            <Badge variant="teal" size="sm">
              5 Available Documents
            </Badge>
          </div>

          <div className="space-y-3">
            {DOCUMENTS_LIST.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-teal-100 bg-white hover:bg-teal-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{doc.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800 font-medium mt-0.5">
                      Status: {doc.status}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      ID: {doc.id} • Date: {doc.date} • Size: {doc.size}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleDownloadDoc(doc)}
                    leftIcon={<Download size={13} />}
                    className="border-teal-200 text-teal-800 hover:bg-teal-50 font-bold"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerProfileSettingsPage;
