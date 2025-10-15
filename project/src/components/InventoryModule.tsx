import { useEffect, useState } from 'react';
import { Package, Search, Filter, Download, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, Inventory, Product, Warehouse } from '../lib/supabase';

type InventoryWithRelations = Inventory & {
  products?: Product;
  warehouses?: Warehouse;
};

export function InventoryModule() {
  const [inventory, setInventory] = useState<InventoryWithRelations[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'optimal' | 'overstock'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, searchTerm, filterStatus]);

  const loadInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*, products(*), warehouses(*)')
      .order('last_updated', { ascending: false });

    if (data && !error) {
      setInventory(data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.products?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouses?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        const product = item.products;
        if (!product) return false;

        const status = getStockStatus(item.available_quantity, product.reorder_point, product.safety_stock);
        return status === filterStatus;
      });
    }

    setFilteredInventory(filtered);
  };

  const getStockStatus = (available: number, reorderPoint: number, safetyStock: number): 'low' | 'optimal' | 'overstock' => {
    if (available <= safetyStock) return 'low';
    if (available > reorderPoint * 2.5) return 'overstock';
    return 'optimal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-700 border-red-200';
      case 'overstock': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const exportToCSV = () => {
    const headers = ['SKU', 'Product', 'Warehouse', 'Quantity', 'Available', 'Reserved', 'Status'];
    const rows = filteredInventory.map(item => [
      item.products?.sku || '',
      item.products?.name || '',
      item.warehouses?.name || '',
      item.quantity,
      item.available_quantity,
      item.reserved_quantity,
      getStockStatus(item.available_quantity, item.products?.reorder_point || 0, item.products?.safety_stock || 0)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const summary = {
    total: inventory.length,
    low: inventory.filter(i => getStockStatus(i.available_quantity, i.products?.reorder_point || 0, i.products?.safety_stock || 0) === 'low').length,
    optimal: inventory.filter(i => getStockStatus(i.available_quantity, i.products?.reorder_point || 0, i.products?.safety_stock || 0) === 'optimal').length,
    overstock: inventory.filter(i => getStockStatus(i.available_quantity, i.products?.reorder_point || 0, i.products?.safety_stock || 0) === 'overstock').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory Management</h1>
          <p className="text-slate-600">Real-time stock tracking across all warehouses</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Items</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</p>
            </div>
            <Package className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{summary.low}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Optimal</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{summary.optimal}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Overstock</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{summary.overstock}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or warehouse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="low">Low Stock</option>
                <option value="optimal">Optimal</option>
                <option value="overstock">Overstock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading inventory...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No inventory items found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Product</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">SKU</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Warehouse</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Total</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Available</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Reserved</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Stock Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInventory.map((item) => {
                  const product = item.products;
                  const warehouse = item.warehouses;
                  const status = product ? getStockStatus(item.available_quantity, product.reorder_point, product.safety_stock) : 'optimal';
                  const percentage = product ? Math.min(100, (item.available_quantity / (product.reorder_point * 2)) * 100) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{product?.name || 'Unknown'}</div>
                        <div className="text-sm text-slate-500">{product?.category || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">{product?.sku || ''}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{warehouse?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-green-600">{item.available_quantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-amber-600">{item.reserved_quantity}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-[80px]">
                            <div
                              className={`h-2 rounded-full ${status === 'low' ? 'bg-red-500' : status === 'overstock' ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600 w-12 text-right">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
