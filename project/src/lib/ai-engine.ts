import { Product, DemandForecast, Inventory } from './supabase';

export interface ForecastResult {
  productId: string;
  predictedDemand: number;
  confidenceScore: number;
  recommendedOrderQty: number;
  seasonalityFactor: number;
  reasoning: string;
}

export interface ScenarioResult {
  impact: string;
  affectedProducts: string[];
  recommendedActions: string[];
  estimatedCostImpact: number;
  timelineAdjustment: number;
}

export class AIEngine {
  generateDemandForecast(
    product: Product,
    historicalData: number[],
    daysAhead: number = 30
  ): ForecastResult {
    const avgDemand = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
    const trend = this.calculateTrend(historicalData);
    const seasonality = this.detectSeasonality(daysAhead);

    const predictedDemand = Math.round(
      avgDemand * (1 + trend) * seasonality
    );

    const variance = this.calculateVariance(historicalData);
    const confidenceScore = Math.max(60, Math.min(95, 85 - (variance * 10)));

    const recommendedOrderQty = Math.max(
      product.reorder_point,
      predictedDemand + product.safety_stock
    );

    return {
      productId: product.id,
      predictedDemand,
      confidenceScore: Math.round(confidenceScore),
      recommendedOrderQty,
      seasonalityFactor: seasonality,
      reasoning: this.generateReasoning(trend, seasonality, variance)
    };
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const recentAvg = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const olderAvg = data.slice(0, 7).reduce((a, b) => a + b, 0) / 7;

    return (recentAvg - olderAvg) / olderAvg;
  }

  private detectSeasonality(dayOfYear: number): number {
    const seasonalPeaks = [60, 150, 330];
    const nearPeak = seasonalPeaks.some(peak =>
      Math.abs((dayOfYear % 365) - peak) < 30
    );

    return nearPeak ? 1.2 : 1.0;
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
    return Math.sqrt(variance) / mean;
  }

  private generateReasoning(trend: number, seasonality: number, variance: number): string {
    const parts = [];

    if (trend > 0.1) {
      parts.push('Strong upward trend detected');
    } else if (trend < -0.1) {
      parts.push('Declining demand pattern');
    } else {
      parts.push('Stable demand pattern');
    }

    if (seasonality > 1.1) {
      parts.push('seasonal peak period');
    }

    if (variance < 0.2) {
      parts.push('high prediction confidence');
    } else if (variance > 0.4) {
      parts.push('moderate volatility in historical data');
    }

    return parts.join(', ');
  }

  analyzeStockLevel(inventory: Inventory, product: Product): {
    status: 'critical' | 'warning' | 'healthy';
    message: string;
    recommendation: string;
  } {
    const { available_quantity } = inventory;
    const { reorder_point, safety_stock } = product;

    if (available_quantity <= safety_stock) {
      return {
        status: 'critical',
        message: `Critical low stock: ${available_quantity} units (Safety: ${safety_stock})`,
        recommendation: `Expedite emergency order for ${reorder_point * 2} units`
      };
    }

    if (available_quantity <= reorder_point) {
      return {
        status: 'warning',
        message: `Below reorder point: ${available_quantity} units`,
        recommendation: `Place regular order for ${reorder_point} units`
      };
    }

    if (available_quantity > reorder_point * 3) {
      return {
        status: 'warning',
        message: `Overstock detected: ${available_quantity} units`,
        recommendation: 'Consider redistribution or promotional pricing'
      };
    }

    return {
      status: 'healthy',
      message: `Stock level optimal: ${available_quantity} units`,
      recommendation: 'Continue monitoring'
    };
  }

  simulateScenario(
    scenarioType: 'demand_spike' | 'supply_delay' | 'route_disruption',
    parameters: Record<string, any>
  ): ScenarioResult {
    switch (scenarioType) {
      case 'demand_spike':
        return this.simulateDemandSpike(parameters);
      case 'supply_delay':
        return this.simulateSupplyDelay(parameters);
      case 'route_disruption':
        return this.simulateRouteDisruption(parameters);
      default:
        throw new Error('Unknown scenario type');
    }
  }

  private simulateDemandSpike(params: Record<string, any>): ScenarioResult {
    const { spikePercentage = 50, affectedCategories = [] } = params;

    return {
      impact: `${spikePercentage}% demand increase across ${affectedCategories.length || 'all'} categories`,
      affectedProducts: affectedCategories,
      recommendedActions: [
        `Increase safety stock by ${Math.round(spikePercentage / 2)}%`,
        'Expedite orders from backup suppliers',
        'Consider alternative fulfillment centers',
        'Communicate delivery expectations to customers'
      ],
      estimatedCostImpact: 15000 + (spikePercentage * 200),
      timelineAdjustment: Math.ceil(spikePercentage / 10)
    };
  }

  private simulateSupplyDelay(params: Record<string, any>): ScenarioResult {
    const { delayDays = 7, affectedSuppliers = [] } = params;

    return {
      impact: `${delayDays} day delay from ${affectedSuppliers.length} suppliers`,
      affectedProducts: affectedSuppliers,
      recommendedActions: [
        'Activate backup suppliers immediately',
        'Redistribute stock from other warehouses',
        'Adjust production schedule',
        'Prioritize high-margin products'
      ],
      estimatedCostImpact: delayDays * 2000,
      timelineAdjustment: delayDays
    };
  }

  private simulateRouteDisruption(params: Record<string, any>): ScenarioResult {
    const { affectedRoutes = [], duration = 3 } = params;

    return {
      impact: `Logistics disruption on ${affectedRoutes.length} routes for ${duration} days`,
      affectedProducts: affectedRoutes,
      recommendedActions: [
        'Switch to alternative carriers',
        'Use expedited shipping options',
        'Consolidate shipments where possible',
        'Update customer delivery estimates'
      ],
      estimatedCostImpact: affectedRoutes.length * duration * 500,
      timelineAdjustment: duration + 2
    };
  }

  generateReorderSuggestions(
    inventory: Inventory[],
    products: Product[],
    forecasts: DemandForecast[]
  ): Array<{
    product: Product;
    currentStock: number;
    forecastedDemand: number;
    suggestedOrderQty: number;
    urgency: 'high' | 'medium' | 'low';
    reasoning: string;
  }> {
    return products.map(product => {
      const inv = inventory.find(i => i.product_id === product.id) || {
        available_quantity: 0
      } as Inventory;

      const forecast = forecasts.find(f => f.product_id === product.id) || {
        predicted_demand: product.reorder_point,
        recommended_order_qty: product.reorder_point
      } as DemandForecast;

      const daysOfStock = inv.available_quantity / (forecast.predicted_demand / 30);
      const urgency = daysOfStock < 7 ? 'high' : daysOfStock < 14 ? 'medium' : 'low';

      return {
        product,
        currentStock: inv.available_quantity,
        forecastedDemand: forecast.predicted_demand,
        suggestedOrderQty: forecast.recommended_order_qty,
        urgency,
        reasoning: `${Math.round(daysOfStock)} days of stock remaining. ${
          urgency === 'high' ? 'Immediate action required.' : ''
        }`
      };
    }).filter(s => s.urgency !== 'low');
  }
}

export const aiEngine = new AIEngine();
