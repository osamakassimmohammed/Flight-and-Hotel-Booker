
import React, { useState, useCallback } from 'react';
import { AppView } from './constants';
import type { Flight, Passenger, BookingConfirmation, SearchParams, SelectedSeat, SeatMap, Hotel, HotelSearchRequest, HotelOffer, PaymentCard, HotelBookingConfirmation } from './types';
import { searchFlights, bookFlight, priceFlightOffer, setAmadeusEnv, AmadeusEnv, getFlightUpsells, getSeatMap, searchHotels, bookHotel } from './services/amadeusService';

import Header from './components/Header';
import SearchForm from './components/SearchForm';
import FlightList from './components/FlightList';
import FlightReview from './components/FlightReview';
import BookingForm from './components/BookingForm';
import Confirmation from './components/Confirmation';
import LoadingSpinner from './components/LoadingSpinner';
import UpsellSelector from './components/UpsellSelector';
import SeatMapVisualizer from './components/SeatMap';
import HotelSearchForm from './components/HotelSearchForm';
import HotelList from './components/HotelList';
import HotelBookingForm from './components/HotelBookingForm';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FLIGHTS' | 'HOTELS'>('FLIGHTS');
  const [view, setView] = useState<AppView>(AppView.SEARCHING);
  
  // Flight State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [upsellOffers, setUpsellOffers] = useState<Flight[]>([]);
  const [seatMaps, setSeatMaps] = useState<SeatMap[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);

  // Hotel State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<HotelOffer | null>(null);
  const [hotelConfirmation, setHotelConfirmation] = useState<HotelBookingConfirmation | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [env, setEnv] = useState<AmadeusEnv>('TEST');

  const handleEnvChange = (newEnv: AmadeusEnv) => {
    setEnv(newEnv);
    setAmadeusEnv(newEnv);
    resetAll();
  };
  
  const handleTabChange = (tab: 'FLIGHTS' | 'HOTELS') => {
      setActiveTab(tab);
      resetAll();
      setView(tab === 'FLIGHTS' ? AppView.SEARCHING : AppView.HOTEL_SEARCH);
  };

  const resetAll = () => {
      setFlights([]);
      setSelectedFlight(null);
      setBookingConfirmation(null);
      setHotels([]);
      setSelectedHotel(null);
      setSelectedOffer(null);
      setHotelConfirmation(null);
      setError(null);
      setView(activeTab === 'FLIGHTS' ? AppView.SEARCHING : AppView.HOTEL_SEARCH);
  };

  // --- Flight Handlers ---

  const handleSearch = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setLoadingMessage('Searching for flights...');
    setError(null);
    setPassengerCount(params.adults + params.children);
    try {
      const results = await searchFlights(params);
      setFlights(results);
      setView(AppView.VIEWING_FLIGHTS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectFlight = useCallback(async (flight: Flight) => {
    setIsLoading(true);
    setLoadingMessage('Checking for upgrade options...');
    setError(null);
    try {
      const upsells = await getFlightUpsells(flight);
      setSelectedFlight(flight);
      
      if (upsells.length > 0) {
        setUpsellOffers(upsells);
        setView(AppView.UPSELL);
      } else {
         handleUpsellSelection(flight);
      }
    } catch (err) {
      console.warn('Upsell check failed, proceeding', err);
      setSelectedFlight(flight);
      handleUpsellSelection(flight);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleUpsellSelection = async (flight: Flight) => {
      setSelectedFlight(flight);
      setIsLoading(true);
      setLoadingMessage('Loading seat map...');
      setError(null);

      try {
          const maps = await getSeatMap(flight);
          setSeatMaps(maps);
          if (maps.length > 0) {
              setView(AppView.SEAT_SELECTION);
          } else {
              confirmFlightPrice(flight);
          }
      } catch (err) {
          console.warn('Seatmap fetch failed', err);
          confirmFlightPrice(flight);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSeatConfirmation = (seats: SelectedSeat[]) => {
      setSelectedSeats(seats);
      if (selectedFlight) {
          confirmFlightPrice(selectedFlight);
      }
  };

  const confirmFlightPrice = async (flight: Flight) => {
    setIsLoading(true);
    setLoadingMessage('Verifying price and availability...');
    setError(null);
    try {
      const pricedFlight = await priceFlightOffer(flight);
      pricedFlight.originalPrice = flight.price;
      setSelectedFlight(pricedFlight);
      setView(AppView.REVIEWING);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify flight price.');
      setView(AppView.VIEWING_FLIGHTS);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProceedToBooking = useCallback(() => {
    setView(AppView.BOOKING);
  }, []);

  const handleBooking = useCallback(async (passengers: Passenger[]) => {
    if (!selectedFlight) return;
    setIsLoading(true);
    setLoadingMessage('Confirming your booking...');
    setError(null);
    try {
      const confirmation = await bookFlight(selectedFlight, passengers);
      setBookingConfirmation(confirmation);
      setView(AppView.CONFIRMED);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book flight.');
      setView(AppView.BOOKING);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlight]);

  // --- Hotel Handlers ---

  const handleHotelSearch = async (params: HotelSearchRequest) => {
      setIsLoading(true);
      setLoadingMessage('Finding hotels...');
      setError(null);
      try {
          const results = await searchHotels(params);
          setHotels(results);
          setView(AppView.HOTEL_LIST);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to find hotels.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleSelectHotelOffer = (hotel: Hotel, offer: HotelOffer) => {
      setSelectedHotel(hotel);
      setSelectedOffer(offer);
      setView(AppView.HOTEL_BOOKING);
  };

  const handleHotelBooking = async (guest: Passenger, payment: PaymentCard) => {
      if (!selectedOffer) return;
      setIsLoading(true);
      setLoadingMessage('Processing hotel booking...');
      setError(null);
      try {
          const conf = await bookHotel(selectedOffer.id, guest, payment);
          // Manually attach info for display since API response is minimal
          setHotelConfirmation({
              ...conf,
              hotelName: selectedHotel?.name,
              checkIn: selectedOffer.checkInDate,
              checkOut: selectedOffer.checkOutDate
          });
          setView(AppView.HOTEL_CONFIRMED);
      } catch (err) {
           setError(err instanceof Error ? err.message : 'Hotel booking failed.');
      } finally {
           setIsLoading(false);
      }
  };


  // --- Render Logic ---

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><LoadingSpinner message={loadingMessage} /></div>;
    }
    
    if (error) {
       return (
         <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <div className="mt-4">
                 <button onClick={resetAll} className="text-sm font-semibold underline">Start Over</button>
            </div>
         </div>
       );
    }

    switch (view) {
      // Flights
      case AppView.SEARCHING:
        return <SearchForm onSearch={handleSearch} />;
      case AppView.VIEWING_FLIGHTS:
        return <FlightList flights={flights} onSelectFlight={handleSelectFlight} onBack={resetAll} />;
      case AppView.UPSELL:
        if (!selectedFlight) return null;
        return <UpsellSelector originalFlight={selectedFlight} upsellOffers={upsellOffers} onSelectOffer={handleUpsellSelection} onSkip={() => handleUpsellSelection(selectedFlight)}/>;
      case AppView.SEAT_SELECTION:
        if (!selectedFlight) return null;
        return <SeatMapVisualizer flight={selectedFlight} seatMaps={seatMaps} passengers={passengerCount} onConfirm={handleSeatConfirmation} onBack={() => setView(AppView.VIEWING_FLIGHTS)}/>;
      case AppView.REVIEWING:
        if (!selectedFlight) return null;
        return <FlightReview flight={selectedFlight} selectedSeats={selectedSeats} onConfirm={handleProceedToBooking} onBack={() => setView(AppView.VIEWING_FLIGHTS)} />;
      case AppView.BOOKING:
        if (!selectedFlight) return null;
        return <BookingForm flight={selectedFlight} onBook={handleBooking} onBack={() => setView(AppView.REVIEWING)}/>;
      case AppView.CONFIRMED:
        if (!bookingConfirmation) return null;
        return <Confirmation confirmation={bookingConfirmation} onNewSearch={resetAll} />;
      
      // Hotels
      case AppView.HOTEL_SEARCH:
          return <HotelSearchForm onSearch={handleHotelSearch} />;
      case AppView.HOTEL_LIST:
          return <HotelList hotels={hotels} onSelectOffer={handleSelectHotelOffer} onBack={resetAll} />;
      case AppView.HOTEL_BOOKING:
          if (!selectedHotel || !selectedOffer) return null;
          return <HotelBookingForm hotel={selectedHotel} offer={selectedOffer} onBook={handleHotelBooking} onBack={() => setView(AppView.HOTEL_LIST)} />;
      case AppView.HOTEL_CONFIRMED:
          if (!hotelConfirmation) return null;
          return (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                  <h2 className="text-2xl font-bold text-slate-800">Hotel Booking Confirmed!</h2>
                  <div className="mt-6 border border-slate-200 rounded p-4 text-left">
                      <p><span className="font-semibold">Hotel:</span> {hotelConfirmation.hotelName}</p>
                      <p><span className="font-semibold">Booking Reference:</span> {hotelConfirmation.providerConfirmationId}</p>
                      <p><span className="font-semibold">Order ID:</span> {hotelConfirmation.id}</p>
                      <div className="flex gap-4 mt-2 text-sm text-slate-500">
                          <span>Check-in: {hotelConfirmation.checkIn}</span>
                          <span>Check-out: {hotelConfirmation.checkOut}</span>
                      </div>
                  </div>
                  <button onClick={resetAll} className="mt-6 bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700">Done</button>
              </div>
          );

      default:
        return activeTab === 'FLIGHTS' ? <SearchForm onSearch={handleSearch} /> : <HotelSearchForm onSearch={handleHotelSearch} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header currentEnv={env} onEnvChange={handleEnvChange} activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Powered by Amadeus for Developers API</p>
      </footer>
    </div>
  );
};

export default App;
