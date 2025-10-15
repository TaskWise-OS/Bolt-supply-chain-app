import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generatePredictiveAlerts } from '../../lib/alert-generator';

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  is_resolved: boolean;
  action_recommended: string | null;
  created_at: string;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });
        
        if (filter === 'unresolved') {
          query = query.eq('is_resolved', false);
        } else if (filter === 'resolved') {
          query = query.eq('is_resolved', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        setAlerts(data || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter]);

  const handleGenerateAlerts = async () => {
    setGenerating(true);
    try {
      const count = await generatePredictiveAlerts();
      alert(`Generated ${count} new predictive alerts`);
      const fetchAlerts = async () => {
        let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (filter === 'unresolved') {
          query = query.eq('is_resolved', false);
        } else if (filter === 'resolved') {
          query = query.eq('is_resolved', true);
        }
        const { data } = await query;
        setAlerts(data || []);
      };
      await fetchAlerts();
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setGenerating(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_resolved: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true } : alert
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            AI-powered predictive alerts and system notifications
          </p>
        </div>
        <button
          onClick={handleGenerateAlerts}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'Generate Alerts'}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unresolved'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unresolved ({alerts.filter(a => !a.is_resolved).length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Alerts
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white border rounded-lg p-6 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {alert.is_resolved ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    getSeverityIcon(alert.severity)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{alert.message}</p>
                  {alert.action_recommended && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">Recommended Action:</p>
                      <p className="text-sm text-gray-700">{alert.action_recommended}</p>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!alert.is_resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unresolved' 
                ? 'All alerts have been resolved.' 
                : 'No alerts match the current filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}