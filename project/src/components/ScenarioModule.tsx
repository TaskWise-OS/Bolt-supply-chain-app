import { useState } from 'react';
import { Lightbulb, TrendingUp, Truck, AlertTriangle, Play, CheckCircle, DollarSign, Clock } from 'lucide-react';
import { aiEngine } from '../lib/ai-engine';

interface ScenarioResult {
  impact: string;
  affectedProducts: string[];
  recommendedActions: string[];
  estimatedCostImpact: number;
  timelineAdjustment: number;
}

export function ScenarioModule() {
  const [selectedScenario, setSelectedScenario] = useState<'demand_spike' | 'supply_delay' | 'route_disruption'>('demand_spike');
  const [parameters, setParameters] = useState<Record<string, any>>({
    spikePercentage: 50,
    delayDays: 7,
    duration: 3
  });
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const scenarios = [
    {
      id: 'demand_spike' as const,
      name: 'Demand Spike',
      icon: TrendingUp,
      color: 'blue',
      description: 'Simulate sudden increase in product demand',
      parameters: [
        { key: 'spikePercentage', label: 'Demand Increase (%)', type: 'number', min: 10, max: 200, default: 50 }
      ]
    },
    {
      id: 'supply_delay' as const,
      name: 'Supply Chain Delay',
      icon: AlertTriangle,
      color: 'red',
      description: 'Model impact of supplier delays on operations',
      parameters: [
        { key: 'delayDays', label: 'Delay Duration (days)', type: 'number', min: 1, max: 30, default: 7 }
      ]
    },
    {
      id: 'route_disruption' as const,
      name: 'Route Disruption',
      icon: Truck,
      color: 'amber',
      description: 'Analyze effects of logistics route issues',
      parameters: [
        { key: 'duration', label: 'Disruption Duration (days)', type: 'number', min: 1, max: 14, default: 3 }
      ]
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario)!;

  const runSimulation = async () => {
    setIsRunning(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const simulationResult = aiEngine.simulateScenario(selectedScenario, parameters);
    setResult(simulationResult);
    setIsRunning(false);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'red': return 'bg-red-50 border-red-200 text-red-700';
      case 'amber': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Scenario Simulation</h1>
        <p className="text-slate-600">Model supply chain disruptions and test contingency plans</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Lightbulb className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">What-If Analysis</h3>
            <p className="text-sm text-slate-700">
              Run simulations to understand how different disruptions could affect your supply chain. Use these insights to build contingency plans and improve resilience.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isSelected = selectedScenario === scenario.id;

          return (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario.id);
                setResult(null);
              }}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? getColorClasses(scenario.color)
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isSelected ? '' : 'text-slate-400'}`} />
              <h3 className="font-semibold text-lg mb-2">{scenario.name}</h3>
              <p className="text-sm opacity-75">{scenario.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Simulation Parameters</h2>

        <div className="space-y-4 mb-6">
          {currentScenario.parameters.map((param) => (
            <div key={param.key}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {param.label}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  value={parameters[param.key] || param.default}
                  onChange={(e) => setParameters({ ...parameters, [param.key]: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-lg font-semibold text-slate-900 w-16 text-right">
                  {parameters[param.key] || param.default}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-sm'
          } text-white`}
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Running Simulation...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Simulation
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Simulation Results</h2>
              <p className="text-sm text-slate-600">Analysis complete</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">Impact Level</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">{result.impact}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-slate-700">Estimated Cost</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                ${result.estimatedCostImpact.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Timeline Impact</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                +{result.timelineAdjustment} days
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Recommended Actions</h3>
              <div className="space-y-2">
                {result.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Mitigation Strategy
              </h3>
              <p className="text-sm text-slate-700">
                Implementing the recommended actions can reduce the impact by 30-40% and minimize operational disruption. Consider adding these scenarios to your regular contingency planning reviews.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
