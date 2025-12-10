import React from 'react';
import type { BookingConfirmation, Itinerary } from '../types';
import { PlaneIcon } from './IconComponents';

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
const formatDateShort = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const formatDateSimple = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const ItineraryView: React.FC<{ itinerary: Itinerary, title: string }> = ({ itinerary, title }) => {
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const stops = itinerary.segments.length - 1;

    return (
         <div className="text-left">
            <div className="flex justify-between items-baseline mb-2">
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="text-xs text-slate-500">{formatDateShort(firstSegment.departure.at)}</p>
            </div>
            <div className="flex items-center justify-between text-center">
                <div>
                    <p className="text-base font-medium text-slate-900">{formatTime(firstSegment.departure.at)}</p>
                    <p className="text-xs font-semibold text-slate-600">{firstSegment.departure.iataCode}</p>
                </div>
                <div className="flex-1 px-2 text-slate-500">
                    <div className="flex items-center justify-center">
                        <div className="flex-1 border-t border-dashed"></div>
                        <PlaneIcon className="w-3 h-3 mx-1" />
                        <div className="flex-1 border-t border-dashed"></div>
                    </div>
                     <p className={`text-xs mt-1 font-medium ${stops > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {stops > 0 ? `${stops} stop${stops > 1 ? 's' : ''}` : 'Non-stop'}
                    </p>
                </div>
                <div>
                    <p className="text-base font-medium text-slate-900">{formatTime(lastSegment.arrival.at)}</p>
                    <p className="text-xs font-semibold text-slate-600">{lastSegment.arrival.iataCode}</p>
                </div>
            </div>
        </div>
    );
};

const TravelerInfoCard: React.FC<{ traveler: any }> = ({ traveler }) => (
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
        <p className="font-semibold text-slate-800">{traveler.name.firstName} {traveler.name.lastName}</p>
        <p className="text-sm text-slate-500">{traveler.contact.emailAddress}</p>
        <p className="text-sm text-slate-500">DOB: {formatDateSimple(traveler.dateOfBirth)}</p>
    </div>
);


const Confirmation: React.FC<{ confirmation: BookingConfirmation, onNewSearch: () => void }> = ({ confirmation, onNewSearch }) => {
  const { pnr, orderId, flight, travelers, bookingTime, lastTicketingDate } = confirmation;
  const outboundItinerary = flight.itineraries[0];
  const returnItinerary = flight.itineraries.length > 1 ? flight.itineraries[1] : null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
        <p className="text-slate-500 mt-2">Your flight order has been created. A confirmation has been sent to {travelers[0].contact.emailAddress}.</p>
      </div>

      <div className="mt-6 text-left border border-slate-200 rounded-lg p-4 space-y-4">
        {/* Booking Details */}
        <div>
            <h3 className="font-semibold text-slate-700 mb-2">Booking Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <p className="text-xs text-slate-500">Booking Reference (PNR)</p>
                    <p className="text-lg font-mono font-bold text-blue-600">{pnr}</p>
                </div>
                <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500">Order ID</p>
                    <p className="text-sm font-mono font-semibold text-slate-700 tracking-tight break-all">{orderId}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-500">Booked On</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(bookingTime)}</p>
                </div>
                 <div className="sm:col-span-2">
                    <p className="text-xs text-red-600">Ticketing Deadline</p>
                    <p className="text-sm font-semibold text-red-700">{formatDateSimple(lastTicketingDate)}</p>
                </div>
            </div>
        </div>

        {/* Passenger Details */}
        <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-700 mb-2">{travelers.length} Traveler(s)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {travelers.map(t => <TravelerInfoCard key={t.id} traveler={t} />)}
            </div>
        </div>

        {/* Flight Summary */}
        <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-slate-700">Flight Summary</h3>
            <div className="flex items-center space-x-3">
                <img src={flight.airlineLogoUrl} alt={flight.validatingAirline} className="h-8 w-8 rounded-full object-contain" />
                <p className="font-semibold text-slate-800">{flight.validatingAirline}</p>
            </div>
            
            <ItineraryView itinerary={outboundItinerary} title="Outbound" />
            {returnItinerary && (
                <>
                    <div className="border-t border-slate-200/80 !my-3"></div>
                    <ItineraryView itinerary={returnItinerary} title="Return" />
                </>
            )}
        </div>
      </div>
      
      <button onClick={onNewSearch} className="mt-8 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
        Make Another Booking
      </button>
    </div>
  );
};

export default Confirmation;
