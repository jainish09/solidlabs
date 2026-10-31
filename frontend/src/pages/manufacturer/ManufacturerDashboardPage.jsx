import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Sliders,
  AlertTriangle,
  Factory,
  Layers,
  Truck,
  MessageSquare,
} from 'lucide-react';
import {
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
  ResponsiveContainer,
} from 'recharts';

export const ManufacturerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, requirements, orders, totalUnreadMessages } = useAuth();
  const [timeRange, setTimeRange] = useState('monthly');

  const activeOrders = orders.filter((o) => o.status === 'in_production');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  // Interactive Recharts Mock Datasets
  const analyticsData = {
    monthlyRevenue: [
      { month: 'Jun', revenueINR: 1850000, targetINR: 1700000 },
      { month: 'Jul', revenueINR: 2150000, targetINR: 2000000 },
      { month: 'Aug', revenueINR: 1980000, targetINR: 2200000 },
      { month: 'Sep', revenueINR: 2600000, targetINR: 2400000 },
      { month: 'Oct', revenueINR: 2850000, targetINR: 2600000 },
      { month: 'Nov', revenueINR: 3120000, targetINR: 2800000 },
    ],
    ordersByStatus: [
      { name: 'CAM Toolpathing', value: 3, color: '#0F766E' },
      { name: 'Machining', value: 5, color: '#0D9488' },
      { name: 'Metrology (CMM)', value: 4, color: '#14B8A6' },
      { name: 'Surface Anodizing', value: 2, color: '#2DD4BF' },
    ],
    productionPerformance: [
      { week: 'W1', efficiency: 86, target: 88 },
      { week: 'W2', efficiency: 91, target: 88 },
      { week: 'W3', efficiency: 89, target: 88 },
      { week: 'W4', efficiency: 94, target: 88 },
    ],
    categoryRevenue: [
      { name: 'Brake Systems', value: 38, color: '#0F766E' },
      { name: 'Alloy Wheels', value: 28, color: '#0D9488' },
      { name: 'Lighting & Electronics', value: 20, color: '#14B8A6' },
      { name: 'Motors & Batteries', value: 14, color: '#2DD4BF' },
    ],
    customerEnquiries: [
      { day: 'Mon', enquiries: 4 },
      { day: 'Tue', enquiries: 7 },
      { day: 'Wed', enquiries: 6 },
      { day: 'Thu', enquiries: 11 },
      { day: 'Fri', enquiries: 9 },
      { day: 'Sat', enquiries: 5 },
      { day: 'Sun', enquiries: 3 },
    ],
    monthlyOrders: [
      { month: 'Jun', count: 18 },
      { month: 'Jul', count: 24 },
      { month: 'Aug', count: 22 },
      { month: 'Sep', count: 31 },
      { month: 'Oct', count: 28 },
      { month: 'Nov', count: 35 },
    ],
  };

  const topProducts = [
    { name: 'Vanguard TrackSpec Carbon Brake Pad', category: 'Braking', revenue: '₹14,50,000', units: 320 },
    { name: 'Veloce Forged Monoblock 19" Wheel', category: 'Alloy Wheels', revenue: '₹9,80,000', units: 54 },
    { name: 'LuminaMatrix Adaptive Matrix LED', category: 'Lighting', revenue: '₹7,20,000', units: 48 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white border border-teal-700/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="xs" dot>Manufacturer Operations Hub</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white border border-white/30">
              AS9100D Certified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
            {user.organization} — Factory Overview
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 font-body max-w-xl">
            Live spindle capacity, incoming customer requirements, and interactive production performance analytics.
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-teal-950/70 p-1 rounded-xl border border-teal-700/60 flex items-center text-xs font-mono">
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  timeRange === period ? 'bg-teal-600 text-white font-bold' : 'text-teal-200/70 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/manufacturer/messages')}
            leftIcon={<MessageSquare size={14} className="text-teal-300" />}
            className="border-teal-700 text-teal-100 hover:bg-teal-800/50"
          >
            <span>Messages</span>
            {totalUnreadMessages > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-500 text-white text-[10px] font-bold">
                {totalUnreadMessages}
              </span>
            )}
          </Button>

          <Button
            variant="white"
            size="sm"
            onClick={() => navigate('/manufacturer/requests')}
            rightIcon={<ArrowRight size={14} />}
            className="bg-white text-teal-900 hover:bg-teal-50 font-bold"
          >
            Review {requirements.length} RFQs
          </Button>
        </div>
      </div>

      {/* 6 Statistic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Revenue',
            value: '₹31.2 L',
            note: '+18.4% this mo.',
            color: 'text-teal-700',
          },
          {
            label: 'New Enquiries',
            value: requirements.length,
            note: 'Awaiting Quote',
            color: 'text-teal-800',
          },
          {
            label: 'Active Orders',
            value: activeOrders.length,
            note: 'In Machining',
            color: 'text-teal-600',
          },
          {
            label: 'Completed Orders',
            value: completedOrders.length + 84,
            note: 'CMM Verified',
            color: 'text-slate-900',
          },
          {
            label: 'Pending Quotes',
            value: '3',
            note: 'Sent to Client',
            color: 'text-teal-700',
          },
          {
            label: 'Shop Capacity',
            value: '84%',
            note: '11/14 Bays Active',
            color: 'text-teal-600',
          },
        ].map((stat, i) => (
          <Card key={i} className="p-4 space-y-1 bg-white border border-teal-100 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">{stat.label}</span>
            <p className={`text-xl sm:text-2xl font-black font-heading ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-mono text-teal-700 font-semibold">{stat.note}</p>
          </Card>
        ))}
      </div>

      {/* 6 Interactive Recharts Graphs Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-slate-900">
            Interactive Financial & Production Analytics
          </h2>
          <span className="text-xs font-mono text-slate-500">Period: {timeRange.toUpperCase()} View</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Monthly Revenue: Line Chart */}
          <Card className="bg-white border border-teal-100 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">1. Monthly Revenue Trend (INR)</CardTitle>
              <CardDescription className="text-slate-500">B2B manufacturing invoicing over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #115E59' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenueINR"
                      name="Revenue (₹)"
                      stroke="#0D9488"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0D9488' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Orders by Status: Donut Chart */}
          <Card className="bg-white border border-teal-100 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">2. Orders by Production Status</CardTitle>
              <CardDescription className="text-slate-500">Current distribution of shop-floor active jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.ordersByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {analyticsData.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v} Units`, 'Quantity']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #115E59' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Production Performance: Bar Chart */}
          <Card className="bg-white border border-teal-100 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">3. Spindle Efficiency vs Target (%)</CardTitle>
              <CardDescription className="text-slate-500">Actual OEE percentage compared against 88% baseline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.productionPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #115E59' }} />
                    <Legend />
                    <Bar dataKey="efficiency" name="Efficiency %" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target %" fill="#0F766E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Product Category Revenue: Pie Chart */}
          <Card className="bg-white border border-teal-100 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">4. Revenue Distribution by Automotive Category</CardTitle>
              <CardDescription className="text-slate-500">Percentage contribution per component line</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryRevenue}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {analyticsData.categoryRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v}%`, 'Share']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #115E59' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 5. Customer Enquiries: Area Chart */}
          <Card className="bg-white border border-teal-100 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">5. Customer Inbound RFQs (Weekly Volume)</CardTitle>
              <CardDescription className="text-slate-500">New component RFQ enquiries received per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.customerEnquiries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #115E59' }} />
                    <Area
                      type="monotone"
                      dataKey="enquiries"
                      name="RFQs"
                      stroke="#0D9488"
                      fill="#0D9488"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 6. Monthly Orders Volume: Bar Chart */}
          <Card className="bg-white border border-teal-100 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900">6. Dispatched Production Batches (Counts)</CardTitle>
              <CardDescription className="text-slate-500">Confirmed production batch orders executed per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: '1px solid #115E59' }} />
                    <Bar dataKey="count" name="Batches" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operational Highlights Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Top-performing products (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-900">
            Top-Performing Manufacturing Lines
          </h3>

          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <Card key={i} className="p-4 flex items-center justify-between bg-white border border-teal-100">
                <div>
                  <h4 className="text-xs font-bold font-heading text-slate-900">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{p.category} • {p.units} units shipped</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold font-heading text-teal-800">{p.revenue}</span>
                  <span className="text-[10px] text-teal-700 font-mono block font-semibold">Top Earner</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Production Deadlines & Capacity (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-900">
            Upcoming Production Deadlines & SLA
          </h3>

          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id} className="p-4 flex items-center justify-between bg-white border border-teal-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-700">{o.orderNumber}</span>
                    <Badge variant="teal" size="xs">{o.stages[o.currentStageIndex]?.name}</Badge>
                  </div>
                  <h4 className="text-xs font-bold font-heading text-slate-900 mt-0.5">{o.productName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Client: {o.customerName}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-slate-900 block">{o.carrier}</span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate('/manufacturer/orders')}
                    className="mt-1 border-teal-200 text-teal-800 hover:bg-teal-50"
                  >
                    Manage Stage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboardPage;
