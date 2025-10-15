import React, { useState } from 'react';
import { Settings, Play, BarChart3, AlertTriangle } from 'lucide-react';
import { ScenarioModal } from '../modals/ScenarioModal';

export function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState<{name: string; description: string} | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRunScenario = (name: string, description: string) => {
    setSelectedScenario({ name, description });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scenario Planning</h1>
        <p className="mt-1 text-sm text-gray-600">
          Simulate different scenarios to optimize your supply chain strategy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Scenarios</h3>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Simulations Run</h3>
              <p className="text-2xl font-bold text-green-600">127</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Risk Scenarios</h3>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Templates</h3>
          <div className="space-y-4">
            {[
              {
                name: 'Demand Spike',
                description: 'Simulate sudden increase in product demand',
                impact: 'High',
                color: 'red'
              },
              {
                name: 'Supply Disruption',
                description: 'Model supplier delays or shortages',
                impact: 'Critical',
                color: 'red'
              },
              {
                name: 'Seasonal Variation',
                description: 'Analyze seasonal demand patterns',
                impact: 'Medium',
                color: 'yellow'
              },
              {
                name: 'New Market Entry',
                description: 'Plan for expansion into new markets',
                impact: 'Medium',
                color: 'blue'
              }
            ].map((scenario, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    scenario.color === 'red' 
                      ? 'bg-red-100 text-red-800'
                      : scenario.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {scenario.impact}
                  </span>
                  <button
                    onClick={() => handleRunScenario(scenario.name, scenario.description)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Simulation Results</h3>
          <div className="space-y-4">
            {[
              {
                scenario: 'Q4 Demand Spike',
                date: '2024-01-15',
                result: 'Inventory shortage in 3 warehouses',
                recommendation: 'Increase safety stock by 25%'
              },
              {
                scenario: 'Supplier Delay',
                date: '2024-01-14',
                result: 'Production delay of 5 days',
                recommendation: 'Diversify supplier base'
              },
              {
                scenario: 'New Product Launch',
                date: '2024-01-13',
                result: 'Positive ROI projection',
                recommendation: 'Proceed with launch plan'
              }
            ].map((result, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{result.scenario}</h4>
                  <span className="text-sm text-gray-500">{result.date}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{result.result}</p>
                <p className="text-sm font-medium text-indigo-600">{result.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScenarioModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        scenario={selectedScenario}
      />
    </div>
  );
}