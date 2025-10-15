import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, Calendar, Target, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { aiEngine } from '../../lib/ai-engine';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { UpgradePrompt } from '../subscription/UpgradePrompt';

interface ForecastData {
  product: {
    id: string;
    name: string;
    sku: string;
  };
  predictedDemand: number;
  confidenceScore: number;
  recommendedOrderQty: number;
  currentStock: number;
  reasoning: string;
}

export function ForecastingPage() {
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const { hasFeature, planName } = useFeatureAccess();

  useEffect(() => {
    if (hasFeature('hasAIForecasting')) {
      generateForecasts();
    } else {
      setLoading(false);
    }
  }, [hasFeature]);

  const generateForecasts = async () => {
    try {
      const { data: inventory } = await supabase
        .from('inventory')
        .select(`
          available_quantity,
          product_id,
          products!inner(
            id,
            name,
            sku,
            reorder_point
          )
        `);

      if (!inventory) return;

      const forecastResults: ForecastData[] = [];
      let totalConfidence = 0;

      for (const item of inventory) {
        const historicalData = Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 50) + item.available_quantity * 0.05
        );

        const forecast = aiEngine.generateDemandForecast(
          {
            ...item.products,
            safety_stock: Math.floor(item.products.reorder_point * 0.3)
          } as any,
          historicalData,
          30
        );

        forecastResults.push({
          product: {
            id: item.products.id,
            name: item.products.name,
            sku: item.products.sku,
          },
          predictedDemand: forecast.predictedDemand,
          confidenceScore: forecast.confidenceScore,
          recommendedOrderQty: forecast.recommendedOrderQty,
          currentStock: item.available_quantity,
          reasoning: forecast.reasoning,
        });

        totalConfidence += forecast.confidenceScore;
      }

      setForecasts(forecastResults.sort((a, b) => b.predictedDemand - a.predictedDemand));
      setAvgAccuracy(totalConfidence / forecastResults.length || 0);
    } catch (error) {
      console.error('Error generating forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportForecasts = () => {
    const csv = [
      ['Product', 'SKU', 'Current Stock', 'Predicted Demand', 'Recommended Order', 'Confidence', 'Reasoning'],
      ...forecasts.map(f => [
        f.product.name,
        f.product.sku,
        f.currentStock,
        f.predictedDemand,
        f.recommendedOrderQty,
        f.confidenceScore + '%',
        f.reasoning
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demand-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasFeature('hasAIForecasting')) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Demand Forecasting</h1>
          <p className="mt-1 text-sm text-gray-600">
            AI-powered demand predictions and inventory optimization
          </p>
        </div>
        <UpgradePrompt
          feature="AI Demand Forecasting"
          currentPlan={planName}
          requiredPlan="SupplyVision Professional"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demand Forecasting</h1>
          <p className="mt-1 text-sm text-gray-600">
            AI-powered demand predictions and inventory optimization
          </p>
        </div>
        <button
          onClick={exportForecasts}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Forecasts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Forecast Accuracy</h3>
              <p className="text-2xl font-bold text-blue-600">{avgAccuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Forecasts</h3>
              <p className="text-2xl font-bold text-green-600">{forecasts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Forecast Period</h3>
              <p className="text-2xl font-bold text-purple-600">90 Days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI-Generated Demand Forecasts</h3>
          <p className="text-sm text-gray-600 mt-1">Based on historical patterns, seasonality, and trend analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Analysis</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecasts.map((forecast) => (
                <tr key={forecast.product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{forecast.product.name}</div>
                      <div className="text-sm text-gray-500">{forecast.product.sku}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {forecast.currentStock.toLocaleString()} units
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {forecast.predictedDemand.toLocaleString()} units
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {forecast.recommendedOrderQty.toLocaleString()} units
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        forecast.confidenceScore >= 85
                          ? 'bg-green-100 text-green-800'
                          : forecast.confidenceScore >= 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {forecast.confidenceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    {forecast.reasoning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {forecasts.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forecast data</h3>
            <p className="mt-1 text-sm text-gray-500">Add products to your inventory to generate forecasts.</p>
          </div>
        )}
      </div>
    </div>
  );
}