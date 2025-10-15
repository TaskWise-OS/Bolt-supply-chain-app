export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TESpuBfx9WnJ2E',
    priceId: 'price_1SHztnLZmi0FJLwyNoxg7489',
    name: 'SupplyVision Basic',
    description: 'Basic supply chain monitoring',
    price: 49.00,
    currency: 'aud',
    currencySymbol: 'A$',
    mode: 'subscription'
  },
  {
    id: 'prod_TESq77Ku3aQksS',
    priceId: 'price_1SHzv5LZmi0FJLwynncUasUe',
    name: 'SupplyVision Professional',
    description: 'Advanced analytics and forecasting',
    price: 149.00,
    currency: 'aud',
    currencySymbol: 'A$',
    mode: 'subscription'
  },
  {
    id: 'prod_TESr2FIrpPZa9z',
    priceId: 'price_1SHzw4LZmi0FJLwyTx2dm2zM',
    name: 'SupplyVision Enterprise',
    description: 'Full AI-powered supply chain optimisation',
    price: 399.00,
    currency: 'aud',
    currencySymbol: 'A$',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};