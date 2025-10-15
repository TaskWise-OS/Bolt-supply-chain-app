import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingDown, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { aiEngine } from '../../lib/ai-engine';

interface ReorderSuggestion {
  product: {
    id: string;
    name: string;
    sku: string;
  };
  currentStock: number;
  forecastedDemand: number;
  suggestedOrderQty: number;
  urgency: 'high' | 'medium' | 'low';
  reasoning: string;
}

export function ReorderRecommendations() {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReorderSuggestions();
  }, []);

  const generateReorderSuggestions = async () => {
    try {
      const { data: inventory } = await supabase
        .from('inventory')
        .select(`
          product_id,
          available_quantity,
          products!inner(
            id,
            name,
            sku,
            reorder_point
          )
        `);

      if (!inventory || inventory.length === 0) {
        setLoading(false);
        return;
      }

      const products = inventory.map(item => ({
        ...item.products,
        safety_stock: Math.floor(item.products.reorder_point * 0.3)
      })) as any[];

      const forecasts = products.map(product => {
        const historicalData = Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 50) + product.reorder_point * 0.5
        );
        const forecast = aiEngine.generateDemandForecast(product, historicalData, 30);
        return {
          product_id: product.id,
          predicted_demand: forecast.predictedDemand,
          recommended_order_qty: forecast.recommendedOrderQty
        };
      }) as any[];

      const suggestions = aiEngine.generateReorderSuggestions(
        inventory as any,
        products,
        forecasts
      );

      setSuggestions(suggestions.slice(0, 5).map(s => ({
        product: {
          id: s.product.id,
          name: s.product.name,
          sku: s.product.sku,
        },
        currentStock: s.currentStock,
        forecastedDemand: s.forecastedDemand,
        suggestedOrderQty: s.suggestedOrderQty,
        urgency: s.urgency,
        reasoning: s.reasoning,
      })));
    } catch (error) {
      console.error('Error generating reorder suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Automated Reorder Recommendations</h3>
        <Package className="w-5 h-5 text-blue-600" />
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <TrendingDown className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">All stock levels are optimal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.product.id}
              className={`p-4 rounded-lg border-l-4 ${
                suggestion.urgency === 'high'
                  ? 'bg-red-50 border-red-500'
                  : suggestion.urgency === 'medium'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {suggestion.urgency === 'high' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <h4 className="font-medium text-gray-900">{suggestion.product.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      suggestion.urgency === 'high'
                        ? 'bg-red-100 text-red-800'
                        : suggestion.urgency === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {suggestion.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.product.sku}</p>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Current</p>
                      <p className="font-semibold text-gray-900">{suggestion.currentStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Forecast</p>
                      <p className="font-semibold text-gray-900">{suggestion.forecastedDemand}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Order</p>
                      <p className="font-semibold text-green-600">{suggestion.suggestedOrderQty}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{suggestion.reasoning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
