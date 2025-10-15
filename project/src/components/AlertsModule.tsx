import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, AlertCircle, Zap, Filter } from 'lucide-react';
import { supabase, Alert, Product, Warehouse } from '../lib/supabase';

type AlertWithRelations = Alert & {
  products?: Product;
  warehouses?: Warehouse;
};

export function AlertsModule() {
  const [alerts, setAlerts] = useState<AlertWithRelations[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [showResolved]);

  const loadAlerts = async () => {
    setLoading(true);
    let query = supabase
      .from('alerts')
      .select('*, products(*), warehouses(*)')
      .order('created_at', { ascending: false });

    if (!showResolved) {
      query = query.eq('is_resolved', false);
    }

    const { data, error } = await query;

    if (data && !error) {
      setAlerts(data);
    }
    setLoading(false);
  };

  const resolveAlert = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({ is_resolved: true })
      .eq('id', alertId);

    await loadAlerts();
  };

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const typeMatch = filterType === 'all' || alert.type === filterType;
    return severityMatch && typeMatch;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return '📉';
      case 'overstock': return '📈';
      case 'expiry': return '⏰';
      case 'delay': return '🚚';
      case 'forecast': return '🔮';
      default: return '⚠️';
    }
  };

  const summary = {
    total: alerts.filter(a => !a.is_resolved).length,
    critical: alerts.filter(a => !a.is_resolved && a.severity === 'critical').length,
    warning: alerts.filter(a => !a.is_resolved && a.severity === 'warning').length,
    info: alerts.filter(a => !a.is_resolved && a.severity === 'info').length,
    resolved: alerts.filter(a => a.is_resolved).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Alerts & Notifications</h1>
        <p className="text-slate-600">Predictive alerts with AI-powered recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
          <p className="text-sm text-slate-600 mt-1">Critical Alerts</p>
          <p className="text-xs text-slate-500 mt-1">Requires immediate action</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary.warning}</p>
          <p className="text-sm text-slate-600 mt-1">Warnings</p>
          <p className="text-xs text-slate-500 mt-1">Needs attention soon</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Info className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary.info}</p>
          <p className="text-sm text-slate-600 mt-1">Informational</p>
          <p className="text-xs text-slate-500 mt-1">For your awareness</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{summary.resolved}</p>
          <p className="text-sm text-slate-600 mt-1">Resolved</p>
          <p className="text-xs text-slate-500 mt-1">Successfully handled</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">Predictive Alert System</h3>
            <p className="text-sm text-slate-700">
              Our AI monitors your entire supply chain 24/7 and predicts potential issues before they become problems. Each alert includes specific recommendations and actionable next steps to help you maintain optimal operations.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="low_stock">Low Stock</option>
                <option value="overstock">Overstock</option>
                <option value="expiry">Expiry</option>
                <option value="delay">Delay</option>
                <option value="forecast">Forecast</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Show resolved alerts</span>
            </label>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading alerts...</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h3>
              <p className="text-slate-600">No active alerts at this time. Your supply chain is running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const product = alert.products;
                const warehouse = alert.warehouses;

                return (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-xl border-2 ${getSeverityColor(alert.severity)} ${alert.is_resolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs opacity-75">
                              <span className="uppercase font-medium">{alert.severity}</span>
                              <span>•</span>
                              <span>{new Date(alert.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm mb-4 opacity-90">{alert.message}</p>

                        {(product || warehouse) && (
                          <div className="flex items-center gap-4 mb-4 text-sm opacity-80">
                            {product && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Product:</span>
                                <span>{product.name} ({product.sku})</span>
                              </div>
                            )}
                            {warehouse && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Warehouse:</span>
                                <span>{warehouse.name}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {alert.action_recommended && (
                          <div className="bg-white/50 rounded-lg p-4 border border-current/20">
                            <div className="flex items-start gap-2">
                              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm mb-1">Recommended Action</p>
                                <p className="text-sm opacity-90">{alert.action_recommended}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {!alert.is_resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="ml-4 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium shadow-sm flex items-center gap-2 flex-shrink-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      )}

                      {alert.is_resolved && (
                        <div className="ml-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2 flex-shrink-0">
                          <CheckCircle className="w-4 h-4" />
                          Resolved
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
