import React from 'react';
import OnboardingWizard from './components/OnboardingWizard';
import HomeScreen from './components/HomeScreen';
import TripView from './components/TripView';
import PlanTripScreen from './components/PlanTripScreen';
import { TravelContextProvider, useTravelData } from './hooks/useTravelData';

const AppContent: React.FC = () => {
  const { view, isLoading, activeTrip, clearActiveTrip, setView } = useTravelData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary-400)]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-8 w-8 bg-gradient-to-tr from-[var(--primary-400)] to-[var(--primary-600)] rounded-full animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'onboarding':
        return <OnboardingWizard />;
      case 'home':
        return <HomeScreen />;
      case 'planTrip':
        return <PlanTripScreen onBack={() => setView('home')} />;
      case 'trip':
        if (activeTrip) {
          return <TripView trip={activeTrip} onBackToHome={clearActiveTrip} />;
        }
        // Fallback to home if no active trip
        return <HomeScreen />; 
      default:
        return <HomeScreen />;
    }
  };

  return (
     <div className="h-screen w-screen flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-[430px] h-full md:max-h-[900px] md:rounded-[40px] glass-strong flex flex-col overflow-hidden animate-scale-in shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[var(--primary-900)]/5 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col h-full">
            {renderView()}
          </div>
        </div>
      </div>
  )
};

const App: React.FC = () => {
  return (
    <TravelContextProvider>
      <AppContent />
    </TravelContextProvider>
  );
}

export default App;