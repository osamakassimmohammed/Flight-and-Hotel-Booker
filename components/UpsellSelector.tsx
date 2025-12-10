
import React from 'react';
import type { Flight } from '../types';
import { SuitcaseIcon } from './IconComponents';

interface UpsellSelectorProps {
  originalFlight: Flight;
  upsellOffers: Flight[];
  onSelectOffer: (flight: Flight) => void;
  onSkip: () => void;
}

const UpsellCard: React.FC<{ flight: Flight, isOriginal?: boolean, onSelect: () => void }> = ({ flight, isOriginal, onSelect }) => {
    // Extract baggage info from the first segment
    const firstSegment = flight.itineraries[0].segments[0];
    const bags = firstSegment.includedCheckedBags;
    const baggageText = bags?.quantity 
        ? `${bags.quantity} Checked Bag${bags.quantity > 1 ? 's' : ''}`
        : bags?.weight 
            ? `${bags.weight}${bags.weightUnit} Checked Weight`
            : 'No checked bags included';
    
    // Attempt to determine a display name for the fare family
    const fareName = firstSegment.fareBasis?.includes('FLEX') ? 'Flex' 
                   : firstSegment.fareBasis?.includes('SAVER') ? 'Saver'
                   : firstSegment.cabin || 'Standard';

    return (
        <div className={`border rounded-xl p-6 relative flex flex-col h-full transition-all duration-300 ${isOriginal ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500 ring-opacity-20' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg'}`}>
            {isOriginal && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-md">
                    SELECTED
                </div>
            )}
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">{fareName}</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">${flight.price.toFixed(2)}</p>
            
            <div className="space-y-3 mb-8 flex-grow">
                <div className="flex items-start text-sm text-slate-600">
                     <SuitcaseIcon className="w-5 h-5 mr-2 text-slate-400 flex-shrink-0" />
                     <span>{baggageText}</span>
                </div>
                <div className="flex items-start text-sm text-slate-600">
                    <svg className="w-5 h-5 mr-2 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Cabin: {firstSegment.cabin || 'Economy'}</span>
                </div>
                {/* Simulated features based on fare type for demo purposes since API features vary */}
                {fareName.includes('Flex') && (
                     <div className="flex items-start text-sm text-slate-600">
                        <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Refundable / Changeable</span>
                    </div>
                )}
            </div>

            <button 
                onClick={onSelect}
                className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${isOriginal ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}
            >
                {isOriginal ? 'Keep Current Fare' : 'Select Upgrade'}
            </button>
        </div>
    );
};

const UpsellSelector: React.FC<UpsellSelectorProps> = ({ originalFlight, upsellOffers, onSelectOffer, onSkip }) => {
  // Combine original and upsell offers, filtering out any duplicates or lower prices if any
  const allOffers = [originalFlight, ...upsellOffers].sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Upgrade Your Experience</h2>
        <p className="text-slate-500 mt-2">Choose the fare that best suits your travel needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allOffers.map((offer) => (
            <UpsellCard 
                key={offer.id} 
                flight={offer} 
                isOriginal={offer.id === originalFlight.id} 
                onSelect={() => onSelectOffer(offer)}
            />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
          <button onClick={onSkip} className="text-slate-400 text-sm hover:text-slate-600 underline">
            Skip to seat selection
          </button>
      </div>
    </div>
  );
};

export default UpsellSelector;
