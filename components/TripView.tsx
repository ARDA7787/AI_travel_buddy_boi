
import React, { useState } from 'react';
import ItineraryScreen from './ItineraryScreen';
import ChatScreen from './ChatScreen';
import SafetyScreen from './SafetyScreen';
import ProfileScreen from './ProfileScreen';
import MapScreen from './MapScreen';
import BottomNav from './BottomNav';
import Icon from './Icon';
import type { Screen, Trip } from '../types';

interface TripViewProps {
  trip: Trip;
  onBackToHome: () => void;
}

const TripView: React.FC<TripViewProps> = ({ trip, onBackToHome }) => {
  const [activeScreen, setActiveScreen] = useState<Screen>('itinerary');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'itinerary':
        return <ItineraryScreen />;
      case 'map':
        return <MapScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'safety':
        return <SafetyScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <ItineraryScreen />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeScreen) {
      case 'itinerary':
        return trip.destination.split(',')[0];
      case 'map':
        return `Map of ${trip.destination.split(',')[0]}`;
      case 'chat':
        return 'AI Assistant';
      case 'safety':
        return 'Safety Center';
      case 'profile':
        return 'Your Profile';
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="pt-8 pb-4 px-6 flex items-center animate-slide-in-up relative z-20">
        <button 
          onClick={onBackToHome} 
          className="mr-4 p-3 bg-white/20 rounded-full text-[var(--primary-700)] hover:bg-white/40 hover:text-[var(--primary-900)] transition-all backdrop-blur-md shadow-sm"
        >
            <Icon name="arrow-left" className="w-5 h-5" />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-[var(--primary-900)] capitalize">{getHeaderTitle()}</h1>
            {activeScreen === 'itinerary' && <p className="text-sm text-[var(--primary-700)]/80 font-medium">Your personalized trip 🌟</p>}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative z-10">
        {renderScreen()}
      </main>
      <div className="absolute bottom-0 left-0 right-0 z-30">
         <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
};

export default TripView;
