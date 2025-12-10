
import React, { useState } from 'react';
import type { Flight, Itinerary, Segment } from '../types';
import { PlaneIcon, SuitcaseIcon } from './IconComponents';

interface FlightListProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  onBack: () => void;
}

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const SegmentDetail: React.FC<{ segment: Segment, isLast: boolean }> = ({ segment, isLast }) => {
    const baggageText = segment.includedCheckedBags?.quantity 
        ? `${segment.includedCheckedBags.quantity} Checked Bag${segment.includedCheckedBags.quantity > 1 ? 's' : ''}`
        : segment.includedCheckedBags?.weight 
            ? `${segment.includedCheckedBags.weight}${segment.includedCheckedBags.weightUnit} Bag Weight`
            : 'Check baggage rules';

    return (
        <div className="relative pl-6 pb-6 border-l border-slate-300 ml-2 last:border-0 last:pb-0">
             <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-slate-400 border-2 border-white"></div>
             
             {/* Departure */}
             <div className="mb-2">
                 <p className="text-sm font-bold text-slate-800">{formatTime(segment.departure.at)} &bull; {segment.departure.iataCode}</p>
                 <p className="text-xs text-slate-500">{formatDate(segment.departure.at)}</p>
             </div>
             
             {/* Flight Info Box */}
             <div className="bg-slate-50 rounded-md p-3 mb-2 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 gap-2">
                    <div className="flex items-center gap-2">
                         <img src={`https://logo.clearbit.com/${segment.carrier.toLowerCase().replace(/\s/g, '')}.com`} 
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              alt="" className="h-4 w-4 object-contain" />
                         <span className="font-semibold">{segment.carrier}</span>
                         <span className="text-slate-400">|</span>
                         <span>Flight {segment.flightNumber}</span>
                    </div>
                    <div>
                         <span>{segment.aircraft.name} ({segment.aircraft.code})</span>
                    </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                     <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                        {segment.cabin || 'Economy'}
                     </span>
                     <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs font-medium">
                        <SuitcaseIcon className="w-3 h-3 mr-1"/> {baggageText}
                     </span>
                </div>
                {segment.operatingCarrier && segment.operatingCarrier !== segment.carrier && (
                    <p className="text-xs text-slate-400 mt-2 italic">Operated by {segment.operatingCarrier}</p>
                )}
             </div>

             {/* Arrival (only show duration here, arrival time is usually start of next or end) */}
             <div className="text-xs text-slate-500 mb-2">
                 Duration: {segment.duration}
             </div>

             {isLast && (
                 <div className="relative">
                     <div className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-slate-800 border-2 border-white"></div>
                     <p className="text-sm font-bold text-slate-800">{formatTime(segment.arrival.at)} &bull; {segment.arrival.iataCode}</p>
                     <p className="text-xs text-slate-500">{formatDate(segment.arrival.at)}</p>
                 </div>
             )}
        </div>
    );
}

const ItinerarySummary: React.FC<{ itinerary: Itinerary, title: string }> = ({ itinerary, title }) => {
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const stops = itinerary.segments.length - 1;

    return (
        <div>
            <div className="flex justify-between items-baseline mb-2">
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="text-xs text-slate-500">{formatDate(firstSegment.departure.at)}</p>
            </div>
            <div className="flex items-center justify-between text-center">
                <div>
                    <p className="text-lg font-medium text-slate-900">{formatTime(firstSegment.departure.at)}</p>
                    <p className="text-sm font-semibold text-slate-600">{firstSegment.departure.iataCode}</p>
                </div>
                <div className="flex-1 px-2 text-slate-500">
                    <div className="flex items-center justify-center">
                        <div className="flex-1 border-t border-dashed"></div>
                        <PlaneIcon className="w-4 h-4 mx-2" />
                        <div className="flex-1 border-t border-dashed"></div>
                    </div>
                    <p className="text-xs mt-1">{itinerary.duration}</p>
                     <p className={`text-xs mt-1 font-medium ${stops > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {stops > 0 ? `${stops} stop${stops > 1 ? 's' : ''}` : 'Non-stop'}
                    </p>
                </div>
                <div>
                    <p className="text-lg font-medium text-slate-900">{formatTime(lastSegment.arrival.at)}</p>
                    <p className="text-sm font-semibold text-slate-600">{lastSegment.arrival.iataCode}</p>
                </div>
            </div>
        </div>
    );
};


const FlightCard: React.FC<{ flight: Flight; onSelect: () => void }> = ({ flight, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const outboundItinerary = flight.itineraries[0];
  const returnItinerary = flight.itineraries.length > 1 ? flight.itineraries[1] : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-blue-100">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
                <img src={flight.airlineLogoUrl} alt={`${flight.validatingAirline} logo`} className="h-10 w-10 rounded-full bg-slate-200 object-contain" />
                <div>
                    <p className="font-semibold text-slate-800">{flight.validatingAirline}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        {flight.itineraries[0].segments[0].cabin && (
                           <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                {flight.itineraries[0].segments[0].cabin}
                           </span>
                        )}
                         <span>{flight.numberOfBookableSeats} seats left</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">${flight.price.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Total price</p>
            </div>
        </div>
        
        <div className="space-y-4">
            <ItinerarySummary itinerary={outboundItinerary} title="Outbound" />
            {returnItinerary && (
                 <>
                    <div className="border-t border-slate-200/80 my-3"></div>
                    <ItinerarySummary itinerary={returnItinerary} title="Return" />
                 </>
            )}
        </div>

      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="bg-slate-50 px-4 py-4 sm:px-6 border-t border-slate-200">
             <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Flight Details</h4>
             <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Outbound - {flight.itineraries[0].duration}</p>
                    <div className="ml-1">
                        {flight.itineraries[0].segments.map((seg, idx, arr) => (
                            <SegmentDetail key={seg.id} segment={seg} isLast={idx === arr.length - 1} />
                        ))}
                    </div>
                </div>
                {flight.itineraries[1] && (
                    <div>
                         <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Return - {flight.itineraries[1].duration}</p>
                         <div className="ml-1">
                            {flight.itineraries[1].segments.map((seg, idx, arr) => (
                                <SegmentDetail key={seg.id} segment={seg} isLast={idx === arr.length - 1} />
                            ))}
                        </div>
                    </div>
                )}
             </div>
        </div>
      )}

      <div className="bg-slate-50 px-4 py-3 sm:px-5 flex gap-3 border-t border-slate-200">
         <button onClick={() => setExpanded(!expanded)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors text-sm">
            {expanded ? 'Hide Details' : 'Flight Details'}
          </button>
         <button onClick={onSelect} className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
            Select Flight
          </button>
      </div>
    </div>
  );
};

const FlightList: React.FC<FlightListProps> = ({ flights, onSelectFlight, onBack }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Available Flights</h2>
            <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                &larr; New Search
            </button>
        </div>
      {flights.length > 0 ? (
        <div className="space-y-4">
          {flights.map(flight => (
            <FlightCard key={flight.id} flight={flight} onSelect={() => onSelectFlight(flight)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-700">No flights found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria or checking back later.</p>
        </div>
      )}
    </div>
  );
};

export default FlightList;
