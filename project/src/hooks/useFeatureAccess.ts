import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

export interface PlanLimits {
  maxProducts: number;
  maxWarehouses: number;
  maxForecasts: number;
  hasAIForecasting: boolean;
  hasScenarioPlanning: boolean;
  hasPredictiveAlerts: boolean;
  hasAdvancedAnalytics: boolean;
  hasExportCapabilities: boolean;
  hasImportCapabilities: boolean;
  hasMultiCarrierOptimization: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'SupplyVision Basic': {
    maxProducts: 50,
    maxWarehouses: 2,
    maxForecasts: 10,
    hasAIForecasting: false,
    hasScenarioPlanning: false,
    hasPredictiveAlerts: false,
    hasAdvancedAnalytics: false,
    hasExportCapabilities: true,
    hasImportCapabilities: false,
    hasMultiCarrierOptimization: false,
  },
  'SupplyVision Professional': {
    maxProducts: 500,
    maxWarehouses: 10,
    maxForecasts: 100,
    hasAIForecasting: true,
    hasScenarioPlanning: true,
    hasPredictiveAlerts: true,
    hasAdvancedAnalytics: true,
    hasExportCapabilities: true,
    hasImportCapabilities: true,
    hasMultiCarrierOptimization: false,
  },
  'SupplyVision Enterprise': {
    maxProducts: -1, // unlimited
    maxWarehouses: -1, // unlimited
    maxForecasts: -1, // unlimited
    hasAIForecasting: true,
    hasScenarioPlanning: true,
    hasPredictiveAlerts: true,
    hasAdvancedAnalytics: true,
    hasExportCapabilities: true,
    hasImportCapabilities: true,
    hasMultiCarrierOptimization: true,
  },
  'Free Trial': {
    maxProducts: 50,
    maxWarehouses: 2,
    maxForecasts: 10,
    hasAIForecasting: true,
    hasScenarioPlanning: false,
    hasPredictiveAlerts: true,
    hasAdvancedAnalytics: false,
    hasExportCapabilities: true,
    hasImportCapabilities: false,
    hasMultiCarrierOptimization: false,
  }
};

export function useFeatureAccess() {
  const [planName, setPlanName] = useState<string>('Free Trial');
  const [limits, setLimits] = useState<PlanLimits>(PLAN_LIMITS['Free Trial']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setPlanName('Free Trial');
        setLimits(PLAN_LIMITS['Free Trial']);
        setLoading(false);
        return;
      }

      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('price_id, subscription_status')
        .maybeSingle();

      if (subscription && subscription.subscription_status === 'active') {
        const product = getProductByPriceId(subscription.price_id);
        const plan = product?.name || 'Free Trial';
        setPlanName(plan);
        setLimits(PLAN_LIMITS[plan] || PLAN_LIMITS['Free Trial']);
      } else {
        setPlanName('Free Trial');
        setLimits(PLAN_LIMITS['Free Trial']);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      setPlanName('Free Trial');
      setLimits(PLAN_LIMITS['Free Trial']);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    return limits[feature] as boolean;
  };

  const canAdd = (type: 'products' | 'warehouses' | 'forecasts', currentCount: number): boolean => {
    const limitKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof PlanLimits;
    const limit = limits[limitKey] as number;
    return limit === -1 || currentCount < limit;
  };

  const getLimit = (type: 'products' | 'warehouses' | 'forecasts'): number => {
    const limitKey = `max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof PlanLimits;
    return limits[limitKey] as number;
  };

  return {
    planName,
    limits,
    loading,
    hasFeature,
    canAdd,
    getLimit,
    refresh: fetchPlan
  };
}
