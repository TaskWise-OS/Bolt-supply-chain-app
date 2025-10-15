import { LayoutDashboard, Package, TrendingUp, Truck, AlertTriangle, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, Alert, Inventory, Product, Warehouse } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

interface KPIData {
  totalProducts: number;
  totalInventory: number;
  criticalAlerts: number;
  activeShipments: number;
  inventoryValue: number;
  avgFulfillmentRate: number;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [kpis, setKpis] = useState<KPIData>({
    totalProducts: 0,
    totalInventory: 0,
    criticalAlerts: 0,
    activeShipments: 0,
    inventoryValue: 0,
    avgFulfillmentRate: 95.7
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [lowStockItems, setLowStockItems] = useState<(Inventory & { products?: Product; warehouses?: Warehouse })[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [productsRes, inventoryRes, alertsRes, shipmentsRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('inventory').select('*, products(*), warehouses(*)'),
      supabase.from('alerts').select('*, products(*), warehouses(*)').eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('shipments').select('*').in('status', ['scheduled', 'in_transit'])
    ]);

    if (productsRes.data && inventoryRes.data) {
      const totalInv = inventoryRes.data.reduce((sum, inv) => sum + inv.quantity, 0);
      const inventoryValue = inventoryRes.data.reduce((sum, inv) => {
        const product = inv.products;
        return sum + (product ? inv.quantity * product.unit_cost : 0);
      }, 0);

      const lowStock = inventoryRes.data.filter(inv => {
        const product = inv.products;
        return product && inv.available_quantity <= product.reorder_point;
      });

      setKpis({
        totalProducts: productsRes.data.length,
        totalInventory: totalInv,
        criticalAlerts: alertsRes.data?.filter(a => a.severity === 'critical').length || 0,
        activeShipments: shipmentsRes.data?.length || 0,
        inventoryValue,
        avgFulfillmentRate: 95.7
      });

      setLowStockItems(lowStock.slice(0, 5));
    }

    if (alertsRes.data) {
      setRecentAlerts(alertsRes.data);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Supply Chain Dashboard</h1>
        <p className="text-slate-600">Real-time insights and AI-powered recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('inventory')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{kpis.totalProducts}</h3>
          <p className="text-sm text-slate-600 mt-1">Total Products</p>
          <p className="text-xs text-slate-500 mt-2">{kpis.totalInventory.toLocaleString()} units in stock</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('alerts')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">{kpis.criticalAlerts} Critical</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{recentAlerts.length}</h3>
          <p className="text-sm text-slate-600 mt-1">Active Alerts</p>
          <p className="text-xs text-slate-500 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('logistics')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-600">On Track</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{kpis.activeShipments}</h3>
          <p className="text-sm text-slate-600 mt-1">Active Shipments</p>
          <p className="text-xs text-slate-500 mt-2">In transit & scheduled</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">${(kpis.inventoryValue / 1000).toFixed(1)}k</h3>
          <p className="text-sm text-slate-600 mt-1">Inventory Value</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Utilization</span>
              <span className="text-slate-700 font-medium">68%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('forecasting')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{kpis.avgFulfillmentRate}%</h3>
          <p className="text-sm text-slate-600 mt-1">Fulfillment Rate</p>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2.3% vs last month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('forecasting')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">87%</h3>
          <p className="text-sm text-slate-600 mt-1">Forecast Accuracy</p>
          <p className="text-xs text-slate-500 mt-2">AI prediction confidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Critical Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No active alerts</p>
            ) : (
              recentAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <h3 className="font-medium text-sm">{alert.title}</h3>
                      </div>
                      <p className="text-xs opacity-90 mb-2">{alert.message}</p>
                      {alert.action_recommended && (
                        <p className="text-xs font-medium">→ {alert.action_recommended}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Low Stock Items</h2>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">All items adequately stocked</p>
            ) : (
              lowStockItems.map(item => {
                const product = item.products;
                const warehouse = item.warehouses;
                const percentage = product ? (item.available_quantity / product.reorder_point) * 100 : 0;
                const status = percentage < 50 ? 'critical' : 'warning';

                return (
                  <div key={item.id} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm text-slate-900">{product?.name || 'Unknown'}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{warehouse?.name || 'Unknown'}</p>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Available: {item.available_quantity} units</span>
                      <span className="text-slate-700 font-medium">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${status === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
