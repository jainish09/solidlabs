import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { DollarSign, TrendingUp, Download, CheckCircle2, Clock, Landmark, FileText, ArrowUpRight } from 'lucide-react';

export const ManufacturerEarningsPage = () => {
  const PAYOUT_LEDGER = [
    {
      id: 'PAY-2026-881',
      orderId: 'ORD-2026-001',
      description: '50% Milestone Advance - AlSi10Mg Brake Caliper Brackets',
      buyer: 'EV Technologies India Pvt Ltd',
      amountINR: '₹2,40,000',
      date: '2026-10-25',
      status: 'Settled to HDFC Current A/c',
      payoutRef: 'UTR-20261025-HDFC-99120',
    },
    {
      id: 'PAY-2026-879',
      orderId: 'ORD-2026-002',
      description: 'Final Delivery & Acceptance Payout - Battery Cooling Plate',
      buyer: 'Mahindra Mobility Labs',
      amountINR: '₹1,95,000',
      date: '2026-10-18',
      status: 'Settled to HDFC Current A/c',
      payoutRef: 'UTR-20261018-HDFC-88210',
    },
    {
      id: 'PAY-2026-865',
      orderId: 'ORD-2026-003',
      description: 'Material Procurement Advance - Ti-6Al-4V Steering Knuckles',
      buyer: 'AeroDynamics India OEM',
      amountINR: '₹4,10,000',
      date: '2026-10-12',
      status: 'Settled to HDFC Current A/c',
      payoutRef: 'UTR-20261012-HDFC-77341',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Escrow Settlement</Badge>
            <Badge variant="orange">Automated INR (₹) Clearing</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Financial Settlement & Payouts
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Direct bank deposits, milestone escrow payouts, and GST compliance invoices.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => alert('Bank statement export generated')}
          leftIcon={<Download size={16} />}
        >
          Download Tax Statement (FY 26-27)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-[#858585]">Total Settled (30d)</span>
            <DollarSign size={18} className="text-[#20B8A5]" />
          </div>
          <p className="text-3xl font-black font-heading text-[#111111]">₹8,45,000</p>
          <p className="text-xs font-mono text-[#20B8A5] mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} /> +18.4% month-over-month
          </p>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-[#858585]">In Production Escrow</span>
            <Clock size={18} className="text-[#FF7138]" />
          </div>
          <p className="text-3xl font-black font-heading text-[#111111]">₹3,80,000</p>
          <p className="text-xs font-mono text-[#858585] mt-1">
            Unlocks upon CMM metrology sign-off
          </p>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-[#858585]">Linked Current Account</span>
            <Landmark size={18} className="text-[#111111]" />
          </div>
          <p className="text-sm font-bold font-heading text-[#111111]">HDFC Bank Ltd</p>
          <p className="text-xs font-mono text-[#858585] mt-1">
            A/c: **** 9912 • IFSC: HDFC0001248
          </p>
        </Card>
      </div>

      {/* Payout History Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Payout Disbursals</CardTitle>
          <CardDescription>
            All marketplace payouts are protected under SolidLabs Smart Escrow agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F5F5F3] text-[#858585] uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3">Payout ID</th>
                  <th className="p-3">Order / Description</th>
                  <th className="p-3">Buyer Enterprise</th>
                  <th className="p-3">Amount (INR)</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PAYOUT_LEDGER.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-[#FF7138]">{item.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-[#111111] font-heading">{item.description}</p>
                      <p className="text-[10px] text-[#858585]">{item.orderId} • {item.payoutRef}</p>
                    </td>
                    <td className="p-3 text-[#111111]">{item.buyer}</td>
                    <td className="p-3 text-sm font-black text-[#20B8A5]">{item.amountINR}</td>
                    <td className="p-3 text-[#858585]">{item.date}</td>
                    <td className="p-3">
                      <Badge variant="success" size="xs" dot>{item.status}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => alert(`Downloaded GST tax invoice for ${item.id}`)}
                        leftIcon={<FileText size={12} />}
                      >
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManufacturerEarningsPage;

