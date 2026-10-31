import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Package, Wrench, AlertCircle, PlusCircle, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { RAW_MATERIALS } from '../../data/mockData';

export const ManufacturerInventoryPage = () => {
  const TOOLING_INVENTORY = [
    { id: 'TOOL-01', name: 'Sandvik CoroMill 390 16mm Endmill', type: 'Solid Carbide', remainingLife: '84%', bay: 'Bay #1 & #2' },
    { id: 'TOOL-02', name: 'Kennametal 12mm Ballnose 4-Flute', type: 'AlTiN Coated', remainingLife: '62%', bay: 'Bay #3' },
    { id: 'TOOL-03', name: 'Walter Titex 8.5mm Deep-Hole Drill', type: 'High Pressure Through-Coolant', remainingLife: '91%', bay: 'Bay #2' },
    { id: 'TOOL-04', name: 'Iscar Thread Mill M10x1.25', type: 'TiCN Coated', remainingLife: '73%', bay: 'Bay #4' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="teal" dot>Plant Stockroom</Badge>
            <Badge variant="orange">Automated Reorder Points</Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-[#111111] tracking-tight">
            Raw Material Stock & Tooling Inventory
          </h1>
          <p className="mt-1 text-sm text-[#858585] font-body">
            Real-time billet weights, certified aerospace alloy heats, and CNC cutting tool spindle wear tracking.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => alert('New material batch intake form opened')}
          leftIcon={<PlusCircle size={16} />}
        >
          Receive Inbound Heat
        </Button>
      </div>

      {/* Raw Materials Inventory */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-[#111111] flex items-center gap-2">
          <Layers className="text-[#FF7138] w-5 h-5" />
          Certified Billet & Alloy Stock
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(RAW_MATERIALS || []).map((mat) => {
            const stockKg = Number(mat.stock_kg ?? (mat.pricePerKg ? Math.round(mat.pricePerKg * 45) : 850));
            const costPerKg = mat.cost_per_kg_inr ?? (mat.pricePerKg ? Math.round(mat.pricePerKg * 85) : 1200);
            const stockPct = Math.min(100, Math.round((stockKg / 2000) * 100));
            const gradeName = mat.grade || 'Certified Industrial Spec';
            const isLowStock = stockKg <= 400;

            return (
              <Card key={mat.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#FF7138]">{mat.id}</span>
                    <Badge variant={!isLowStock ? 'teal' : 'orange'} size="xs">
                      {!isLowStock ? 'In Stock' : 'Low Stock'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold font-heading text-[#111111]">
                    {mat.name}
                  </h3>
                  <p className="text-xs font-mono text-[#858585] mb-3">
                    Grade: {gradeName}
                  </p>

                  <div className="p-3 bg-[#F5F5F3] rounded-xl border border-gray-200 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#858585]">Available Weight:</span>
                      <span className="font-bold text-[#111111]">{(stockKg || 0).toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#858585]">Benchmark Rate:</span>
                      <span className="font-bold text-[#20B8A5]">₹{costPerKg.toLocaleString()} / kg</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#20B8A5] h-full rounded-full"
                        style={{ width: `${stockPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#858585] text-[11px]">
                    Lot Heat: #IND-992{mat.id.slice(-2)}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => alert(`Reorder initiated for ${mat.name}`)}
                  >
                    Reorder Stock
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tooling Crib */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="text-[#20B8A5] w-4 h-4" />
            Active CNC Tooling & Spindle Inserts
          </CardTitle>
          <CardDescription>Automated wear prediction based on machine spindle operating hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F5F5F3] text-[#858585] uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3">Tool ID</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Assigned Spindle</th>
                  <th className="p-3">Remaining Tool Life</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TOOLING_INVENTORY.map((tool) => (
                  <tr key={tool.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-[#111111]">{tool.id}</td>
                    <td className="p-3 font-bold text-[#111111] font-heading">{tool.name}</td>
                    <td className="p-3 text-[#858585]">{tool.type}</td>
                    <td className="p-3 text-[#858585]">{tool.bay}</td>
                    <td className="p-3 font-bold text-[#20B8A5]">{tool.remainingLife}</td>
                    <td className="p-3 text-right">
                      <Badge variant="teal" size="xs">Optimal</Badge>
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

export default ManufacturerInventoryPage;

