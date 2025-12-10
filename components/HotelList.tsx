
import React from 'react';
import type { Hotel, HotelOffer } from '../types';
import { HotelIcon, UserIcon } from './IconComponents';

interface HotelListProps {
  hotels: Hotel[];
  onSelectOffer: (hotel: Hotel, offer: HotelOffer) => void;
  onBack: () => void;
}

const HotelCard: React.FC<{ hotel: Hotel, onSelectOffer: (offer: HotelOffer) => void }> = ({ hotel, onSelectOffer }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 mb-6">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center">
            <HotelIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-bold text-lg text-slate-800">{hotel.name}</h3>
        </div>
        <span className="text-xs font-mono text-slate-500">{hotel.hotelId}</span>
      </div>
      
      <div className="p-4">
         <p className="text-sm text-slate-500 mb-4">{hotel.cityCode}</p>
         
         <div className="space-y-3">
             {hotel.offers.map(offer => (
                 <div key={offer.id} className="border border-slate-100 rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50 transition-colors">
                     <div className="mb-2 sm:mb-0">
                         <p className="font-medium text-slate-800">{offer.room.type} Room</p>
                         <p className="text-xs text-slate-500 line-clamp-1">{offer.room.description?.text || "Standard Room"}</p>
                         <div className="flex items-center mt-1 text-xs text-slate-500">
                            <UserIcon className="w-3 h-3 mr-1" />
                            <span>{offer.guests.adults} Guest(s)</span>
                         </div>
                     </div>
                     <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
                         <div className="text-right mr-4 sm:mr-0">
                             <p className="text-lg font-bold text-blue-600">{offer.price.total} {offer.price.currency}</p>
                             <p className="text-xs text-slate-400">Total Price</p>
                         </div>
                         <button 
                            onClick={() => onSelectOffer(offer)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition"
                         >
                             Book
                         </button>
                     </div>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};

const HotelList: React.FC<HotelListProps> = ({ hotels, onSelectOffer, onBack }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Available Hotels</h2>
            <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                &larr; New Search
            </button>
        </div>
      {hotels.length > 0 ? (
        <div>
          {hotels.map(hotel => (
            <HotelCard key={hotel.hotelId} hotel={hotel} onSelectOffer={(offer) => onSelectOffer(hotel, offer)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-700">No hotels found</h3>
            <p className="text-slate-500 mt-2">We couldn't find any available offers for your search. Try different dates.</p>
        </div>
      )}
    </div>
  );
};

export default HotelList;
