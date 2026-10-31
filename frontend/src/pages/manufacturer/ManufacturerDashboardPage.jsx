import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
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
  Factory,
  TrendingUp,
  Receipt,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Box,
  MessageSquare,
} from 'lucide-react';

export const ManufacturerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, requirements, orders, analyticsData, updateProductionStage, totalUnreadMessages } = useAuth();

  // Filters state
  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  const activeOrders = orders.filter((o) => o.currentStageIndex < 6);
  const completedOrders = orders.filter((o) => o.currentStageIndex === 6);

  // Top products
  const topProducts = [
    { name: 'ApexFlow Carbon-Ceramic Brake Pad', category: 'Brake Pads', revenue: '₹14,20,000', units: 320 },
    { name: 'Veloce Forged Monoblock 19" Wheel', category: 'Alloy Wheels', revenue: '₹9,80,000', units: 54 },
    { name: 'LuminaMatrix Adaptive Matrix LED', category: 'Lighting', revenue: '₹7,20,000', units: 48 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#111111] text-white border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="xs" dot>Manufacturer Operations Hub</Badge>
            <Badge variant="orange" size="xs">AS9100D Certified</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
            {user.organization} — Factory Overview
          </h1>
          <p className="text-xs sm:text-sm text-white/70 font-body max-w-xl">
            Live spindle capacity, incoming customer requirements, and interactive production performance analytics.
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#1B1B1B] p-1 rounded-xl border border-white/10 flex items-center text-xs font-mono">
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  timeRange === period ? 'bg-[#FF7138] text-white font-bold' : 'text-white/60 hover:text-white'
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
            leftIcon={<MessageSquare size={14} className="text-[#FF7138]" />}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <span>Messages</span>
            {totalUnreadMessages > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FF7138] text-white text-[10px] font-bold">
                {totalUnreadMessages}
              </span>
            )}
          </Button>

          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/manufacturer/requests')}
            rightIcon={<ArrowRight size={14} />}
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
            color: 'text-emerald-500',
          },
          {
            label: 'New Enquiries',
            value: requirements.length,
            note: 'Awaiting Quote',
            color: 'text-[#FF7138]',
          },
          {
            label: 'Active Orders',
            value: activeOrders.length,
            note: 'In Machining',
            color: 'text-[#20B8A5]',
          },
          {
            label: 'Completed Orders',
            value: completedOrders.length + 84,
            note: 'CMM Verified',
            color: 'text-[#111111]',
          },
          {
            label: 'Pending Quotes',
            value: '3',
            note: 'Sent to Client',
            color: 'text-amber-500',
          },
          {
            label: 'Shop Capacity',
            value: '84%',
            note: '11/14 Bays Active',
            color: 'text-sky-500',
          },
        ].map((stat, i) => (
          <Card key={i} className="p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#858585] tracking-wider block">{stat.label}</span>
            <p className={`text-xl sm:text-2xl font-black font-heading ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-mono text-[#858585]">{stat.note}</p>
          </Card>
        ))}
      </div>

      {/* 6 Interactive Recharts Graphs Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-[#111111]">
            Interactive Financial & Production Analytics
          </h2>
          <span className="text-xs font-mono text-[#858585]">Period: {timeRange.toUpperCase()} View</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Monthly Revenue: Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">1. Monthly Revenue Trend (INR)</CardTitle>
              <CardDescription>B2B manufacturing invoicing over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#858585" fontSize={11} />
                    <YAxis
                      stroke="#858585"
                      fontSize={11}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenueINR"
                      name="Revenue (₹)"
                      stroke="#FF7138"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#FF7138' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Orders by Status: Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">2. Orders by Production Status</CardTitle>
              <CardDescription>Current distribution of shop-floor active jobs</CardDescription>
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
                      contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Production Performance: Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">3. Spindle Efficiency vs Target (%)</CardTitle>
              <CardDescription>Actual OEE percentage compared against 88% baseline</CardDescription>
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
                    <Bar dataKey="efficiency" name="Efficiency %" fill="#20B8A5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target %" fill="#111111" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Product Category Revenue: Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">4. Revenue Distribution by Automotive Category</CardTitle>
              <CardDescription>Percentage contribution per component line</CardDescription>
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
                      contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 5. Customer Enquiries: Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">5. Customer Inbound RFQs (Weekly Volume)</CardTitle>
              <CardDescription>New component RFQ enquiries received per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.customerEnquiries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#858585" fontSize={11} />
                    <YAxis stroke="#858585" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="enquiries"
                      name="RFQs"
                      stroke="#FF7138"
                      fill="#FF7138"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 6. Monthly Orders Volume: Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">6. Dispatched Production Batches (Counts)</CardTitle>
              <CardDescription>Confirmed production batch orders executed per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#858585" fontSize={11} />
                    <YAxis stroke="#858585" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="count" name="Batches" fill="#1B1B1B" radius={[4, 4, 0, 0]} />
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
          <h3 className="text-base font-bold font-heading text-[#111111]">
            Top-Performing Manufacturing Lines
          </h3>

          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <Card key={i} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-heading text-[#111111]">{p.name}</h4>
                  <p className="text-[10px] text-[#858585] font-mono">{p.category} • {p.units} units shipped</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold font-heading text-emerald-600">{p.revenue}</span>
                  <span className="text-[10px] text-[#20B8A5] font-mono block">Top Earner</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Production Deadlines & Capacity (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold font-heading text-[#111111]">
            Upcoming Production Deadlines & SLA
          </h3>

          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FF7138]">{o.orderNumber}</span>
                    <Badge variant="teal" size="xs">{o.stages[o.currentStageIndex]?.name}</Badge>
                  </div>
                  <h4 className="text-xs font-bold font-heading text-[#111111] mt-0.5">{o.productName}</h4>
                  <p className="text-[10px] text-[#858585] font-mono">Client: {o.customerName}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#111111] block">{o.carrier}</span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate('/manufacturer/orders')}
                    className="mt-1"
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
