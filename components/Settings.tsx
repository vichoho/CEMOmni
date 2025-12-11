import React from 'react';
import { Sliders, Bell, Eye, Shield, Save, Calculator } from 'lucide-react';
import { WeightConfig } from '../types';

interface SettingsProps {
  weights: WeightConfig;
  setWeights: React.Dispatch<React.SetStateAction<WeightConfig>>;
}

export const Settings: React.FC<SettingsProps> = ({ weights, setWeights }) => {
  const handleWeightChange = (key: keyof WeightConfig, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fix: Explicitly type reduce arguments to avoid unknown type inference
  const totalWeight = Object.values(weights).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">System Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scoring Model Configuration */}
        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-2 mb-6 text-telco-600 dark:text-telco-400">
            <Calculator className="w-5 h-5" />
            <h2 className="font-semibold text-lg">User Experience Scoring Model</h2>
          </div>
          
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Weighting</span>
               <span className={`text-sm font-bold ${totalWeight === 100 ? 'text-green-500' : 'text-amber-500'}`}>{totalWeight}%</span>
             </div>
             <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div style={{ width: `${(weights.throughput/totalWeight)*100}%` }} className="h-full bg-blue-500"></div>
                <div style={{ width: `${(weights.latency/totalWeight)*100}%` }} className="h-full bg-indigo-500"></div>
                <div style={{ width: `${(weights.reliability/totalWeight)*100}%` }} className="h-full bg-red-500"></div>
                <div style={{ width: `${(weights.congestion/totalWeight)*100}%` }} className="h-full bg-amber-500"></div>
                <div style={{ width: `${(weights.signal/totalWeight)*100}%` }} className="h-full bg-green-500"></div>
             </div>
          </div>

          <div className="space-y-5">
             <div>
               <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Throughput Weight</label>
                  <span className="text-xs text-blue-500 font-bold">{weights.throughput}%</span>
               </div>
               <input 
                  type="range" min="0" max="100" 
                  value={weights.throughput} 
                  onChange={(e) => handleWeightChange('throughput', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500" 
               />
             </div>
             <div>
               <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Latency Weight</label>
                  <span className="text-xs text-indigo-500 font-bold">{weights.latency}%</span>
               </div>
               <input 
                  type="range" min="0" max="100" 
                  value={weights.latency} 
                  onChange={(e) => handleWeightChange('latency', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500" 
               />
             </div>
             <div>
               <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reliability (Drop Rate)</label>
                  <span className="text-xs text-red-500 font-bold">{weights.reliability}%</span>
               </div>
               <input 
                  type="range" min="0" max="100" 
                  value={weights.reliability} 
                  onChange={(e) => handleWeightChange('reliability', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-500" 
               />
             </div>
             <div>
               <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Congestion (PRB)</label>
                  <span className="text-xs text-amber-500 font-bold">{weights.congestion}%</span>
               </div>
               <input 
                  type="range" min="0" max="100" 
                  value={weights.congestion} 
                  onChange={(e) => handleWeightChange('congestion', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-amber-500" 
               />
             </div>
             <div>
               <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Signal (RSRP/SINR)</label>
                  <span className="text-xs text-green-500 font-bold">{weights.signal}%</span>
               </div>
               <input 
                  type="range" min="0" max="100" 
                  value={weights.signal} 
                  onChange={(e) => handleWeightChange('signal', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500" 
               />
             </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
           <div className="flex items-center gap-2 mb-6 text-amber-500">
            <Bell className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Alert Notifications</h2>
          </div>

          <div className="space-y-4">
             {[
               'Notify on Critical Drop Rate', 
               'Notify on Congestion > 90%', 
               'Email Weekly Reports', 
               'SMS on Site Outage'
              ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-telco-500"></div>
                  </label>
               </div>
             ))}
          </div>
        </div>

        {/* User Preferences */}
        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <div className="flex items-center gap-2 mb-6 text-emerald-500">
            <Eye className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Display Options</h2>
          </div>
           <div className="space-y-3">
             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
               <input type="checkbox" className="rounded text-telco-500 focus:ring-telco-500" defaultChecked />
               <span className="text-sm">Show Tooltips on Charts</span>
             </div>
             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
               <input type="checkbox" className="rounded text-telco-500 focus:ring-telco-500" defaultChecked />
               <span className="text-sm">Real-time Data Streaming Animation</span>
             </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
               <input type="checkbox" className="rounded text-telco-500 focus:ring-telco-500" />
               <span className="text-sm">Compact Table Mode</span>
             </div>
           </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
           <div className="flex items-center gap-2 mb-6 text-slate-500">
            <Shield className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Access Control</h2>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Manage who can view RCA data and User Activity logs.
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
            Manage Roles & Permissions
          </button>
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <button className="flex items-center gap-2 bg-telco-600 text-white px-6 py-3 rounded-xl hover:bg-telco-700 shadow-lg shadow-telco-600/20 transition-all">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
};