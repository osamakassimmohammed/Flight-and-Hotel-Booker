
import React, { useState } from 'react';
import type { Airport, SearchParams } from '../types';
import Autocomplete from './Autocomplete';
import { LocationMarkerIcon, CalendarIcon } from './IconComponents';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>('round-trip');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureDate || (tripType === 'round-trip' && !returnDate)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (origin.code === destination.code) {
        setError('Origin and Destination cannot be the same.');
        return;
    }
    setError(null);
    onSearch({ 
        origin: origin.code, 
        destination: destination.code, 
        departureDate, 
        returnDate: tripType === 'round-trip' ? returnDate : null, 
        adults, 
        children 
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">Find your next flight</h2>
        <div className="flex items-center space-x-4">
            <button type="button" onClick={() => setTripType('round-trip')} className={`px-3 py-1 text-sm font-medium rounded-md transition ${tripType === 'round-trip' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Round-trip</button>
            <button type="button" onClick={() => setTripType('one-way')} className={`px-3 py-1 text-sm font-medium rounded-md transition ${tripType === 'one-way' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>One-way</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative z-30">
                <Autocomplete 
                    label="From" 
                    value={origin} 
                    onChange={setOrigin} 
                    icon={<LocationMarkerIcon className="h-5 w-5"/>}
                    placeholder="City or Airport (e.g. New York)"
                />
            </div>
            <div className="relative z-20">
                <Autocomplete 
                    label="To" 
                    value={destination} 
                    onChange={setDestination} 
                    icon={<LocationMarkerIcon className="h-5 w-5"/>}
                    placeholder="City or Airport (e.g. London)"
                />
            </div>
        </div>
        <div className={`grid grid-cols-1 ${tripType === 'round-trip' ? 'md:grid-cols-2' : ''} gap-4 relative z-10`}>
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-slate-600 mb-1">Departure</label>
              <div className="relative">
                <CalendarIcon className="absolute h-5 w-5 text-slate-400 left-3 top-1/2 -translate-y-1/2"/>
                <input type="date" id="departureDate" value={departureDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDepartureDate(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"/>
              </div>
            </div>
            {tripType === 'round-trip' && (
                <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium text-slate-600 mb-1">Return</label>
                    <div className="relative">
                        <CalendarIcon className="absolute h-5 w-5 text-slate-400 left-3 top-1/2 -translate-y-1/2"/>
                        <input type="date" id="returnDate" value={returnDate} min={departureDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"/>
                    </div>
                </div>
            )}
        </div>
        <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
                <label htmlFor="adults" className="block text-sm font-medium text-slate-600 mb-1">Adults</label>
                <input type="number" id="adults" value={adults} min="1" max="9" onChange={(e) => setAdults(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div>
                <label htmlFor="children" className="block text-sm font-medium text-slate-600 mb-1">Children</label>
                <input type="number" id="children" value={children} min="0" max="9" onChange={(e) => setChildren(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="pt-2 relative z-10">
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            Search Flights
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
