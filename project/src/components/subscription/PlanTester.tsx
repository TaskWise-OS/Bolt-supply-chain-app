import React from 'react';
import { Settings } from 'lucide-react';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

export function PlanTester() {
  const { planName, limits } = useFeatureAccess();

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Current Plan</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1 border-b">
          <span className="text-gray-600">Plan:</span>
          <span className="font-semibold text-blue-600">{planName}</span>
        </div>

        <div className="text-xs text-gray-700 space-y-1 pt-2">
          <p className="font-medium mb-1">Limits:</p>
          <div className="space-y-1 pl-2">
            <div className="flex justify-between">
              <span>Products:</span>
              <span className="font-mono">{limits.maxProducts === -1 ? '∞' : limits.maxProducts}</span>
            </div>
            <div className="flex justify-between">
              <span>Warehouses:</span>
              <span className="font-mono">{limits.maxWarehouses === -1 ? '∞' : limits.maxWarehouses}</span>
            </div>
            <div className="flex justify-between">
              <span>Forecasts:</span>
              <span className="font-mono">{limits.maxForecasts === -1 ? '∞' : limits.maxForecasts}</span>
            </div>
          </div>

          <p className="font-medium mt-2 mb-1">Features:</p>
          <div className="space-y-1 pl-2">
            <div className="flex justify-between">
              <span>AI Forecasting:</span>
              <span>{limits.hasAIForecasting ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Scenario Planning:</span>
              <span>{limits.hasScenarioPlanning ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Predictive Alerts:</span>
              <span>{limits.hasPredictiveAlerts ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Import Data:</span>
              <span>{limits.hasImportCapabilities ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        <p>💡 To test different plans, update your subscription in Stripe or the database</p>
      </div>
    </div>
  );
}
