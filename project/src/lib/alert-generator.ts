import { supabase } from './supabase';
import { aiEngine } from './ai-engine';

export async function generatePredictiveAlerts() {
  try {
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        id,
        product_id,
        available_quantity,
        products!inner(
          id,
          name,
          sku,
          reorder_point
        )
      `);

    if (!inventory) return;

    const alerts = [];

    for (const item of inventory) {
      const analysis = aiEngine.analyzeStockLevel(
        item as any,
        {
          ...item.products,
          safety_stock: Math.floor(item.products.reorder_point * 0.3)
        } as any
      );

      if (analysis.status === 'critical' || analysis.status === 'warning') {
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('type', analysis.status === 'critical' ? 'critical_stock' : 'low_stock')
          .eq('is_resolved', false)
          .contains('metadata', { product_id: item.product_id })
          .maybeSingle();

        if (!existingAlert) {
          alerts.push({
            type: analysis.status === 'critical' ? 'critical_stock' : 'low_stock',
            severity: analysis.status,
            title: `${analysis.status === 'critical' ? 'Critical' : 'Low'} Stock Alert: ${item.products.name}`,
            message: analysis.message,
            action_recommended: analysis.recommendation,
            metadata: { product_id: item.product_id, sku: item.products.sku },
            is_resolved: false
          });
        }
      }
    }

    if (alerts.length > 0) {
      await supabase.from('alerts').insert(alerts);
    }

    return alerts.length;
  } catch (error) {
    console.error('Error generating predictive alerts:', error);
    return 0;
  }
}
