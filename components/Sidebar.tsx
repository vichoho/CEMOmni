import React from 'react';
import { LayoutDashboard, Users, Settings, PieChart, Network, Map } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rca', label: 'RCA Analysis', icon: PieChart },
    { id: 'users', label: 'User Activity', icon: Users },
    { id: 'map', label: 'Coverage Map', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} h-screen bg-white dark:bg-carddark border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col sticky top-0 left-0 z-50 shadow-lg`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <Network className="w-8 h-8 text-telco-600" />
          {isOpen && <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">CEM<span className="text-telco-500">Omni</span></span>}
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-telco-500 text-white shadow-md shadow-telco-500/30' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'group-hover:text-telco-600 dark:group-hover:text-telco-400'}`} />
              {isOpen && <span className={`font-medium ${isActive ? '' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-telco-500 to-purple-500 flex items-center justify-center text-white font-bold">
            AD
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">Network Ops</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};