
import React from 'react';
import { PlaneIcon, HotelIcon } from './IconComponents';
import { AmadeusEnv } from '../services/amadeusService';

interface HeaderProps {
    currentEnv: AmadeusEnv;
    onEnvChange: (env: AmadeusEnv) => void;
    activeTab: 'FLIGHTS' | 'HOTELS';
    onTabChange: (tab: 'FLIGHTS' | 'HOTELS') => void;
}

const Header: React.FC<HeaderProps> = ({ currentEnv, onEnvChange, activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
                <PlaneIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Amadeus Booker</h1>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => onEnvChange('TEST')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentEnv === 'TEST' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Dev (Test)
                </button>
                <button 
                    onClick={() => onEnvChange('PROD')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentEnv === 'PROD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Prod (Live)
                </button>
            </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-6">
            <button 
                onClick={() => onTabChange('FLIGHTS')}
                className={`flex items-center pb-2 border-b-2 font-medium transition-colors ${activeTab === 'FLIGHTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <PlaneIcon className="w-5 h-5 mr-2" />
                Flights
            </button>
            <button 
                onClick={() => onTabChange('HOTELS')}
                className={`flex items-center pb-2 border-b-2 font-medium transition-colors ${activeTab === 'HOTELS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <HotelIcon className="w-5 h-5 mr-2" />
                Hotels
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
