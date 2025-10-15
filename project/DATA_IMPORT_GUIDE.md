# SupplyVision Data Import Guide

## Overview
The Data Import module allows companies to quickly populate SupplyVision with their existing supply chain data via CSV file uploads.

## Supported Import Types

### 1. Products
Import your product catalog with pricing and inventory parameters.

**Required Columns:**
- `sku` - Unique product identifier
- `name` - Product name
- `category` - Product category
- `unit_cost` - Cost per unit (numeric, no currency symbols)
- `lead_time_days` - Supplier lead time in days
- `reorder_point` - When to trigger reorder
- `safety_stock` - Minimum stock level

**Example CSV:**
```csv
sku,name,category,unit_cost,lead_time_days,reorder_point,safety_stock
PROD-001,Laptop Pro,Electronics,899.99,14,50,20
PROD-002,Office Chair,Furniture,299.99,21,30,10
```

### 2. Warehouses
Import warehouse locations and capacity information.

**Required Columns:**
- `name` - Warehouse name
- `location` - Physical address
- `capacity` - Total storage capacity
- `current_utilization` - Current usage percentage (0-100)
- `status` - active/inactive/maintenance

**Example CSV:**
```csv
name,location,capacity,current_utilization,status
Main Warehouse,New York NY,50000,65,active
West Coast Hub,Los Angeles CA,75000,80,active
```

### 3. Inventory
Import current stock levels across warehouses.

**Required Columns:**
- `product_sku` - Product SKU (must exist in Products)
- `warehouse_name` - Warehouse name (must exist in Warehouses)
- `quantity` - Total quantity
- `reserved_quantity` - Reserved for orders
- `available_quantity` - Available for sale

**Example CSV:**
```csv
product_sku,warehouse_name,quantity,reserved_quantity,available_quantity
PROD-001,Main Warehouse,500,50,450
PROD-002,West Coast Hub,300,30,270
```

**Important:** Import Products and Warehouses before importing Inventory.

### 4. Suppliers
Import supplier contact information and performance metrics.

**Required Columns:**
- `name` - Supplier name
- `contact_email` - Email address
- `contact_phone` - Phone number
- `lead_time_days` - Standard lead time
- `reliability_score` - Performance rating (0-100)
- `status` - active/inactive

**Example CSV:**
```csv
name,contact_email,contact_phone,lead_time_days,reliability_score,status
TechSupply Co,orders@techsupply.com,+1-555-0100,14,92,active
Global Parts Inc,sales@globalparts.com,+1-555-0200,21,88,active
```

## Import Process

1. **Navigate to Data Import**
   - Click "Data Import" in the sidebar navigation

2. **Select Import Type**
   - Choose what type of data you're importing (Products, Warehouses, Inventory, or Suppliers)

3. **Download Template**
   - Click "Download CSV Template" to get a correctly formatted template
   - The template includes all required column headers

4. **Prepare Your Data**
   - Fill the template with your data
   - Ensure all required columns are present
   - Use proper formatting (numbers without symbols, valid dates, etc.)

5. **Upload CSV**
   - Click the upload area or drag and drop your CSV file
   - The system will process your data automatically

6. **Review Results**
   - View successful imports and any errors
   - Fix any failed rows and re-upload if needed

## CSV Formatting Guidelines

✓ **First row must be headers** matching required field names
✓ **Use commas** to separate values
✓ **Use quotes** for text containing commas
✓ **No currency symbols** in numeric fields
✓ **Empty rows** are automatically skipped
✓ **Order matters** - Import dependencies first (e.g., Products before Inventory)

## Common Issues

**Issue:** "Missing required columns"
- **Solution:** Ensure CSV header row exactly matches required column names (case-insensitive)

**Issue:** "Product SKU not found" (during Inventory import)
- **Solution:** Import Products first, then import Inventory

**Issue:** "Warehouse not found" (during Inventory import)
- **Solution:** Import Warehouses first, then import Inventory

**Issue:** Import shows 0 successful
- **Solution:** Check that data rows exist below the header row and aren't all empty

## Best Practices

1. **Start with foundations:** Import Products and Warehouses before Inventory
2. **Use templates:** Always download and use the provided CSV templates
3. **Test small batches:** Import a few rows first to verify formatting
4. **Clean data:** Remove duplicate SKUs and ensure data consistency
5. **Backup:** Keep original CSV files for reference

## After Import

Once data is imported:
- Navigate to the Inventory module to view stock levels
- Check the Dashboard for immediate insights
- Run AI Forecasts to generate demand predictions
- Review Alerts for any critical items

## Support

For issues or questions about data import:
- Review error messages for specific guidance
- Ensure data format matches examples exactly
- Verify all prerequisite data has been imported
