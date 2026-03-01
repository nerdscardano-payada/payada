import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Play } from "lucide-react";

export default function FeeModelValidation() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runValidation = async () => {
    setTesting(true);
    setError(null);
    setResults(null);

    try {
      const response = await base44.functions.invoke('validateFeeModel', {
        testType: 'full'
      });
      setResults(response.data.result);
    } catch (err) {
      setError(err.message || 'Validation failed');
    } finally {
      setTesting(false);
    }
  };

  const testCalculation = async (amount) => {
    setTesting(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('validateFeeModel', {
        testType: 'feeCalculation',
        amount
      });
      setResults(response.data.result);
    } catch (err) {
      setError(err.message || 'Calculation test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Fee Model Validation</h2>
        <p className="text-slate-600 text-sm mb-6">
          Test fee calculations and verify the 1.75% flat fee model is working correctly across all components.
        </p>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={runValidation}
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Full Validation
          </Button>

          <Button
            onClick={() => testCalculation(100)}
            disabled={testing}
            variant="outline"
          >
            Test ₳100 Fee
          </Button>

          <Button
            onClick={() => testCalculation(1000)}
            disabled={testing}
            variant="outline"
          >
            Test ₳1000 Fee
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Validation Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-700">
                <p className="font-semibold">Validation Complete</p>
                <p className="mt-1">Expected Fee: 1.75%</p>
              </div>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded text-xs overflow-x-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}