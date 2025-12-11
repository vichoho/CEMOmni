import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Activity, ArrowUp, ArrowDown, Wifi, AlertTriangle, Zap, BrainCircuit, Gauge, Database, Search, Calendar, Filter } from 'lucide-react';
import { calculateQoEScore } from '../constants';
import { generateNetworkInsight } from '../services/geminiService';
import { WeightConfig } from '../types';
import { useNetworkData } from '../hooks/useNetworkData';

interface DashboardProps {
  weights: WeightConfig;
}

const KpiCard = ({ title, value, unit, trend, trendValue, icon: Icon, colorClass }: any) => (
  <div className="bg-white dark:bg-carddark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
          {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        {trendValue}
      </span>
      <span className="text-slate-400">vs yesterday</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ weights }) => {
  const [searchImsi, setSearchImsi] = useState('');
  const [imsiInput, setImsiInput] = useState('');
  const [startDate, setStartDate] = useState('');
  
  const { dailyData, loading, error } = useNetworkData(searchImsi, startDate);
  const [insight, setInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  const handleSearch = () => {
    setSearchImsi(imsiInput);
  };

  const handleAiAnalysis = async () => {
    if (dailyData.length === 0) return;
    setLoadingAi(true);
    const result = await generateNetworkInsight(dailyData);
    setInsight(result);
    setLoadingAi(false);
  };

  const latest = dailyData.length > 0 ? dailyData[dailyData.length - 1] : null;
  const previous = dailyData.length > 1 ? dailyData[dailyData.length - 2] : null;

  const calcTrend = (curr: number, prev: number) => {
    const diff = ((curr - prev) / prev) * 100;
    return {
      dir: diff >= 0 ? 'up' : 'down',
      val: `${Math.abs(diff).toFixed(1)}%`
    };
  };

  // Calculate QoE Scores
  const latestQoE = useMemo(() => latest ? calculateQoEScore(latest, weights) : 0, [latest, weights]);
  const qoeTrendData = useMemo(() => dailyData.map(d => ({
    date: d.date,
    score: calculateQoEScore(d, weights)
  })), [dailyData, weights]);

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Emerald
    if (score >= 75) return '#3b82f6'; // Blue
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-telco-200 border-t-telco-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Data...</p>
        </div>
      </div>
    );
  }

  if (!latest || !previous) return <div className="p-6">No Data Available</div>;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {searchImsi ? `Subscriber Overview: ${searchImsi}` : 'Network Overview'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            Real-time monitoring for past 7 days
            {error && <span className="text-amber-500 text-xs flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full"><Database className="w-3 h-3"/> Using Cached Data</span>}
          </p>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Filter Bar */}
          <div className="flex items-center bg-white dark:bg-carddark p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
             <div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-600 gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter IMSI..." 
                  value={imsiInput}
                  onChange={(e) => setImsiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent text-sm w-32 focus:outline-none text-slate-700 dark:text-slate-200"
                />
             </div>
             <div className="flex items-center px-3 gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-slate-700 dark:text-slate-200 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
             </div>
             <button 
               onClick={handleSearch}
               className="bg-telco-100 dark:bg-telco-900 text-telco-700 dark:text-telco-300 p-2 rounded-md hover:bg-telco-200 dark:hover:bg-telco-800 transition-colors ml-1"
             >
               <Filter className="w-4 h-4" />
             </button>
          </div>

          <div className="flex items-center gap-3">
               <button 
              onClick={handleAiAnalysis}
              disabled={loadingAi}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 h-full"
            >
              {loadingAi ? (
                <span className="animate-spin text-xl">⟳</span>
              ) : (
                <BrainCircuit className="w-5 h-5" />
              )}
              {loadingAi ? 'Analyzing...' : 'AI Insight'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      {insight && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800 p-4 rounded-xl flex items-start gap-4 animate-fade-in">
          <BrainCircuit className="w-6 h-6 text-violet-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-violet-900 dark:text-violet-100">Gemini AI Analysis</h4>
            <p className="text-violet-800 dark:text-violet-200 text-sm mt-1 leading-relaxed">{insight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* User Experience Score Card */}
        <div className="lg:col-span-1 bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-telco-500 to-purple-500"></div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" /> {searchImsi ? 'Subscriber QoE' : 'Network QoE'}
          </h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: latestQoE }, { value: 100 - latestQoE }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={getScoreColor(latestQoE)} />
                  <Cell fill="#e2e8f0" className="dark:fill-slate-700" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-0 text-center">
              <span className="text-4xl font-bold text-slate-800 dark:text-white">{latestQoE}</span>
              <span className="block text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Trend (7d)</span>
              <span className={latestQoE >= qoeTrendData[0].score ? 'text-green-500' : 'text-red-500'}>
                {latestQoE >= qoeTrendData[0].score ? '+' : ''}{(latestQoE - qoeTrendData[0].score).toFixed(1)}
              </span>
            </div>
             <div className="h-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qoeTrendData}>
                    <Line type="monotone" dataKey="score" stroke={getScoreColor(latestQoE)} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Avg Throughput (DL)" 
            value={latest.throughputDL} 
            unit="Mbps" 
            trend={calcTrend(latest.throughputDL, previous.throughputDL).dir} 
            trendValue={calcTrend(latest.throughputDL, previous.throughputDL).val}
            icon={Zap}
            colorClass="bg-blue-500 text-blue-500"
          />
          <KpiCard 
            title="Congestion (PRB)" 
            value={latest.prbUtilization} 
            unit="%" 
            trend={latest.prbUtilization > previous.prbUtilization ? 'up' : 'down'} 
            trendValue={calcTrend(latest.prbUtilization, previous.prbUtilization).val}
            icon={Activity}
            colorClass="bg-red-500 text-red-500"
          />
          <KpiCard 
            title="Signal Quality (SINR)" 
            value={latest.sinr} 
            unit="dB" 
            trend={calcTrend(latest.sinr, previous.sinr).dir} 
            trendValue={calcTrend(latest.sinr, previous.sinr).val}
            icon={Wifi}
            colorClass="bg-green-500 text-green-500"
          />
           <KpiCard 
            title="Drop Rate" 
            value={latest.dropRate} 
            unit="%" 
            trend={latest.dropRate < previous.dropRate ? 'down' : 'up'} 
            trendValue={calcTrend(latest.dropRate, previous.dropRate).val}
            icon={AlertTriangle}
            colorClass="bg-amber-500 text-amber-500"
          />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Throughput Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Throughput Trends (7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorDL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-10" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} Mbps`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Area type="monotone" dataKey="throughputDL" name="Download" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorDL)" />
                <Area type="monotone" dataKey="throughputUL" name="Upload" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Volume */}
        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Data Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-10" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="trafficVolume" name="Volume" unit={searchImsi ? " GB" : " TB"} fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Charts Row 2 - Radio & Setup */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Radio Health (RSRP vs SINR)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-10" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#f59e0b" fontSize={12} tickLine={false} axisLine={false} domain={[-120, -60]} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} domain={[0, 30]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rsrp" name="RSRP (dBm)" stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} />
                <Line yAxisId="right" type="monotone" dataKey="sinr" name="SINR (dB)" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-carddark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Connection Stability</h3>
           <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                 <defs>
                  <linearGradient id="colorSetup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-10" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[90, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                <Area type="step" dataKey="setupSuccessRate" name="Setup Success %" stroke="#f43f5e" strokeWidth={2} fill="url(#colorSetup)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};