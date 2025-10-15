import { useEffect, useState } from 'react';
import { Truck, Package, MapPin, Calendar, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase, Shipment, Warehouse } from '../lib/supabase';

type ShipmentWithWarehouse = Shipment & {
  warehouses?: Warehouse;
};

export function LogisticsModule() {
  const [shipments, setShipments] = useState<ShipmentWithWarehouse[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipments')
      .select('*, warehouses(*)')
      .order('scheduled_date', { ascending: false });

    if (data && !error) {
      setShipments(data);
    }
    setLoading(false);
  };

  const createSampleShipment = async () => {
    const warehouses = await supabase.from('warehouses').select('*').limit(1);
    if (!warehouses.data || warehouses.data.length === 0) return;

    const warehouse = warehouses.data[0];
    const shipmentNumber = `SHP-${Date.now()}`;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 7));

    await supabase.from('shipments').insert({
      shipment_number: shipmentNumber,
      origin_warehouse_id: warehouse.id,
      destination: '123 Customer St, New York, NY 10001',
      carrier: ['FedEx', 'UPS', 'DHL'][Math.floor(Math.random() * 3)],
      status: 'scheduled',
      scheduled_date: scheduledDate.toISOString(),
      tracking_number: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      cost: Math.floor(Math.random() * 500 + 100)
    });

    await loadShipments();
  };

  const filteredShipments = filterStatus === 'all'
    ? shipments
    : shipments.filter(s => s.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit': return <Truck className="w-5 h-5 text-blue-600" />;
      case 'delayed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const summary = {
    total: shipments.length,
    scheduled: shipments.filter(s => s.status === 'scheduled').length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    delayed: shipments.filter(s => s.status === 'delayed').length,
    totalCost: shipments.reduce((sum, s) => sum + s.cost, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Logistics Planning</h1>
          <p className="text-slate-600">Track shipments and optimize delivery routes</p>
        </div>
        <button
          onClick={createSampleShipment}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Package className="w-4 h-4" />
          Create Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
          <p className="text-sm text-slate-600 mt-1">Total Shipments</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary.scheduled}</p>
          <p className="text-sm text-slate-600 mt-1">Scheduled</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary.inTransit}</p>
          <p className="text-sm text-slate-600 mt-1">In Transit</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{summary.delivered}</p>
          <p className="text-sm text-slate-600 mt-1">Delivered</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">${(summary.totalCost / 1000).toFixed(1)}k</p>
          <p className="text-sm text-slate-600 mt-1">Total Cost</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <MapPin className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">AI Route Optimization</h3>
            <p className="text-sm text-slate-700 mb-3">
              Intelligent route planning reduces delivery times by 15-20% and cuts transportation costs. The system analyzes traffic patterns, carrier performance, and delivery constraints to suggest optimal routes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Real-time traffic analysis
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Multi-carrier optimization
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Cost-distance balance
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shipments</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading shipments...</div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No shipments found. Create your first shipment to get started.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Shipment #</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Origin</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Destination</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Carrier</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Scheduled</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Tracking</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredShipments.map((shipment) => {
                  const scheduledDate = new Date(shipment.scheduled_date);
                  const warehouse = shipment.warehouses;

                  return (
                    <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-medium text-slate-900">{shipment.shipment_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{warehouse?.name || 'Unknown'}</div>
                        <div className="text-sm text-slate-500">{warehouse?.location || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 max-w-xs truncate">{shipment.destination}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{shipment.carrier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(shipment.status)}
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(shipment.status)}`}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {scheduledDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-blue-600 hover:underline cursor-pointer">
                          {shipment.tracking_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-slate-900">${shipment.cost.toFixed(2)}</div>
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
