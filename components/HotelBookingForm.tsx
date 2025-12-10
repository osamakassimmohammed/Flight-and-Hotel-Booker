
import React, { useState } from 'react';
import type { Hotel, HotelOffer, Passenger, PaymentCard } from '../types';
import { CreditCardIcon } from './IconComponents';

interface HotelBookingFormProps {
  hotel: Hotel;
  offer: HotelOffer;
  onBook: (guest: Passenger, payment: PaymentCard) => void;
  onBack: () => void;
}

const HotelBookingForm: React.FC<HotelBookingFormProps> = ({ hotel, offer, onBook, onBack }) => {
  // Guest State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE'|'FEMALE'>('MALE');

  // Payment State
  const [cardType, setCardType] = useState<'VI'|'MC'|'AX'>('VI');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardName, setCardName] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !cardNumber || !expiry || !cardName) {
        setError("Please fill in all fields.");
        return;
    }

    const guest: Passenger = {
        id: '1',
        travelerType: 'ADULT',
        firstName,
        lastName,
        gender,
        dateOfBirth: '1990-01-01', // Default for simplicity if not asked
        contact: {
            emailAddress: email,
            phone: { deviceType: 'MOBILE', countryCallingCode: '1', number: phone }
        },
        document: { // Dummy for type satisfaction
            documentType: 'PASSPORT', number: '0000', expiryDate: '2030-01-01', issuanceCountry: 'US', nationality: 'US'
        }
    };

    const payment: PaymentCard = {
        vendorCode: cardType,
        cardNumber,
        expiryDate: expiry, // Expecting YYYY-MM
        holderName: cardName
    };

    onBook(guest, payment);
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Complete Your Booking</h2>
            <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                &larr; Cancel
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="md:col-span-1 bg-slate-50 p-6 rounded-lg h-fit border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4">Order Summary</h3>
                <p className="text-lg font-semibold text-slate-800">{hotel.name}</p>
                <p className="text-sm text-slate-500 mb-4">{hotel.cityCode}</p>
                
                <div className="border-t border-slate-200 py-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Check-in</span> <span className="font-medium">{offer.checkInDate}</span></div>
                    <div className="flex justify-between"><span>Check-out</span> <span className="font-medium">{offer.checkOutDate}</span></div>
                    <div className="flex justify-between"><span>Room</span> <span className="font-medium">{offer.room.type}</span></div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Total</span>
                        <span className="font-bold text-xl text-blue-600">{offer.price.total} {offer.price.currency}</span>
                    </div>
                </div>
            </div>

            {/* Forms */}
            <div className="md:col-span-2 space-y-6">
                <form onSubmit={handleSubmit}>
                    {/* Guest Info */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Guest Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="label-sm">First Name</label><input className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
                            <div><label className="label-sm">Last Name</label><input className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
                            <div>
                                <label className="label-sm">Gender</label>
                                <select className="input-field" value={gender} onChange={e => setGender(e.target.value as any)}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                            <div><label className="label-sm">Email</label><input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                            <div className="md:col-span-2"><label className="label-sm">Phone</label><input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 5551234567" required /></div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center"><CreditCardIcon className="w-5 h-5 mr-2"/> Payment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-sm">Card Type</label>
                                <select className="input-field" value={cardType} onChange={e => setCardType(e.target.value as any)}>
                                    <option value="VI">Visa</option>
                                    <option value="MC">Mastercard</option>
                                    <option value="AX">American Express</option>
                                </select>
                            </div>
                             <div><label className="label-sm">Cardholder Name</label><input className="input-field" value={cardName} onChange={e => setCardName(e.target.value)} required placeholder="AS ON CARD"/></div>
                             <div><label className="label-sm">Card Number</label><input className="input-field" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required placeholder="0000 0000 0000 0000"/></div>
                             <div><label className="label-sm">Expiry Date</label><input className="input-field" value={expiry} onChange={e => setExpiry(e.target.value)} required placeholder="YYYY-MM" /></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Note: This is a demo. Do not use real card details in Test environment.</p>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition">Confirm Booking</button>
                </form>
            </div>
        </div>
        
        <style>{`
            .label-sm { display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; }
            .input-field { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; outline: none; transition: border-color 0.2s; }
            .input-field:focus { border-color: #2563eb; ring: 2px solid #2563eb; }
        `}</style>
    </div>
  );
};

export default HotelBookingForm;
