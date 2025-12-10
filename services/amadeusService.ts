
import type { Flight, Passenger, BookingConfirmation, Airport, SearchParams, Itinerary, Segment, BaggageAllowance, SeatMap, Hotel, HotelSearchRequest, PaymentCard, HotelBookingConfirmation } from '../types';

export type AmadeusEnv = 'TEST' | 'PROD';

const CONFIG = {
  TEST: {
    clientId: 'OfgOROMUTgDNUCUIxZPmGiXs7iUIJgRd',
    clientSecret: 'nDQ1jOW1K4XmzeEK',
    baseUrl: 'https://test.api.amadeus.com'
  },
  PROD: {
    clientId: 'tN8NORJ3bUHpOUIvzs9msJHnS6NoBK0z',
    clientSecret: 'Wop7KcRdSFE1duVz',
    baseUrl: 'https://api.amadeus.com'
  }
};

let currentEnv: AmadeusEnv = 'TEST';

// In-memory cache for the Amadeus API token
let amadeusToken = {
  value: null as string | null,
  expiresAt: 0,
};

// Recommended airports including extensive Gulf region lists and major global hubs
const RECOMMENDED_LOCATIONS: Airport[] = [
  // --- Saudi Arabia (KSA) ---
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh' },
  { code: 'DMM', name: 'King Fahd International Airport', city: 'Dammam' },
  { code: 'MED', name: 'Prince Mohammad Bin Abdulaziz International Airport', city: 'Madinah' },
  { code: 'TIF', name: 'Taif International Airport', city: 'Taif' },
  { code: 'ELQ', name: 'Prince Naif Bin Abdulaziz International Airport', city: 'Gassim' },
  { code: 'AHB', name: 'Abha International Airport', city: 'Abha' },
  { code: 'GIZ', name: 'King Abdullah Bin Abdulaziz Airport', city: 'Jazan' },
  { code: 'TUU', name: 'Prince Sultan Bin Abdulaziz Airport', city: 'Tabuk' },
  { code: 'HOF', name: 'Al-Ahsa International Airport', city: 'Al-Hofuf' },
  { code: 'YNB', name: 'Prince Abdul Mohsin Bin Abdulaziz Airport', city: 'Yanbu' },
  { code: 'HAS', name: 'Hail International Airport', city: 'Hail' },
  { code: 'AJF', name: 'Al Jouf Airport', city: 'Al-Jawf' },
  { code: 'EAM', name: 'Najran Airport', city: 'Najran' },
  { code: 'BHH', name: 'Bisha Airport', city: 'Bisha' },
  { code: 'WAE', name: 'Wadi al-Dawasir Airport', city: 'Wadi al-Dawasir' },
  { code: 'RAE', name: 'Arar Airport', city: 'Arar' },
  { code: 'URY', name: 'Gurayat Domestic Airport', city: 'Gurayat' },
  { code: 'TUI', name: 'Turaif Domestic Airport', city: 'Turaif' },
  { code: 'AQI', name: 'Al Qaisumah/Hafr Al Batin Airport', city: 'Al Qaisumah' },
  { code: 'EJH', name: 'Al Wajh Domestic Airport', city: 'Al Wajh' },
  { code: 'DWD', name: 'Dawadmi Airport', city: 'Dawadmi' },
  { code: 'RAF', name: 'Rafha Domestic Airport', city: 'Rafha' },
  { code: 'SHW', name: 'Sharurah Domestic Airport', city: 'Sharurah' },

  // --- United Arab Emirates (UAE) ---
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi' },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah' },
  { code: 'DWC', name: 'Al Maktoum International Airport', city: 'Dubai' },
  { code: 'RKT', name: 'Ras Al Khaimah International Airport', city: 'Ras Al Khaimah' },
  { code: 'AAN', name: 'Al Ain International Airport', city: 'Al Ain' },
  { code: 'FJR', name: 'Fujairah International Airport', city: 'Fujairah' },
  { code: 'AZI', name: 'Al Bateen Executive Airport', city: 'Abu Dhabi' },

  // --- Qatar ---
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha' },

  // --- Kuwait ---
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City' },

  // --- Global Hubs ---
  { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
  { code: 'AMS', name: 'Schiphol Airport', city: 'Amsterdam' },
  { code: 'SYD', name: 'Kingsford Smith Airport', city: 'Sydney' },
];

export const getRecommendedLocations = () => RECOMMENDED_LOCATIONS;

export const setAmadeusEnv = (env: AmadeusEnv) => {
    if (currentEnv !== env) {
        currentEnv = env;
        // Clear cached token when switching environments
        amadeusToken = { value: null, expiresAt: 0 };
        console.log(`Switched to ${env} environment`);
    }
};

export const getAmadeusEnv = () => currentEnv;

/**
 * Fetches a new Amadeus API access token if the current one is invalid or expired.
 */
const getAccessToken = async (): Promise<string> => {
  if (amadeusToken.value && amadeusToken.expiresAt > Date.now()) {
    return amadeusToken.value;
  }

  const { clientId, clientSecret, baseUrl } = CONFIG[currentEnv];

  const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!response.ok) throw new Error(`Failed to authenticate with Amadeus ${currentEnv} API.`);

  const data = await response.json();
  amadeusToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return amadeusToken.value!;
};

/**
 * Parses the duration from ISO 8601 format (e.g., "PT5H30M") to a human-readable string ("5h 30m").
 */
const formatDuration = (isoDuration: string) => {
    if (!isoDuration) return ''; // Gracefully handle missing duration
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return '';
    const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
    const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
}

/**
 * A reusable helper to parse a raw Amadeus flight offer into our app's Flight type.
 */
const parseAmadeusOffer = (offer: any, dictionaries: any): Flight => {
    const carrierDict = dictionaries?.carriers || {};
    const aircraftDict = dictionaries?.aircraft || {};
    
    // We use the first traveler (usually ADULT) to get representative fare details
    const travelerPricing = offer.travelerPricings[0];
    const fareDetailsBySegment = travelerPricing?.fareDetailsBySegment || [];
    const fareDetailsMap = new Map();
    
    fareDetailsBySegment.forEach((detail: any) => {
        fareDetailsMap.set(detail.segmentId, detail);
    });

    const itineraries: Itinerary[] = offer.itineraries.map((itin: any): Itinerary => {
      const segments: Segment[] = itin.segments.map((seg: any): Segment => {
        const fareDetail = fareDetailsMap.get(seg.id);
        
        return {
            id: seg.id,
            departure: { iataCode: seg.departure.iataCode, at: seg.departure.at, terminal: seg.departure.terminal },
            arrival: { iataCode: seg.arrival.iataCode, at: seg.arrival.at, terminal: seg.arrival.terminal },
            carrier: carrierDict[seg.carrierCode] || seg.carrierCode,
            carrierCode: seg.carrierCode,
            flightNumber: `${seg.carrierCode} ${seg.number}`,
            duration: formatDuration(seg.duration),
            aircraft: {
                code: seg.aircraft?.code,
                name: aircraftDict[seg.aircraft?.code] || seg.aircraft?.code || 'Aircraft'
            },
            operatingCarrier: seg.operating?.carrierCode ? (carrierDict[seg.operating.carrierCode] || seg.operating.carrierCode) : undefined,
            cabin: fareDetail?.cabin,
            fareBasis: fareDetail?.fareBasis,
            class: fareDetail?.class,
            includedCheckedBags: fareDetail?.includedCheckedBags,
        };
      });
      return {
        duration: formatDuration(itin.duration),
        segments,
      };
    });

    const validatingAirlineCode = offer.validatingAirlineCodes[0];
    const validatingAirline = carrierDict[validatingAirlineCode] || validatingAirlineCode;

    // Try to guess fare family from fare basis or cabin if not explicit
    const fareFamily = travelerPricing.fareOption || travelerPricing.fareDetailsBySegment[0]?.cabin;

    return {
      id: offer.id,
      itineraries,
      price: parseFloat(offer.price.grandTotal),
      validatingAirline,
      airlineLogoUrl: `https://logo.clearbit.com/${validatingAirline.toLowerCase().replace(/\s/g, '')}.com`,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      amadeusOffer: offer,
      fareFamily: fareFamily
    };
};


/**
 * Searches for flights using the Amadeus Flight Offers Search POST API.
 */
export const searchFlights = async (params: SearchParams): Promise<Flight[]> => {
  const token = await getAccessToken();
  const { baseUrl } = CONFIG[currentEnv];

  const travelers = [];
  for (let i = 0; i < params.adults; i++) {
    travelers.push({ id: (travelers.length + 1).toString(), travelerType: 'ADULT' });
  }
  for (let i = 0; i < params.children; i++) {
    travelers.push({ id: (travelers.length + 1).toString(), travelerType: 'CHILD' });
  }

  const originDestinations = [{
    id: '1',
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDateTimeRange: { date: params.departureDate }
  }];

  if (params.returnDate) {
    originDestinations.push({
      id: '2',
      originLocationCode: params.destination,
      destinationLocationCode: params.origin,
      departureDateTimeRange: { date: params.returnDate }
    });
  }

  const searchBody = {
    currencyCode: 'USD',
    originDestinations,
    travelers,
    sources: ['GDS'],
    searchCriteria: { maxFlightOffers: 25 }
  };

  const response = await fetch(`${baseUrl}/v2/shopping/flight-offers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.errors?.[0]?.detail || errorData.errors?.[0]?.title || `API Error: ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (!data.data || data.data.length === 0) {
    return [];
  }
  
  return data.data.map((offer: any) => parseAmadeusOffer(offer, data.dictionaries));
};

/**
 * Re-prices a flight offer to confirm availability and the final price before booking.
 */
export const priceFlightOffer = async (flight: Flight): Promise<Flight> => {
    const token = await getAccessToken();
    const { baseUrl } = CONFIG[currentEnv];

    const pricingPayload = {
        data: {
            type: 'flight-offers-pricing',
            flightOffers: [flight.amadeusOffer],
        },
    };

    const response = await fetch(`${baseUrl}/v1/shopping/flight-offers/pricing`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingPayload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.errors?.[0]?.detail || errorData.errors?.[0]?.title || `API Error: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    const pricingData = await response.json();
    const pricedOffer = pricingData.data.flightOffers[0];
    const dictionaries = pricingData.dictionaries;
    
    // Use the same parser to create a new Flight object.
    return parseAmadeusOffer(pricedOffer, dictionaries);
}

/**
 * Fetches branded fares (upsell options) for a given flight offer.
 */
export const getFlightUpsells = async (flight: Flight): Promise<Flight[]> => {
    const token = await getAccessToken();
    const { baseUrl } = CONFIG[currentEnv];

    const payload = {
        data: {
            type: 'flight-offers-upselling',
            flightOffers: [flight.amadeusOffer]
        }
    };

    const response = await fetch(`${baseUrl}/v1/shopping/flight-offers/upselling`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.warn('Upselling API warning:', response.status);
        return [];
    }

    const data = await response.json();
    if (!data.data || !data.data.flightOffers) return [];

    return data.data.flightOffers.map((offer: any) => parseAmadeusOffer(offer, data.dictionaries));
};

/**
 * Fetches seat maps for a given flight offer.
 */
export const getSeatMap = async (flight: Flight): Promise<SeatMap[]> => {
    const token = await getAccessToken();
    const { baseUrl } = CONFIG[currentEnv];

    const payload = {
        data: [flight.amadeusOffer]
    };

    const response = await fetch(`${baseUrl}/v1/shopping/seatmaps`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.warn('SeatMap API warning:', response.status);
        return [];
    }

    const data = await response.json();
    return data.data || [];
};


/**
 * Books a flight using the Amadeus Flight Create Orders API.
 */
export const bookFlight = async (flight: Flight, passengers: Passenger[]): Promise<BookingConfirmation> => {
  const token = await getAccessToken();
  const { baseUrl } = CONFIG[currentEnv];

  const travelers = passengers.map(p => {
    // Sanitize phone number: Remove all non-digit characters. 
    // Amadeus API often returns SYSTEM ERROR for malformed phone numbers (e.g. containing spaces, dashes, or missing country code).
    const rawCountryCode = p.contact.phone.countryCallingCode.replace(/\D/g, '');
    // Default to '1' (US) if country code is somehow empty/invalid to prevent rejection
    const countryCallingCode = rawCountryCode.length > 0 ? rawCountryCode : '1'; 
    const rawNumber = p.contact.phone.number.replace(/\D/g, '');

    const sanitizedPhone = {
        deviceType: 'MOBILE',
        countryCallingCode: countryCallingCode,
        number: rawNumber,
    };

    return {
        id: p.id,
        dateOfBirth: p.dateOfBirth,
        name: {
          // Names must be alpha-only (A-Z). Remove spaces/hyphens for legacy GDS compatibility.
          firstName: p.firstName.toUpperCase().replace(/[^A-Z]/g, ''),
          lastName: p.lastName.toUpperCase().replace(/[^A-Z]/g, ''),
        },
        gender: p.gender, 
        contact: {
          emailAddress: p.contact.emailAddress,
          phones: [sanitizedPhone],
        },
        documents: [{
          ...p.document,
          holder: true
        }],
    };
  });

  const bookingPayload = {
    data: {
      type: 'flight-order',
      flightOffers: [flight.amadeusOffer],
      travelers,
    },
  };
  
  const response = await fetch(`${baseUrl}/v1/booking/flight-orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.errors?.[0]?.detail || errorData.errors?.[0]?.title || `API Error: ${response.status}`;
    // Log full error for debugging "SYSTEM ERROR"
    console.error('Booking failed:', errorData);
    throw new Error(errorMessage);
  }
  
  const confirmationData = await response.json();
  const confirmation = confirmationData.data;

  return {
    pnr: confirmation.associatedRecords[0].reference,
    orderId: confirmation.id,
    flight,
    travelers: confirmation.travelers,
    bookingTime: new Date().toISOString(),
    lastTicketingDate: confirmation.flightOffers[0].lastTicketingDate,
  };
};

/**
 * Searches for airports/cities by keyword.
 */
export const searchAirports = async (keyword: string): Promise<Airport[]> => {
  if (!keyword || keyword.length < 2) return [];
  
  const token = await getAccessToken();
  const { baseUrl } = CONFIG[currentEnv];

  // Using view=LIGHT for faster response and subType=CITY,AIRPORT to find both
  const response = await fetch(`${baseUrl}/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${keyword}&page[limit]=10&view=LIGHT`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
      console.warn('Amadeus Location Search failed', response.status);
      return [];
  }

  const data = await response.json();
  if (!data.data) return [];

  // Map response to our Airport interface
  return data.data.map((item: any) => ({
      code: item.iataCode,
      name: item.name,
      city: item.address?.cityName || item.name
  }));
};

/**
 * HOTEL API INTEGRATION
 */

// Search hotels by city and then fetch offers
export const searchHotels = async (params: HotelSearchRequest): Promise<Hotel[]> => {
  const token = await getAccessToken();
  const { baseUrl } = CONFIG[currentEnv];

  // Step 1: Find hotels in the city
  // Using a simplified request for demonstration. 
  // In a real app, you might want to handle pagination or more precise radius logic if passing coordinates.
  const hotelsUrl = `${baseUrl}/v1/reference-data/locations/hotels/by-city?cityCode=${params.cityCode}&radius=10&radiusUnit=KM&hotelSource=ALL`;
  
  const listResponse = await fetch(hotelsUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!listResponse.ok) {
    const errorText = await listResponse.text();
    console.warn("Hotel List Search failed", listResponse.status, errorText);
    throw new Error(`Failed to find hotels in ${params.cityCode}. API Status: ${listResponse.status}`);
  }

  const listData = await listResponse.json();
  if (!listData.data || listData.data.length === 0) {
    return [];
  }

  // Take the top 15 hotels to find offers for
  const hotels = listData.data.slice(0, 15);
  const hotelIds = hotels.map((h: any) => h.hotelId).join(',');

  // Step 2: Get offers for these hotels
  const offersUrl = `${baseUrl}/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${params.adults}&checkInDate=${params.checkInDate}&checkOutDate=${params.checkOutDate}&roomQuantity=1&paymentPolicy=NONE&bestRateOnly=true`;

  const offersResponse = await fetch(offersUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!offersResponse.ok) {
    console.warn("Hotel Offers Search failed", offersResponse.status);
    return [];
  }

  const offersData = await offersResponse.json();
  if (!offersData.data) return [];

  // Merge the hotel info with offers
  return offersData.data.map((item: any) => ({
    hotelId: item.hotel.hotelId,
    name: item.hotel.name,
    cityCode: item.hotel.cityCode,
    latitude: item.hotel.latitude,
    longitude: item.hotel.longitude,
    offers: item.offers.map((o: any) => ({
      id: o.id,
      checkInDate: o.checkInDate,
      checkOutDate: o.checkOutDate,
      rateCode: o.rateCode,
      room: {
        type: o.room?.typeEstimated?.category || o.room?.type || 'Standard',
        description: o.room?.description?.text
      },
      guests: o.guests,
      price: {
        currency: o.price?.currency,
        total: o.price?.total
      }
    }))
  }));
};

// Book a hotel offer
export const bookHotel = async (offerId: string, guest: Passenger, payment: PaymentCard): Promise<HotelBookingConfirmation> => {
  const token = await getAccessToken();
  const { baseUrl } = CONFIG[currentEnv];

  // Construct payload as per V2 Hotel Orders API
  const bookingPayload = {
    data: {
      type: "hotel-order",
      guests: [
        {
          tid: 1,
          title: guest.gender === 'MALE' ? 'MR' : 'MS',
          firstName: guest.firstName.toUpperCase(),
          lastName: guest.lastName.toUpperCase(),
          phone: `+${guest.contact.phone.countryCallingCode}${guest.contact.phone.number}`,
          email: guest.contact.emailAddress
        }
      ],
      travelAgent: {
        contact: {
          email: guest.contact.emailAddress // Using guest email for simplicity
        }
      },
      roomAssociations: [
        {
          guestReferences: [
            { guestReference: "1" }
          ],
          hotelOfferId: offerId
        }
      ],
      payment: {
        method: "CREDIT_CARD",
        paymentCard: {
            paymentCardInfo: {
                vendorCode: payment.vendorCode,
                cardNumber: payment.cardNumber.replace(/\D/g, ''),
                expiryDate: payment.expiryDate,
                holderName: payment.holderName.toUpperCase()
            }
        }
      }
    }
  };

  const response = await fetch(`${baseUrl}/v2/booking/hotel-orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.errors?.[0]?.detail || errorData.errors?.[0]?.title || `Booking Failed: ${response.status}`;
    console.error('Hotel Booking failed:', errorData);
    throw new Error(errorMessage);
  }

  const confirmationData = await response.json();
  const data = confirmationData.data;

  return {
    id: data.id,
    providerConfirmationId: data.associatedRecords?.[0]?.reference || data.id,
    bookingTime: new Date().toISOString(),
    // Note: The booking response might not echo back the hotel name/dates directly in the top level `data`,
    // so we rely on what we know or extracting from deeper structure if available.
  };
};
