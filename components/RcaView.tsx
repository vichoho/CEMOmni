import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend, ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';
import { RCA_DISTRIBUTION, CHART_DATA_1_TREND, CHART_DATA_2_CELLS, CHART_DATA_3_HO, CHART_DATA_4_VOLTE } from '../constants';

const COLORS = RCA_DISTRIBUTION.map(d => d.color);

// Fix: Make children optional in the props type definition
const RcaCard = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="bg-white dark:bg-carddark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[300px]">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 border-l-4 border-telco-500 pl-2 uppercase tracking-wide">{title}</h3>
    <div className="flex-1 w-full min-h-0">
      {children}
    </div>
  </div>
);

export const RcaView: React.FC = () => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Root Cause Analysis (RCA)</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into failure mechanisms and anomalies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Overall RCA Distribution */}
        <RcaCard title="Total Failure Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={RCA_DISTRIBUTION as any}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {RCA_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </RcaCard>

        {/* 2. Failure Trend */}
        <RcaCard title="Failure Count Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA_1_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </RcaCard>

        {/* 3. Top Contributing Cells */}
        <RcaCard title="Top Worst Performing Cells">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA_2_CELLS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={50} fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </RcaCard>

        {/* 4. Handover Analysis */}
        <RcaCard title="Handover Failure Types">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA_3_HO}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
               <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
               <YAxis fontSize={10} axisLine={false} tickLine={false} />
               <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
               <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </RcaCard>

        {/* 5. Coverage Map Proxy (Scatter) */}
        <RcaCard title="Weak Coverage Hotspots (Relative)">
           <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" dataKey="x" name="Longitude" hide />
              <YAxis type="number" dataKey="y" name="Latitude" hide />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Scatter name="Hotspots" data={Array.from({length: 20}, () => ({ x: Math.random()*100, y: Math.random()*100, z: Math.random()*100 }))} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </RcaCard>

        {/* 6. VoLTE Quality Issues */}
        <RcaCard title="VoLTE Degradation Factors">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CHART_DATA_4_VOLTE}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
              >
                {CHART_DATA_4_VOLTE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ec4899' : index === 1 ? '#06b6d4' : '#6366f1'} />
                ))}
              </Pie>
              <Legend verticalAlign="middle" align="right" layout="vertical" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </RcaCard>
        
        {/* 7. Throughput vs Latency Correlation */}
        <RcaCard title="Throughput vs Latency">
           <ResponsiveContainer width="100%" height="100%">
             <ScatterChart>
               <CartesianGrid opacity={0.2} />
               <XAxis type="number" dataKey="throughput" name="Throughput" unit="Mbps" fontSize={10} tickLine={false} />
               <YAxis type="number" dataKey="latency" name="Latency" unit="ms" fontSize={10} tickLine={false} />
               <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
               <Scatter name="Sessions" data={Array.from({length: 30}, () => ({ throughput: Math.random()*100, latency: 20 + Math.random()*50 }))} fill="#10b981" />
             </ScatterChart>
           </ResponsiveContainer>
        </RcaCard>

        {/* 8. Alarm Severity Trend */}
        <RcaCard title="Alarm Severity (Major/Critical)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA_1_TREND}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="failures" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </RcaCard>

         {/* 9. Transport Layer Retransmission */}
         <RcaCard title="RLC Retransmission Rate">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA_1_TREND}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
               <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
               <YAxis fontSize={10} axisLine={false} tickLine={false} />
               <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
               <Bar dataKey="failures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </RcaCard>

      </div>
    </div>
  );
};