
export interface Airport {
  code: string;
  name: string;
  city: string;
}

export interface BaggageAllowance {
  quantity?: number;
  weight?: number;
  weightUnit?: string;
}

export interface Segment {
  id: string;
  departure: { iataCode: string; at: string; terminal?: string };
  arrival: { iataCode: string; at: string; terminal?: string };
  carrier: string;
  carrierCode: string;
  flightNumber: string;
  duration: string;
  aircraft: { code: string; name: string };
  operatingCarrier?: string;
  cabin?: string;
  fareBasis?: string;
  class?: string;
  includedCheckedBags?: BaggageAllowance;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Flight {
  id: string;
  itineraries: Itinerary[];
  price: number;
  validatingAirline: string;
  airlineLogoUrl: string;
  amadeusOffer: any; // Holds the original Amadeus flight offer object for booking
  numberOfBookableSeats: number;
  originalPrice?: number; // For price comparison after pricing check
  fareFamily?: string; // e.g. "LIGHT", "STANDARD", "FLEX"
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
}

export interface Phone {
  deviceType: 'MOBILE' | 'LANDLINE' | 'FAX';
  countryCallingCode: string;
  number: string;
}

export interface Document {
  documentType: 'PASSPORT' | 'IDENTITY_CARD' | 'VISA';
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  nationality: string;
}

export interface Passenger {
  id: string; // Corresponds to travelerPricings travelerId
  travelerType: 'ADULT' | 'CHILD' | 'INFANT';
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  contact: {
    emailAddress: string;
    phone: Phone; // Simplified to one phone for the form
  };
  document: Document; // Simplified to one document for the form
}

export interface BookingConfirmation {
  pnr: string;
  orderId: string;
  flight: Flight;
  travelers: any[]; // Raw traveler data from the response for detailed display
  bookingTime: string;
  lastTicketingDate: string;
}

// --- SeatMap Types ---

export interface SeatPricing {
  seatAvailabilityStatus: 'AVAILABLE' | 'BLOCKED' | 'OCCUPIED';
  price?: {
    total: string;
    currency: string;
  };
}

export interface Seat {
  number: string;
  cabin: string;
  coordinates?: { x: number; y: number };
  travelerPricing: SeatPricing[]; // Availability/Pricing per traveler
  characteristicsCodes: string[];
}

export interface Deck {
  deckType: string;
  seats: Seat[];
}

export interface SeatMap {
  id: string; // usually a combination of flight info
  flightOfferId: string;
  segmentId: string;
  decks: Deck[];
  aircraft: { code: string };
}

export interface SelectedSeat {
  segmentId: string;
  travelerId: string;
  seatNumber: string;
  price: number;
  currency: string;
}

// --- Hotel Types ---

export interface HotelSearchRequest {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
}

export interface HotelOffer {
  id: string; // The offer ID required for booking
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  room: {
    type: string;
    typeEstimated?: { category?: string; beds?: number; bedType?: string };
    description?: { text: string };
  };
  guests: { adults: number };
  price: {
    currency: string;
    total: string;
    variations?: { average?: { base: string } };
  };
}

export interface Hotel {
  hotelId: string;
  name: string;
  cityCode: string;
  latitude?: number;
  longitude?: number;
  offers: HotelOffer[];
}

export interface PaymentCard {
  vendorCode: 'VI' | 'CA' | 'MC' | 'AX'; // Visa, Mastercard, Amex
  cardNumber: string;
  expiryDate: string; // YYYY-MM
  holderName: string;
}

export interface HotelBookingConfirmation {
  id: string;
  providerConfirmationId: string;
  hotelName?: string; // Enhanced manually
  checkIn?: string;
  checkOut?: string;
  bookingTime: string;
}
