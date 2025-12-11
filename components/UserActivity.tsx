import React from 'react';
import { MOCK_SESSIONS } from '../constants';
import { Smartphone, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const UserActivity: React.FC = () => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Activity Tracking</h1>
           <p className="text-slate-500 dark:text-slate-400">Individual subscriber session performance</p>
        </div>
        <div className="bg-white dark:bg-carddark px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="font-bold text-lg text-telco-600">14,203</span> <span className="text-sm text-slate-500">Active Sessions</span>
        </div>
      </div>

      <div className="bg-white dark:bg-carddark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">IMSI / User ID</th>
                <th className="p-4 font-semibold">Service</th>
                <th className="p-4 font-semibold">RAT</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">QoE Score</th>
                <th className="p-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {MOCK_SESSIONS.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${session.status === 'Normal' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 
                        session.status === 'Failure' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 
                        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>
                      {session.status === 'Normal' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {session.status !== 'Normal' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {session.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <Smartphone className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{session.imsi}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{session.service}</td>
                  <td className="p-4">
                    <span className={`font-bold ${session.rat === '5G' ? 'text-telco-600 dark:text-telco-400' : 'text-slate-500'}`}>
                      {session.rat}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{session.location}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor(session.duration / 60)}m {session.duration % 60}s
                  </td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${i < session.qoeScore ? (session.qoeScore >= 4 ? 'bg-green-500' : session.qoeScore >= 3 ? 'bg-amber-400' : 'bg-red-500') : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-500 text-xs">
                    {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};