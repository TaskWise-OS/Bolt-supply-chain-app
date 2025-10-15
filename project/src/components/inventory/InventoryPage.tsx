import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Filter, Upload, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AddProductModal } from '../modals/AddProductModal';
import { FilterModal, FilterValues } from '../modals/FilterModal';
import { DataImporter } from '../import/DataImporter';

interface InventoryItem {
  id: string;
  quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  products: {
    id: string;
    sku: string;
    name: string;
    category: string;
    unit_cost: number;
  };
  warehouses: {
    id: string;
    name: string;
    location: string;
  };
}

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    category: '',
    warehouse: '',
    stockStatus: '',
    minValue: '',
    maxValue: '',
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select(`
            id,
            quantity,
            available_quantity,
            reserved_quantity,
            products!inner(
              id,
              sku,
              name,
              category,
              unit_cost
            ),
            warehouses!inner(
              id,
              name,
              location
            )
          `);

        if (error) throw error;
        setInventory(data || []);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.products.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouses.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filters.category && item.products.category !== filters.category) return false;
    if (filters.warehouse && item.warehouses.id !== filters.warehouse) return false;

    const totalValue = item.quantity * item.products.unit_cost;
    if (filters.minValue && totalValue < parseFloat(filters.minValue)) return false;
    if (filters.maxValue && totalValue > parseFloat(filters.maxValue)) return false;

    if (filters.stockStatus) {
      const stockLevel = item.available_quantity;
      const status = stockLevel < 50 ? 'low' : stockLevel < 100 ? 'medium' : 'good';
      if (status !== filters.stockStatus) return false;
    }

    return true;
  });

  const exportInventory = () => {
    const csv = [
      ['SKU', 'Product Name', 'Category', 'Warehouse', 'Location', 'Total Quantity', 'Available', 'Reserved', 'Unit Cost', 'Total Value'],
      ...filteredInventory.map(item => [
        item.products.sku,
        item.products.name,
        item.products.category,
        item.warehouses.name,
        item.warehouses.location,
        item.quantity,
        item.available_quantity,
        item.reserved_quantity,
        item.products.unit_cost,
        item.quantity * item.products.unit_cost
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage your inventory across all warehouses
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImporter(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={exportInventory}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, SKUs, or warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reserved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => {
              const totalValue = item.quantity * item.products.unit_cost;
              const stockLevel = item.available_quantity;
              const stockStatus = stockLevel < 50 ? 'low' : stockLevel < 100 ? 'medium' : 'good';
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.products.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.products.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.warehouses.name}</div>
                    <div className="text-sm text-gray-500">{item.warehouses.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.available_quantity?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.reserved_quantity?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${totalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stockStatus === 'good' 
                        ? 'bg-green-100 text-green-800'
                        : stockStatus === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stockStatus === 'good' ? 'In Stock' : stockStatus === 'medium' ? 'Low Stock' : 'Critical'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding some products.'}
            </p>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          const fetchInventory = async () => {
            const { data } = await supabase
              .from('inventory')
              .select(`
                id,
                quantity,
                available_quantity,
                reserved_quantity,
                products!inner(
                  id,
                  sku,
                  name,
                  category,
                  unit_cost
                ),
                warehouses!inner(
                  id,
                  name,
                  location
                )
              `);
            setInventory(data || []);
          };
          fetchInventory();
        }}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => setFilters(newFilters)}
      />

      <DataImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onSuccess={() => {
          const fetchInventory = async () => {
            const { data } = await supabase
              .from('inventory')
              .select(`
                id,
                quantity,
                available_quantity,
                reserved_quantity,
                products!inner(
                  id,
                  sku,
                  name,
                  category,
                  unit_cost
                ),
                warehouses!inner(
                  id,
                  name,
                  location
                )
              `);
            setInventory(data || []);
          };
          fetchInventory();
        }}
      />
    </div>
  );
}