import React, { useEffect, useState } from 'react';
import { Package, Warehouse, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AddProductModal } from '../modals/AddProductModal';
import { ScenarioModal } from '../modals/ScenarioModal';
import { ReorderRecommendations } from './ReorderRecommendations';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  lowStockAlerts: number;
  totalInventoryValue: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalWarehouses: 0,
    lowStockAlerts: 0,
    totalInventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch warehouses count
        const { count: warehousesCount } = await supabase
          .from('warehouses')
          .select('*', { count: 'exact', head: true });

        // Fetch low stock alerts
        const { count: alertsCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'low_stock')
          .eq('is_resolved', false);

        // Calculate total inventory value
        const { data: inventoryData } = await supabase
          .from('inventory')
          .select(`
            quantity,
            products!inner(unit_cost)
          `);

        const totalValue = inventoryData?.reduce((sum, item) => {
          return sum + (item.quantity || 0) * (item.products.unit_cost || 0);
        }, 0) || 0;

        setStats({
          totalProducts: productsCount || 0,
          totalWarehouses: warehousesCount || 0,
          lowStockAlerts: alertsCount || 0,
          totalInventoryValue: totalValue,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Warehouses',
      value: stats.totalWarehouses.toLocaleString(),
      icon: Warehouse,
      color: 'bg-green-500',
    },
    {
      name: 'Inventory Value',
      value: `$${stats.totalInventoryValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Low Stock Alerts',
      value: stats.lowStockAlerts.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your supply chain operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${stat.color} rounded flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">New shipment received at Warehouse A</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Low stock alert for Product SKU-001</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Demand forecast updated for Q4</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Add New Product
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              Create Purchase Order
            </button>
            <button
              onClick={() => setShowScenarioModal(true)}
              className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Run Scenario Analysis
            </button>
          </div>
        </div>
      </div>

      <ReorderRecommendations />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={() => {
          setShowAddProductModal(false);
          const fetchStats = async () => {
            const { count: productsCount } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true });
            setStats(prev => ({ ...prev, totalProducts: productsCount || 0 }));
          };
          fetchStats();
        }}
      />

      <ScenarioModal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        scenario={{
          name: 'Quick Analysis',
          description: 'Run a quick scenario analysis on your current supply chain'
        }}
      />
    </div>
  );
}