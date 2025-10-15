import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ImportType = 'products' | 'warehouses' | 'inventory' | 'suppliers';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function DataImportModule() {
  const [selectedType, setSelectedType] = useState<ImportType>('products');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importTypes = [
    {
      id: 'products' as ImportType,
      name: 'Products',
      icon: Database,
      color: 'blue',
      description: 'Import product catalog with SKUs, pricing, and reorder points',
      requiredColumns: ['sku', 'name', 'category', 'unit_cost', 'lead_time_days', 'reorder_point', 'safety_stock'],
      exampleData: [
        ['sku', 'name', 'category', 'unit_cost', 'lead_time_days', 'reorder_point', 'safety_stock'],
        ['PROD-001', 'Laptop Pro', 'Electronics', '899.99', '14', '50', '20'],
        ['PROD-002', 'Office Chair', 'Furniture', '299.99', '21', '30', '10']
      ]
    },
    {
      id: 'warehouses' as ImportType,
      name: 'Warehouses',
      icon: Database,
      color: 'green',
      description: 'Import warehouse locations and capacity information',
      requiredColumns: ['name', 'location', 'capacity', 'current_utilization', 'status'],
      exampleData: [
        ['name', 'location', 'capacity', 'current_utilization', 'status'],
        ['Main Warehouse', 'New York, NY', '50000', '65', 'active'],
        ['West Coast Hub', 'Los Angeles, CA', '75000', '80', 'active']
      ]
    },
    {
      id: 'inventory' as ImportType,
      name: 'Inventory',
      icon: Database,
      color: 'purple',
      description: 'Import current inventory levels across warehouses',
      requiredColumns: ['product_sku', 'warehouse_name', 'quantity', 'reserved_quantity', 'available_quantity'],
      exampleData: [
        ['product_sku', 'warehouse_name', 'quantity', 'reserved_quantity', 'available_quantity'],
        ['PROD-001', 'Main Warehouse', '500', '50', '450'],
        ['PROD-002', 'West Coast Hub', '300', '30', '270']
      ]
    },
    {
      id: 'suppliers' as ImportType,
      name: 'Suppliers',
      icon: Database,
      color: 'amber',
      description: 'Import supplier contact information and performance metrics',
      requiredColumns: ['name', 'contact_email', 'contact_phone', 'lead_time_days', 'reliability_score', 'status'],
      exampleData: [
        ['name', 'contact_email', 'contact_phone', 'lead_time_days', 'reliability_score', 'status'],
        ['TechSupply Co', 'orders@techsupply.com', '+1-555-0100', '14', '92', 'active'],
        ['Global Parts Inc', 'sales@globalparts.com', '+1-555-0200', '21', '88', 'active']
      ]
    }
  ];

  const currentType = importTypes.find(t => t.id === selectedType)!;

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      const missingColumns = currentType.requiredColumns.filter(
        col => !headers.includes(col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (row.every(cell => !cell.trim())) continue;

        try {
          await importRow(headers, row);
          successCount++;
        } catch (error: any) {
          failCount++;
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setResult({ success: successCount, failed: failCount, errors });
    } catch (error: any) {
      setResult({ success: 0, failed: 0, errors: [error.message] });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const importRow = async (headers: string[], values: string[]) => {
    const data: any = {};
    headers.forEach((header, index) => {
      data[header] = values[index]?.trim() || '';
    });

    switch (selectedType) {
      case 'products':
        await supabase.from('products').insert({
          sku: data.sku,
          name: data.name,
          category: data.category,
          unit_cost: parseFloat(data.unit_cost) || 0,
          lead_time_days: parseInt(data.lead_time_days) || 7,
          reorder_point: parseInt(data.reorder_point) || 100,
          safety_stock: parseInt(data.safety_stock) || 50
        });
        break;

      case 'warehouses':
        await supabase.from('warehouses').insert({
          name: data.name,
          location: data.location,
          capacity: parseInt(data.capacity) || 0,
          current_utilization: parseInt(data.current_utilization) || 0,
          status: data.status || 'active'
        });
        break;

      case 'inventory':
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('sku', data.product_sku)
          .maybeSingle();

        const { data: warehouse } = await supabase
          .from('warehouses')
          .select('id')
          .eq('name', data.warehouse_name)
          .maybeSingle();

        if (!product || !warehouse) {
          throw new Error(`Product SKU "${data.product_sku}" or Warehouse "${data.warehouse_name}" not found`);
        }

        await supabase.from('inventory').upsert({
          product_id: product.id,
          warehouse_id: warehouse.id,
          quantity: parseInt(data.quantity) || 0,
          reserved_quantity: parseInt(data.reserved_quantity) || 0,
          available_quantity: parseInt(data.available_quantity) || 0
        });
        break;

      case 'suppliers':
        await supabase.from('suppliers').insert({
          name: data.name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          lead_time_days: parseInt(data.lead_time_days) || 7,
          reliability_score: parseFloat(data.reliability_score) || 80,
          status: data.status || 'active'
        });
        break;
    }
  };

  const downloadTemplate = () => {
    const csv = currentType.exampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}_template.csv`;
    a.click();
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'green': return 'bg-green-50 border-green-200 text-green-700';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'amber': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Import</h1>
        <p className="text-slate-600">Bulk upload your supply chain data via CSV files</p>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Upload className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">Getting Started with Data Import</h3>
            <p className="text-sm text-slate-700 mb-3">
              Import your existing supply chain data quickly and easily. Download our CSV templates, fill them with your data, and upload to populate your system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Download template
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Fill with your data
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Upload to system
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {importTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                setResult(null);
              }}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? getColorClasses(type.color)
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isSelected ? '' : 'text-slate-400'}`} />
              <h3 className="font-semibold text-lg mb-1">{type.name}</h3>
              <p className="text-xs opacity-75 line-clamp-2">{type.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Upload {currentType.name}</h2>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Required Columns
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentType.requiredColumns.map(col => (
                <span key={col} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-mono text-slate-700">
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className={`cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-slate-900 mb-1">
                {isProcessing ? 'Processing...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-slate-500">
                or drag and drop your file here
              </p>
            </label>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-700 font-medium">Processing your data...</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">{result.success}</p>
                      <p className="text-sm text-green-700">Successfully imported</p>
                    </div>
                  </div>
                </div>

                {result.failed > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-red-900">{result.failed}</p>
                        <p className="text-sm text-red-700">Failed to import</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Import Errors
                  </h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700 font-mono">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.success > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Success!</strong> Your data has been imported. Navigate to the relevant module to view your uploaded data.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">CSV Format Guidelines</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>First row must contain column headers matching required fields</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Use commas to separate values, quotes for text containing commas</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>For inventory imports, ensure products and warehouses exist first</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Numeric fields should contain valid numbers without currency symbols</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Empty rows will be automatically skipped</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
