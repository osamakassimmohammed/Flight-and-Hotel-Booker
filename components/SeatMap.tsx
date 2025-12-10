
import React, { useState, useEffect } from 'react';
import type { SeatMap, Seat, SelectedSeat, Flight } from '../types';

interface SeatMapProps {
  flight: Flight;
  seatMaps: SeatMap[];
  passengers: number; // Total number of passengers
  onConfirm: (selectedSeats: SelectedSeat[]) => void;
  onBack: () => void;
}

const SeatMapVisualizer: React.FC<SeatMapProps> = ({ flight, seatMaps, passengers, onConfirm, onBack }) => {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  // Map of SegmentID -> TravelerIndex -> Seat
  const [selections, setSelections] = useState<Record<string, Record<string, Seat | null>>>({});
  
  // Amadeus Traveler IDs are usually "1", "2", etc.
  const travelers = Array.from({ length: passengers }, (_, i) => (i + 1).toString());

  // Helper to init selection state
  useEffect(() => {
    const initialSelections: Record<string, Record<string, Seat | null>> = {};
    seatMaps.forEach(map => {
        initialSelections[map.segmentId] = {};
        travelers.forEach(id => {
            initialSelections[map.segmentId][id] = null;
        });
    });
    setSelections(initialSelections);
  }, [seatMaps, passengers]);

  const activeMap = seatMaps[activeSegmentIndex];
  if (!activeMap) return <div>Loading Seat Map...</div>;

  const currentSegmentSelections: Record<string, Seat | null> = selections[activeMap.segmentId] || {};
  
  // Determine current traveler to select for (first one without a seat in this segment)
  const activeTravelerId = travelers.find(t => !currentSegmentSelections[t]) ?? travelers[travelers.length - 1];

  const handleSeatClick = (seat: Seat) => {
    if (seat.travelerPricing[0].seatAvailabilityStatus !== 'AVAILABLE') return;

    // Check if seat is already taken by another traveler in this segment
    const isTaken = Object.values(currentSegmentSelections).some((s: Seat | null) => s?.number === seat.number);
    if (isTaken) {
        // If clicked own seat, deselect
        const ownerId = Object.keys(currentSegmentSelections).find(key => currentSegmentSelections[key]?.number === seat.number);
        if (ownerId) {
            setSelections(prev => ({
                ...prev,
                [activeMap.segmentId]: {
                    ...prev[activeMap.segmentId],
                    [ownerId]: null
                }
            }));
        }
        return;
    }
    
    // Select for current active traveler
    setSelections(prev => ({
        ...prev,
        [activeMap.segmentId]: {
            ...prev[activeMap.segmentId],
            [activeTravelerId]: seat
        }
    }));
  };

  const flattenSeats = activeMap.decks[0].seats; // Assuming single deck for simplicity
  
  // Group by Row
  const rows: Record<string, Seat[]> = {};
  flattenSeats.forEach(seat => {
    // Regex to split "12A" into "12" and "A"
    const match = seat.number.match(/(\d+)([A-Z]+)/);
    if(match) {
        const rowNum = parseInt(match[1]);
        if (!rows[rowNum]) rows[rowNum] = [];
        rows[rowNum].push(seat);
    }
  });

  const rowNumbers = Object.keys(rows).map(Number).sort((a,b) => a-b);
  
  // Get all unique column letters to build grid
  const allColumns: string[] = Array.from<string>(new Set(flattenSeats.map(s => s.number.replace(/[0-9]/g, '')))).sort();

  const handleFinish = () => {
      // Flatten selections to SelectedSeat array
      const results: SelectedSeat[] = [];
      Object.keys(selections).forEach(segId => {
          Object.keys(selections[segId]).forEach(travId => {
              const seat = selections[segId][travId];
              if (seat) {
                  results.push({
                      segmentId: segId,
                      travelerId: travId, 
                      seatNumber: seat.number,
                      price: parseFloat(seat.travelerPricing[0].price?.total || '0'),
                      currency: seat.travelerPricing[0].price?.currency || 'USD'
                  });
              }
          });
      });
      onConfirm(results);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Select Seats</h2>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700">Back</button>
      </div>

      {/* Segment Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {seatMaps.map((map, idx) => {
            const segment = flight.itineraries.flatMap(it => it.segments).find(s => s.id === map.segmentId);
            return (
                <button 
                    key={map.segmentId}
                    onClick={() => setActiveSegmentIndex(idx)}
                    className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium border ${idx === activeSegmentIndex ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                    {segment ? `${segment.departure.iataCode} - ${segment.arrival.iataCode}` : `Flight ${idx + 1}`}
                </button>
            )
        })}
      </div>

      {/* Main Seat Map Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Plane Visualizer */}
        <div className="flex-1 bg-slate-100 rounded-lg p-6 overflow-y-auto max-h-[600px] border border-slate-200">
             {/* Legend */}
             <div className="flex justify-center space-x-6 mb-8 text-xs font-medium text-slate-600">
                <div className="flex items-center"><div className="w-5 h-5 rounded bg-white border border-slate-300 mr-2"></div> Available</div>
                <div className="flex items-center"><div className="w-5 h-5 rounded bg-slate-300 border border-slate-400 mr-2 opacity-50"></div> Occupied</div>
                <div className="flex items-center"><div className="w-5 h-5 rounded bg-blue-600 border border-blue-700 mr-2"></div> Selected</div>
             </div>

             <div className="w-full max-w-md mx-auto">
                 {/* Column Headers */}
                 <div className="flex justify-between px-8 mb-2">
                     {allColumns.map(col => <div key={col} className="w-8 text-center text-slate-400 font-bold">{col}</div>)}
                 </div>

                 <div className="space-y-2">
                    {rowNumbers.map(rowNum => (
                        <div key={rowNum} className="flex items-center justify-between">
                             {/* Row Number Left */}
                             <span className="w-6 text-xs text-slate-400 text-center">{rowNum}</span>
                             
                             <div className="flex-1 flex justify-between px-2">
                                 {allColumns.map(col => {
                                     const seat = rows[rowNum].find(s => s.number.includes(col));
                                     if (!seat) return <div key={col} className="w-8 h-8"></div>; // Aisle or gap
                                     
                                     const isAvailable = seat.travelerPricing[0].seatAvailabilityStatus === 'AVAILABLE';
                                     const isSelected = Object.values(currentSegmentSelections).some((s: Seat | null) => s?.number === seat.number);
                                     const price = parseFloat(seat.travelerPricing[0].price?.total || '0');

                                     return (
                                         <button
                                            key={seat.number}
                                            disabled={!isAvailable}
                                            onClick={() => handleSeatClick(seat)}
                                            className={`w-8 h-8 rounded-t-md text-[10px] flex items-center justify-center border transition-colors relative group
                                                ${!isAvailable ? 'bg-slate-300 border-slate-400 cursor-not-allowed text-slate-500' : ''}
                                                ${isSelected ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-300 hover:border-blue-400'}
                                            `}
                                         >
                                             {/* Tooltip for price */}
                                             {isAvailable && price > 0 && (
                                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                                     ${price}
                                                 </div>
                                             )}
                                         </button>
                                     );
                                 })}
                             </div>
                             
                             {/* Row Number Right */}
                             <span className="w-6 text-xs text-slate-400 text-center">{rowNum}</span>
                        </div>
                    ))}
                 </div>
             </div>
        </div>

        {/* Sidebar Selection Summary */}
        <div className="w-full lg:w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-700 mb-4">Your Selection</h3>
            <div className="space-y-4">
                {travelers.map(tId => {
                     const selected = currentSegmentSelections[tId];
                     return (
                         <div key={tId} className={`p-3 rounded-md border ${activeTravelerId === tId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white'}`}>
                             <div className="text-sm font-semibold text-slate-700 mb-1">Traveler {tId}</div>
                             {selected ? (
                                 <div className="flex justify-between items-center text-sm">
                                     <span className="font-mono font-bold text-slate-800">{selected.number}</span>
                                     <span className="text-slate-600">
                                         {parseFloat(selected.travelerPricing[0].price?.total || '0') > 0 
                                            ? `+$${selected.travelerPricing[0].price?.total}` 
                                            : 'Free'}
                                     </span>
                                 </div>
                             ) : (
                                 <span className="text-xs text-slate-400 italic">No seat selected</span>
                             )}
                         </div>
                     )
                })}
            </div>
            
            <button 
                onClick={handleFinish}
                className="w-full mt-6 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
            >
                Confirm Seats
            </button>
        </div>

      </div>
    </div>
  );
};

export default SeatMapVisualizer;
