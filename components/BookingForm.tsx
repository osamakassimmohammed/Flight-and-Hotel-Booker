
import React, { useState } from 'react';
import type { Flight, Passenger } from '../types';
import { PlaneIcon, UserIcon, PhoneIcon, IdentificationIcon } from './IconComponents';

interface BookingFormProps {
  flight: Flight;
  onBook: (passengers: Passenger[]) => void;
  onBack: () => void;
}

const initialPassengerState = (travelerInfo: any): Passenger => ({
    id: travelerInfo.travelerId, 
    travelerType: travelerInfo.travelerType,
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    gender: 'MALE', // Default to MALE to avoid API errors with UNSPECIFIED
    contact: {
      emailAddress: '',
      phone: {
        deviceType: 'MOBILE',
        countryCallingCode: '1',
        number: '',
      },
    },
    document: {
      documentType: 'PASSPORT',
      number: '',
      expiryDate: '',
      issuanceCountry: 'US',
      nationality: 'US',
    },
});

const PassengerCard: React.FC<{ passenger: Passenger, setPassenger: (p: Passenger) => void, index: number, isPrimary: boolean }> = ({ passenger, setPassenger, index, isPrimary }) => {
    
    const handleChange = (field: keyof Passenger | `contact.${keyof Passenger['contact']}` | `contact.phone.${keyof Passenger['contact']['phone']}` | `document.${keyof Passenger['document']}`, value: any) => {
        const keys = field.split('.');
        const newPassenger = JSON.parse(JSON.stringify(passenger)); // Deep copy
        
        let current = newPassenger;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        
        setPassenger(newPassenger);
    };

    return (
      <div className="border border-slate-200 rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 capitalize">{passenger.travelerType.toLowerCase()} {index + 1} {isPrimary ? '(Primary Contact)' : ''}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Info */}
            <div><label className="block text-sm font-medium text-slate-600 mb-1">First Name</label><input type="text" value={passenger.firstName} onChange={e => handleChange('firstName', e.target.value)} className="w-full input-style" required/></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label><input type="text" value={passenger.lastName} onChange={e => handleChange('lastName', e.target.value)} className="w-full input-style" required/></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label><input type="date" value={passenger.dateOfBirth} max={new Date().toISOString().split('T')[0]} onChange={e => handleChange('dateOfBirth', e.target.value)} className="w-full input-style" required/></div>
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                <select value={passenger.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full input-style" required>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                </select>
            </div>
            
            {/* Contact Info */}
             <div><label className="block text-sm font-medium text-slate-600 mb-1">Email</label><input type="email" value={passenger.contact.emailAddress} onChange={e => handleChange('contact.emailAddress', e.target.value)} className="w-full input-style" required/></div>
             <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                <div className="flex">
                    <input type="text" value={passenger.contact.phone.countryCallingCode} onChange={e => handleChange('contact.phone.countryCallingCode', e.target.value)} className="w-1/4 input-style rounded-r-none" placeholder="+1" required/>
                    <input type="tel" value={passenger.contact.phone.number} onChange={e => handleChange('contact.phone.number', e.target.value)} className="w-3/4 input-style rounded-l-none" placeholder="555-123-4567" required/>
                </div>
            </div>

            {/* Document Info */}
            <div className="md:col-span-2"><hr className="my-2"/></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Passport Number</label><input type="text" value={passenger.document.number} onChange={e => handleChange('document.number', e.target.value)} className="w-full input-style" required/></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Passport Expiry</label><input type="date" value={passenger.document.expiryDate} onChange={e => handleChange('document.expiryDate', e.target.value)} className="w-full input-style" required/></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Nationality</label><input type="text" value={passenger.document.nationality} onChange={e => handleChange('document.nationality', e.target.value)} className="w-full input-style" placeholder="US" required/></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Issuance Country</label><input type="text" value={passenger.document.issuanceCountry} onChange={e => handleChange('document.issuanceCountry', e.target.value)} className="w-full input-style" placeholder="US" required/></div>
        </div>
      </div>
    );
};


const BookingForm: React.FC<BookingFormProps> = ({ flight, onBook, onBack }) => {
  const [passengers, setPassengers] = useState<Passenger[]>(
    flight.amadeusOffer.travelerPricings.map(initialPassengerState)
  );
  const [error, setError] = useState<string | null>(null);

  const handlePassengerChange = (index: number, updatedPassenger: Passenger) => {
    const newPassengers = [...passengers];
    newPassengers[index] = updatedPassenger;
    setPassengers(newPassengers);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate fields
    for (const p of passengers) {
        if (!p.firstName || !p.lastName || !p.dateOfBirth || !p.contact.emailAddress) {
            setError(`Please fill in all required fields for ${p.travelerType.toLowerCase()} ${passengers.indexOf(p) + 1}.`);
            return;
        }
        if (!p.contact.phone.number) {
            setError('Please enter a phone number.');
            return;
        }
    }
    setError(null);
    onBook(passengers);
  };

  return (
    <div>
        <style>{`.input-style { all: unset; box-sizing: border-box; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); transition: all 0.2s; } .input-style:focus { outline: 2px solid #3b82f6; border-color: #3b82f6; }`}</style>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Passenger Information</h2>
            <button onClick={onBack} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                &larr; Back to Results
            </button>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-6">
            {passengers.map((p, index) => (
                <PassengerCard 
                    key={p.id}
                    passenger={p}
                    setPassenger={(updated) => handlePassengerChange(index, updated)}
                    index={index}
                    isPrimary={index === 0}
                />
            ))}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <p className="text-slate-600">Total Price</p>
                    <p className="text-3xl font-bold text-blue-600">${flight.price.toFixed(2)}</p>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Confirm Booking
                </button>
            </div>
        </form>
    </div>
  );
};

export default BookingForm;
