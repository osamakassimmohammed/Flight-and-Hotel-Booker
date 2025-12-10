
import React, { useState } from 'react';
import type { Airport, HotelSearchRequest } from '../types';
import Autocomplete from './Autocomplete';
import { LocationMarkerIcon, CalendarIcon, UserIcon } from './IconComponents';

interface HotelSearchFormProps {
  onSearch: (params: HotelSearchRequest) => void;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch }) => {
  const [city, setCity] = useState<Airport | null>(null);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !checkInDate || !checkOutDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    onSearch({ 
        cityCode: city.code, 
        checkInDate, 
        checkOutDate, 
        adults
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">Find your ideal hotel</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative z-30">
            <Autocomplete 
                label="Destination" 
                value={city} 
                onChange={setCity} 
                icon={<LocationMarkerIcon className="h-5 w-5"/>}
                placeholder="Where are you going? (e.g. Paris)"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div>
              <label htmlFor="checkInDate" className="block text-sm font-medium text-slate-600 mb-1">Check-in</label>
              <div className="relative">
                <CalendarIcon className="absolute h-5 w-5 text-slate-400 left-3 top-1/2 -translate-y-1/2"/>
                <input type="date" id="checkInDate" value={checkInDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setCheckInDate(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"/>
              </div>
            </div>
            <div>
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-slate-600 mb-1">Check-out</label>
                <div className="relative">
                    <CalendarIcon className="absolute h-5 w-5 text-slate-400 left-3 top-1/2 -translate-y-1/2"/>
                    <input type="date" id="checkOutDate" value={checkOutDate} min={checkInDate} onChange={(e) => setCheckOutDate(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"/>
                </div>
            </div>
        </div>
        
        <div className="relative z-10">
            <label htmlFor="hotelAdults" className="block text-sm font-medium text-slate-600 mb-1">Guests</label>
            <div className="relative">
                <UserIcon className="absolute h-5 w-5 text-slate-400 left-3 top-1/2 -translate-y-1/2"/>
                <input type="number" id="hotelAdults" value={adults} min="1" max="9" onChange={(e) => setAdults(parseInt(e.target.value))} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="pt-2 relative z-10">
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            Search Hotels
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelSearchForm;
