/*
  # SupplyVision Database Schema

  ## Overview
  Complete supply chain management system with inventory tracking, demand forecasting,
  logistics planning, and collaboration features.

  ## New Tables

  ### 1. warehouses
  - `id` (uuid, primary key)
  - `name` (text) - Warehouse name
  - `location` (text) - Physical address
  - `capacity` (integer) - Total storage capacity
  - `current_utilization` (integer) - Current usage percentage
  - `status` (text) - active/inactive/maintenance
  - `created_at` (timestamptz)

  ### 2. products
  - `id` (uuid, primary key)
  - `sku` (text, unique) - Stock keeping unit
  - `name` (text) - Product name
  - `category` (text) - Product category
  - `unit_cost` (numeric) - Cost per unit
  - `lead_time_days` (integer) - Supplier lead time
  - `reorder_point` (integer) - When to reorder
  - `safety_stock` (integer) - Minimum stock level
  - `created_at` (timestamptz)

  ### 3. inventory
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `warehouse_id` (uuid, foreign key)
  - `quantity` (integer) - Current stock quantity
  - `reserved_quantity` (integer) - Reserved for orders
  - `available_quantity` (integer) - Available for sale
  - `expiry_date` (timestamptz) - Product expiration
  - `last_updated` (timestamptz)

  ### 4. demand_forecasts
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `forecast_date` (date) - Date of forecast
  - `predicted_demand` (integer) - AI predicted quantity
  - `confidence_score` (numeric) - Prediction confidence (0-100)
  - `recommended_order_qty` (integer) - Suggested order
  - `seasonality_factor` (numeric) - Seasonal adjustment
  - `created_at` (timestamptz)

  ### 5. shipments
  - `id` (uuid, primary key)
  - `shipment_number` (text, unique)
  - `origin_warehouse_id` (uuid, foreign key)
  - `destination` (text) - Delivery address
  - `carrier` (text) - Logistics provider
  - `status` (text) - scheduled/in_transit/delivered/delayed
  - `scheduled_date` (timestamptz)
  - `actual_delivery_date` (timestamptz)
  - `tracking_number` (text)
  - `cost` (numeric)
  - `created_at` (timestamptz)

  ### 6. shipment_items
  - `id` (uuid, primary key)
  - `shipment_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer)

  ### 7. suppliers
  - `id` (uuid, primary key)
  - `name` (text)
  - `contact_email` (text)
  - `contact_phone` (text)
  - `lead_time_days` (integer)
  - `reliability_score` (numeric) - Performance rating
  - `status` (text) - active/inactive
  - `created_at` (timestamptz)

  ### 8. purchase_orders
  - `id` (uuid, primary key)
  - `po_number` (text, unique)
  - `supplier_id` (uuid, foreign key)
  - `warehouse_id` (uuid, foreign key)
  - `status` (text) - draft/pending/approved/received
  - `order_date` (timestamptz)
  - `expected_delivery` (timestamptz)
  - `total_cost` (numeric)
  - `created_at` (timestamptz)

  ### 9. po_items
  - `id` (uuid, primary key)
  - `po_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer)
  - `unit_cost` (numeric)

  ### 10. alerts
  - `id` (uuid, primary key)
  - `type` (text) - low_stock/overstock/expiry/delay/forecast
  - `severity` (text) - critical/warning/info
  - `title` (text)
  - `message` (text)
  - `product_id` (uuid, foreign key, nullable)
  - `warehouse_id` (uuid, foreign key, nullable)
  - `is_resolved` (boolean)
  - `action_recommended` (text)
  - `created_at` (timestamptz)

  ### 11. scenarios
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `scenario_type` (text) - demand_spike/supply_delay/route_disruption
  - `parameters` (jsonb) - Scenario configuration
  - `results` (jsonb) - Simulation results
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public access policies for demo (restrictive policies should be added for production)
*/

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  capacity integer DEFAULT 0,
  current_utilization integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  unit_cost numeric DEFAULT 0,
  lead_time_days integer DEFAULT 7,
  reorder_point integer DEFAULT 100,
  safety_stock integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  available_quantity integer DEFAULT 0,
  expiry_date timestamptz,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

-- Demand Forecasts
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  forecast_date date NOT NULL,
  predicted_demand integer DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  recommended_order_qty integer DEFAULT 0,
  seasonality_factor numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  lead_time_days integer DEFAULT 7,
  reliability_score numeric DEFAULT 80,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',
  order_date timestamptz DEFAULT now(),
  expected_delivery timestamptz,
  total_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- PO Items
CREATE TABLE IF NOT EXISTS po_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  unit_cost numeric DEFAULT 0
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number text UNIQUE NOT NULL,
  origin_warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  destination text NOT NULL,
  carrier text,
  status text DEFAULT 'scheduled',
  scheduled_date timestamptz,
  actual_delivery_date timestamptz,
  tracking_number text,
  cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Shipment Items
CREATE TABLE IF NOT EXISTS shipment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  severity text DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  is_resolved boolean DEFAULT false,
  action_recommended text,
  created_at timestamptz DEFAULT now()
);

-- Scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  scenario_type text NOT NULL,
  parameters jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Public read access for demo (replace with proper auth in production)
CREATE POLICY "Public read warehouses" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Public write warehouses" ON warehouses FOR ALL USING (true);

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public write products" ON products FOR ALL USING (true);

CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public write inventory" ON inventory FOR ALL USING (true);

CREATE POLICY "Public read forecasts" ON demand_forecasts FOR SELECT USING (true);
CREATE POLICY "Public write forecasts" ON demand_forecasts FOR ALL USING (true);

CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public write suppliers" ON suppliers FOR ALL USING (true);

CREATE POLICY "Public read purchase_orders" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Public write purchase_orders" ON purchase_orders FOR ALL USING (true);

CREATE POLICY "Public read po_items" ON po_items FOR SELECT USING (true);
CREATE POLICY "Public write po_items" ON po_items FOR ALL USING (true);

CREATE POLICY "Public read shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "Public write shipments" ON shipments FOR ALL USING (true);

CREATE POLICY "Public read shipment_items" ON shipment_items FOR SELECT USING (true);
CREATE POLICY "Public write shipment_items" ON shipment_items FOR ALL USING (true);

CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public write alerts" ON alerts FOR ALL USING (true);

CREATE POLICY "Public read scenarios" ON scenarios FOR SELECT USING (true);
CREATE POLICY "Public write scenarios" ON scenarios FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_product ON demand_forecasts(product_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_date ON demand_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);