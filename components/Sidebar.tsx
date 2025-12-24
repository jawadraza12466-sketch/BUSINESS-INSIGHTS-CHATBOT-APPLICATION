import React from 'react';
import { Industry, BusinessMetrics } from '../types';

interface SidebarProps {
  isOpen: boolean;
  industry: Industry;
  setIndustry: (i: Industry) => void;
  metrics: BusinessMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<BusinessMetrics>>;
  onToggle: () => void;
  onClearChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  industry,
  setIndustry,
  metrics,
  setMetrics,
  onToggle,
  onClearChat
}) => {
  const handleChange = (field: keyof BusinessMetrics, value: string) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onToggle}
      />

      {/* Sidebar Content */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">BizInsight</h1>
          </div>
          <button onClick={onToggle} className="md:hidden text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Industry Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Industry Sector</label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as Industry)}
                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 text-sm"
              >
                {Object.values(Industry).map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Business Metrics Inputs */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Metrics (Optional)</label>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Monthly Revenue ($)</label>
                <input
                  type="text"
                  placeholder="e.g. 50000"
                  value={metrics.revenue}
                  onChange={(e) => handleChange('revenue', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Monthly Expenses ($)</label>
                <input
                  type="text"
                  placeholder="e.g. 30000"
                  value={metrics.expenses}
                  onChange={(e) => handleChange('expenses', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Active Customers</label>
                <input
                  type="text"
                  placeholder="e.g. 1500"
                  value={metrics.customerCount}
                  onChange={(e) => handleChange('customerCount', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
             <h3 className="text-indigo-800 font-semibold text-sm mb-1">Pro Tip</h3>
             <p className="text-indigo-600 text-xs leading-relaxed">
               Updating these metrics helps the AI provide specific financial advice and margin calculations automatically.
             </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClearChat}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Clear Conversation
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;