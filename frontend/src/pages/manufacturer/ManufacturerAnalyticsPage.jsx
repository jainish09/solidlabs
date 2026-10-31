import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  DollarSign,
  Percent,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const ManufacturerAnalyticsPage = () => {
  const { analyticsData } = useAuth();
  const [activeRange, setActiveRange] = useState('6months');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" size="xs" dot>Commercial Metrology & ERP Analytics</Badge>
            <Badge variant="orange" size="xs">Live Telemetry</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Manufacturer Business & Machine Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#858585] font-body">
            Comprehensive business metrics: revenue growth, enquiry conversion rates, OEE machine utilization, and customer review scores.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 text-xs font-mono">
          {['30days', '6months', '1year'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeRange === range ? 'bg-[#111111] text-white font-bold' : 'text-[#858585] hover:text-[#111111]'
              }`}
            >
              {range === '30days' ? 'Last 30 Days' : range === '6months' ? 'Last 6 Months' : 'Full Year'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Quotation Conversion', value: '68.4%', note: '+4.2% vs industry avg', color: 'text-emerald-600' },
          { label: 'Capacity Utilization', value: '84.2%', note: '11/14 Spindles Active', color: 'text-[#20B8A5]' },
          { label: 'On-Time Dispatch Rate', value: '99.4%', note: 'Zero SLA penalties', color: 'text-[#FF7138]' },
          { label: 'Customer Satisfaction', value: '4.91 / 5', note: 'Based on 412 reviews', color: 'text-[#111111]' },
        ].map((kpi, i) => (
          <Card key={i} className="p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#858585]">{kpi.label}</span>
            <p className={`text-2xl font-black font-heading ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-[#858585] font-mono">{kpi.note}</p>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue Trajectory & Order Volume</CardTitle>
            <CardDescription>Monthly B2B factory invoicing and units completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#858585" fontSize={11} />
                  <YAxis stroke="#858585" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenueINR" name="Revenue (₹)" stroke="#20B8A5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Machine OEE Production Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Spindle Machine OEE Efficiency vs Target</CardTitle>
            <CardDescription>Weekly overall equipment effectiveness percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.productionPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#858585" fontSize={11} />
                  <YAxis stroke="#858585" fontSize={11} domain={[70, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend />
                  <Bar dataKey="efficiency" name="OEE Efficiency %" fill="#FF7138" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target %" fill="#111111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturerAnalyticsPage;

