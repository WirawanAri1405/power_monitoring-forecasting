import React, { useState } from 'react';
import { TrendingUp, Zap, DollarSign, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import ComparisonChart from '../components/charts/ComparisonChart';

interface PredictionResult {
  predicted_power: number;
  rmse: number;
  algo_used: string;
  meter_type: string;
  tariff_per_kwh: number;
  estimated_hourly_cost: number;
  message: string;
  data_stats?: {
    total_records: number;
    clean_records: number;
    train_records: number;
    test_records: number;
  };
}

interface ResultCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'green';
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100 dark:bg-blue-800',
    purple: 'bg-purple-100 dark:bg-purple-800',
    green: 'bg-green-100 dark:bg-green-800',
  };

  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg dark:hover:shadow-black/50',
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-lg', iconBgClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium opacity-80 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-75">{subtitle}</p>
    </div>
  );
};

const PredictionPage: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('rf');
  const [selectedMeter, setSelectedMeter] = useState('900VA');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const algorithms = [
    { value: 'rf', label: 'Random Forest', description: 'Ensemble learning, high accuracy' },
    { value: 'gbt', label: 'Gradient Boosted Trees (GBT)', description: 'Sequential boosting, robust' },
    { value: 'lr', label: 'Linear Regression', description: 'Simple baseline, fast' },
  ];

  const meterTypes = [
    { value: '450VA', label: '450 VA (Subsidi)', tariff: 'Rp 415/kWh' },
    { value: '900VA', label: '900 VA', tariff: 'Rp 1,352/kWh' },
    { value: '1300VA', label: '1300 VA', tariff: 'Rp 1,444/kWh' },
    { value: '2200VA', label: '2200 VA+', tariff: 'Rp 1,444/kWh' },
  ];

  const handleRunPrediction = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `http://localhost:8000/prediction/run/?algo=${selectedAlgo}&meter_type=${selectedMeter}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prediction');
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock comparison data for visualization
  const generateComparisonData = (predictedPower: number) => {
    const data = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const actual = predictedPower + (Math.random() - 0.5) * predictedPower * 0.2;
      const predicted = predictedPower + (Math.random() - 0.5) * predictedPower * 0.15;

      data.push({
        timestamp: timestamp.toISOString(),
        actual: Math.max(0, actual),
        predicted: Math.max(0, predicted)
      });
    }

    return data;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Power Prediction & Cost Estimation</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Prediksi konsumsi daya dan estimasi biaya listrik menggunakan Machine Learning
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Algorithm
            </label>
            <div className="space-y-2">
              {algorithms.map((algo) => (
                <label
                  key={algo.value}
                  className={cn(
                    'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
                    selectedAlgo === algo.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <input
                    type="radio"
                    name="algorithm"
                    value={algo.value}
                    checked={selectedAlgo === algo.value}
                    onChange={(e) => setSelectedAlgo(e.target.value)}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{algo.label}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{algo.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Meter Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              PLN Meter Type
            </label>
            <div className="space-y-2">
              {meterTypes.map((meter) => (
                <label
                  key={meter.value}
                  className={cn(
                    'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all',
                    selectedMeter === meter.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <input
                    type="radio"
                    name="meter"
                    value={meter.value}
                    checked={selectedMeter === meter.value}
                    onChange={(e) => setSelectedMeter(e.target.value)}
                    className="mt-1 mr-3 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{meter.label}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{meter.tariff}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div className="mt-6">
          <button
            onClick={handleRunPrediction}
            disabled={isLoading}
            className={cn(
              'w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg',
              'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center space-x-2'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>Run Prediction & Cost Estimate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 dark:text-red-300">Error</h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 dark:text-green-300">Prediction Completed</h4>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">{result.message}</p>
            </div>
          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResultCard
              title="Predicted Power"
              value={`${result.predicted_power} W`}
              subtitle="Average power consumption"
              icon={Zap}
              color="blue"
            />
            <ResultCard
              title="Model Accuracy (RMSE)"
              value={result.rmse.toFixed(2)}
              subtitle={`Using ${result.algo_used}`}
              icon={TrendingUp}
              color="purple"
            />
            <ResultCard
              title="Estimated Hourly Cost"
              value={`Rp ${result.estimated_hourly_cost.toLocaleString('id-ID')}`}
              subtitle={`Tariff: Rp ${result.tariff_per_kwh}/kWh`}
              icon={DollarSign}
              color="green"
            />
          </div>

          {/* Comparison Chart */}
          <ComparisonChart
            data={generateComparisonData(result.predicted_power)}
            unit="W"
            title="Actual vs Predicted Power Consumption"
          />

          {/* Additional Details */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Prediction Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Algorithm Used</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{result.algo_used}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Meter Type</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{result.meter_type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Energy (kWh/hour)</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {(result.predicted_power / 1000).toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Daily Cost Estimate</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Rp {(result.estimated_hourly_cost * 24).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {result.data_stats && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Data Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Total Records</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {result.data_stats.total_records}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Clean Records</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {result.data_stats.clean_records}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Training Set</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {result.data_stats.train_records}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Test Set</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {result.data_stats.test_records}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">💰 Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Per Hour</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Rp {result.estimated_hourly_cost.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Per Day (24 hours)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Rp {(result.estimated_hourly_cost * 24).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-green-300 dark:border-green-700">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Per Month (30 days)</span>
                <span className="text-xl font-bold text-green-700 dark:text-green-400">
                  Rp {(result.estimated_hourly_cost * 24 * 30).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;