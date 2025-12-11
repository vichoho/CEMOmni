import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RcaView } from './components/RcaView';
import { UserActivity } from './components/UserActivity';
import { NetworkMap } from './components/NetworkMap';
import { Settings } from './components/Settings';
import { ViewState, WeightConfig } from './types';
import { Moon, Sun } from 'lucide-react';
import { DEFAULT_WEIGHTS } from './constants';
import { useNetworkData } from './hooks/useNetworkData';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS);

  // Global Data Fetching (Lifted state to allow Map and Dashboard to share filtering context if needed in future)
  // For now, Map uses mock data or independent fetch inside its own logic, but we can pass shared data.
  // We use a simple hook call here to demonstrate data availability, though specific components might re-fetch or use context.
  // Actually, to keep it simple, we will just render the components. 
  // NetworkMap needs data, so let's use the hook here if we want to share filters globally, 
  // but currently filters are inside Dashboard. 
  // To allow the Map to see "Global" data, let's just let it use the hook internally or pass default data.
  // For this implementation, NetworkMap will use the hook internally if we passed filters, 
  // but since filters are in Dashboard, let's just pass the mock geo data for now.
  const { geoData } = useNetworkData(); 

  // Initialize Theme based on preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update HTML class
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard weights={weights} />;
      case 'rca': return <RcaView />;
      case 'users': return <UserActivity />;
      case 'map': return <NetworkMap data={geoData} />;
      case 'settings': return <Settings weights={weights} setWeights={setWeights} />;
      default: return <Dashboard weights={weights} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-darkbg text-slate-900 dark:text-slate-100">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Bar for Theme Toggle (Sticky) */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-darkbg/80 backdrop-blur-sm z-40 sticky top-0 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            {currentView === 'dashboard' ? 'Overview' : currentView.replace('-', ' ')}
          </h2>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {renderView()}
          
          <div className="h-20"></div> {/* Spacer for bottom scroll */}
        </div>
      </main>
    </div>
  );
}