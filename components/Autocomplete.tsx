
import React, { useState, useEffect, useRef } from 'react';
import type { Airport } from '../types';
import { searchAirports, getRecommendedLocations } from '../services/amadeusService';
import { PlaneIcon } from './IconComponents';

interface AutocompleteProps {
  label: string;
  value: Airport | null;
  onChange: (value: Airport) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ label, value, onChange, icon, placeholder }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal query state with external value changes
  useEffect(() => {
    if (value) {
      setQuery(`${value.city} (${value.code})`);
    } else {
      setQuery('');
    }
  }, [value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If query doesn't match the selected value, reset it to the selected value
        if (value && query !== `${value.city} (${value.code})`) {
            setQuery(`${value.city} (${value.code})`);
        } else if (!value) {
            setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, query]);

  const handleFocus = () => {
    setIsOpen(true);
    // Show recommended locations immediately if input is empty or matches the current selection
    if (!query || (value && query === `${value.city} (${value.code})`)) {
      setSuggestions(getRecommendedLocations());
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (val.length === 0) {
      setSuggestions(getRecommendedLocations());
      return;
    }

    if (val.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    // Debounce is implicit here by letting the user type, but for a real production app 
    // you would want a proper debounce utility. For this demo, we'll wait a tiny bit.
    const delayDebounceFn = setTimeout(async () => {
        try {
            const results = await searchAirports(val);
            setSuggestions(results);
        } catch (error) {
            console.error("Error fetching airports:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  };

  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
          placeholder={placeholder || "Search city or airport..."}
        />
        {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white mt-1 border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {!isLoading && query.length < 2 && (
                <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    Recommended Cities
                </div>
            )}
            <ul>
            {suggestions.map((airport) => (
                <li
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                >
                <div>
                    <span className="font-medium text-slate-800">{airport.city}</span>
                    <span className="text-xs text-slate-500 block">{airport.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{airport.code}</span>
                </li>
            ))}
            </ul>
        </div>
      )}
      
      {isOpen && query.length >= 2 && !isLoading && suggestions.length === 0 && (
         <div className="absolute z-20 w-full bg-white mt-1 border border-slate-200 rounded-md shadow-lg p-3 text-sm text-slate-500 text-center">
            No results found
         </div>
      )}
    </div>
  );
};

export default Autocomplete;
