import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: {
    name: string;
    description: string;
  } | null;
}

export function ScenarioModal({ isOpen, onClose, scenario }: ScenarioModalProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    setRunning(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResults: any = {
      'Demand Spike': {
        impact: 'High demand increase detected',
        recommendations: [
          'Increase inventory levels by 30%',
          'Alert suppliers for expedited delivery',
          'Activate backup warehouses'
        ],
        metrics: {
          expectedDemandIncrease: '45%',
          requiredInventory: '2,500 units',
          estimatedCost: '$125,000'
        }
      },
      'Supply Disruption': {
        impact: 'Critical supply chain interruption',
        recommendations: [
          'Contact alternative suppliers immediately',
          'Implement product rationing',
          'Communicate delays to customers'
        ],
        metrics: {
          affectedProducts: '15 SKUs',
          estimatedDelay: '7-10 days',
          revenueImpact: '-$250,000'
        }
      },
      'Seasonal Variation': {
        impact: 'Moderate seasonal demand changes expected',
        recommendations: [
          'Adjust inventory levels for peak season',
          'Optimize warehouse space allocation',
          'Schedule additional staff'
        ],
        metrics: {
          peakMonths: 'Nov-Dec',
          expectedIncrease: '25%',
          prepTime: '6 weeks'
        }
      },
      'New Market Entry': {
        impact: 'New market expansion opportunity',
        recommendations: [
          'Establish local distribution center',
          'Partner with regional suppliers',
          'Conduct market demand analysis'
        ],
        metrics: {
          initialInvestment: '$500,000',
          projectedROI: '18 months',
          marketSize: '50,000 potential customers'
        }
      }
    };

    setResult(mockResults[scenario?.name || 'Demand Spike'] || mockResults['Demand Spike']);
    setRunning(false);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  if (!isOpen || !scenario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{scenario.name}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{scenario.description}</p>

        {!result && !running && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Scenario Parameters</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Analysis duration: Next 90 days</li>
              <li>• Data sources: Historical sales, inventory levels, supplier data</li>
              <li>• AI-powered predictive modeling</li>
            </ul>
          </div>
        )}

        {running && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Running scenario analysis...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Impact Assessment</h3>
              <p className="text-yellow-800">{result.impact}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(result.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-green-100 text-green-700 rounded-full text-center text-sm font-semibold mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {!result && (
            <button
              onClick={handleRun}
              disabled={running}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {running && <Loader2 className="w-4 h-4 animate-spin" />}
              {running ? 'Running...' : 'Run Analysis'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
