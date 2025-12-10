
import React from 'react';
import type { Flight, Itinerary, Segment, SelectedSeat } from '../types';
import { PlaneIcon, SuitcaseIcon } from './IconComponents';

interface FlightReviewProps {
  flight: Flight;
  selectedSeats?: SelectedSeat[];
  onConfirm: () => void;
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

const FlightReview: React.FC<FlightReviewProps> = ({ flight, selectedSeats = [], onConfirm, onBack }) => {
  const priceChanged = typeof flight.originalPrice === 'number' && flight.originalPrice !== flight.price;
  const priceIncreased = priceChanged && flight.price > flight.originalPrice!;
  
  const totalSeatCost = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const grandTotal = flight.price + totalSeatCost;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Review Your Flight</h2>
        <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Results
        </button>
      </div>

      {/* Flight Details */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <img src={flight.airlineLogoUrl} alt={`${flight.validatingAirline} logo`} className="h-8 w-8 rounded-full bg-slate-200 object-contain" />
                <span className="font-semibold text-slate-800">{flight.validatingAirline}</span>
            </div>
            <span className="text-xs text-slate-500">{flight.numberOfBookableSeats} seats left</span>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
             <div>
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Outbound</p>
                <div className="ml-1">
                    {flight.itineraries[0].segments.map((seg, idx, arr) => (
                        <SegmentDetail key={seg.id} segment={seg} isLast={idx === arr.length - 1} />
                    ))}
                </div>
            </div>

            {flight.itineraries[1] && (
                 <div className="border-t border-slate-100 pt-6">
                    <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Return</p>
                     <div className="ml-1">
                        {flight.itineraries[1].segments.map((seg, idx, arr) => (
                            <SegmentDetail key={seg.id} segment={seg} isLast={idx === arr.length - 1} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-700 mb-3">Selected Seats</h3>
              <div className="space-y-2">
                  {selectedSeats.map((seat, i) => (
                      <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-600">Traveler {seat.travelerId} - Seat {seat.seatNumber}</span>
                          <span className="font-medium text-slate-800">${seat.price.toFixed(2)}</span>
                      </div>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between font-bold text-slate-700">
                      <span>Total Seat Cost</span>
                      <span>${totalSeatCost.toFixed(2)}</span>
                  </div>
              </div>
          </div>
      )}

      {/* Price Confirmation */}
      <div className="border border-slate-200 rounded-lg p-4 text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Price Confirmation</h3>
        
        {/* Breakdown */}
        <div className="text-sm text-slate-500 mb-4 space-y-1">
            <div className="flex justify-between w-64 mx-auto">
                <span>Flight Fare:</span>
                <span>${flight.price.toFixed(2)}</span>
            </div>
            {totalSeatCost > 0 && (
                 <div className="flex justify-between w-64 mx-auto">
                    <span>Seats:</span>
                    <span>${totalSeatCost.toFixed(2)}</span>
                </div>
            )}
        </div>

        {priceChanged ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="font-semibold text-amber-800">
              {priceIncreased ? 'The price has increased.' : 'Good news! The price has decreased.'}
            </p>
            <div className="flex justify-center items-center space-x-4 mt-2">
              <div>
                <p className="text-sm text-slate-500">Original Price</p>
                <p className="line-through text-slate-500">${flight.originalPrice?.toFixed(2)}</p>
              </div>
              <p className="text-2xl font-bold">&rarr;</p>
              <div>
                <p className="text-sm text-slate-700">New Total</p>
                <p className="text-2xl font-bold text-blue-600">${grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-semibold text-green-800">Price confirmed!</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">${grandTotal.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Total price</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        onClick={onConfirm} 
        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
        Proceed to Passenger Details
      </button>
    </div>
  );
};

export default FlightReview;
