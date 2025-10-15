import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { useNavigate } from 'react-router-dom';

interface DataImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DataImporter({ isOpen, onClose, onSuccess }: DataImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const { hasFeature, canAdd, getLimit, planName } = useFeatureAccess();
  const [productCount, setProductCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      checkProductCount();
    }
  }, [isOpen]);

  const checkProductCount = async () => {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    setProductCount(count || 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);

        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        const { data: warehouses } = await supabase
          .from('warehouses')
          .select('id, name')
          .limit(1);

        const warehouseId = warehouses?.[0]?.id;

        if (!warehouseId) {
          throw new Error('No warehouse found. Please create a warehouse first.');
        }

        for (const row of data) {
          try {
            const { data: product, error: productError } = await supabase
              .from('products')
              .insert({
                sku: row.sku || row.SKU,
                name: row.name || row.Name || row.product_name,
                category: row.category || row.Category || 'General',
                description: row.description || row.Description || '',
                unit_cost: parseFloat(row.unit_cost || row.price || row.cost || '0'),
                reorder_point: parseInt(row.reorder_point || row.reorder || '50'),
              })
              .select()
              .single();

            if (productError) {
              throw productError;
            }

            const quantity = parseInt(row.quantity || row.stock || '0');

            await supabase.from('inventory').insert({
              product_id: product.id,
              warehouse_id: warehouseId,
              quantity: quantity,
              available_quantity: quantity,
              reserved_quantity: 0,
            });

            successCount++;
          } catch (error: any) {
            failedCount++;
            errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
          }
        }

        setResult({ success: successCount, failed: failedCount, errors: errors.slice(0, 5) });
        if (successCount > 0) {
          onSuccess();
        }
      } catch (error: any) {
        alert('Error importing data: ' + error.message);
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  if (!isOpen) return null;

  if (!hasFeature('hasImportCapabilities')) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade Required</h3>
            <p className="text-gray-600 mb-6">
              Import functionality is available on the <strong>Professional</strong> plan and higher.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your current plan: <strong>{planName}</strong>
            </p>
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Plans & Upgrade
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!result ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Upload a CSV file with your product data. The file should include columns for:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li><strong>sku or SKU</strong> - Product SKU (required)</li>
                <li><strong>name or Name or product_name</strong> - Product name (required)</li>
                <li><strong>category or Category</strong> - Product category (optional, defaults to "General")</li>
                <li><strong>description or Description</strong> - Product description (optional)</li>
                <li><strong>unit_cost or price or cost</strong> - Unit cost (optional, defaults to 0)</li>
                <li><strong>reorder_point or reorder</strong> - Reorder point (optional, defaults to 50)</li>
                <li><strong>quantity or stock</strong> - Initial quantity (optional, defaults to 0)</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Example CSV format:</strong><br />
                  sku,name,category,unit_cost,reorder_point,quantity<br />
                  SKU-001,Widget A,Electronics,25.99,50,100<br />
                  SKU-002,Widget B,Tools,15.50,30,75
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">CSV files only</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  'Import Data'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Successfully imported {result.success} products</p>
              </div>
            </div>

            {result.failed > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="font-semibold text-red-900">Failed to import {result.failed} products</p>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-sm text-red-800">
                    <p className="font-medium mb-1">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Import More
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
