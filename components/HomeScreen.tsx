import React from 'react';
import { useTravelData } from '../hooks/useTravelData';
import type { Trip } from '../types';
import Icon from './Icon';

const TripCard: React.FC<{ trip: Trip; onSelect: () => void }> = ({ trip, onSelect }) => (
  <button onClick={onSelect} className="w-full text-left glass-card p-6 rounded-3xl hover:bg-white/40 transition-all duration-300 group animate-scale-in relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-300)] rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${trip.status === 'in-progress' ? 'bg-[var(--primary-500)] text-white border-transparent shadow-lg shadow-[var(--primary-500)]/30' : 'bg-white/30 text-[var(--primary-800)] border-[var(--surface-border)]'}`}>
          {trip.status.replace('-', ' ')}
        </div>
        <div className="text-[var(--primary-500)] group-hover:translate-x-1 transition-transform">
           <Icon name="arrow-right" className="w-5 h-5" />
        </div>
      </div>
      
      <h3 className="font-bold text-2xl text-[var(--primary-900)] mb-2 leading-tight">{trip.destination}</h3>
      
      <div className="flex items-center text-[var(--primary-700)]/80 text-sm font-medium">
        <Icon name="calendar" className="w-4 h-4 mr-2 opacity-70" />
        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
        {' '}{new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      {trip.isSample && (
        <div className="mt-4 pt-4 border-t border-[var(--surface-border)]">
            <span className="text-xs font-bold text-[var(--primary-600)] flex items-center">
              <Icon name="sparkles" className="w-3 h-3 mr-1" />
              Sample Itinerary
            </span>
        </div>
      )}
    </div>
  </button>
);

const HomeScreen: React.FC = () => {
  const { trips, setActiveTrip, isLoading, setView } = useTravelData();

  const handlePlanNewTrip = () => {
    setView('planTrip');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="pt-8 pb-4 px-8 animate-slide-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[var(--primary-600)] text-sm font-semibold tracking-wide uppercase mb-1">Good Morning</p>
            <h1 className="text-3xl font-bold text-[var(--primary-900)]">Traveler</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary-500)]/30 ring-2 ring-white/50">
            <span className="font-bold text-sm">JD</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-[var(--primary-800)]">My Trips</h2>
             <button className="text-xs font-bold text-[var(--primary-600)] hover:text-[var(--primary-800)] transition-colors">View All</button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-6 space-y-4 overflow-y-auto no-scrollbar">
        {trips.length > 0 ? (
          trips.map((trip, index) => (
            <div key={trip.id} style={{animationDelay: `${index * 0.1}s`}}>
              <TripCard trip={trip} onSelect={() => setActiveTrip(trip.id)} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
                <span className="text-4xl">✈️</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--primary-900)] mb-2">No trips planned</h2>
            <p className="text-[var(--primary-700)]/70 text-sm max-w-[200px]">Start your next adventure by creating a new trip.</p>
          </div>
        )}
      </main>

      <footer className="p-6 animate-slide-in-up">
        <button
          onClick={handlePlanNewTrip}
          disabled={isLoading}
          className="group w-full flex items-center justify-between px-6 py-4 bg-[var(--primary-600)] text-white font-bold rounded-3xl hover:bg-[var(--primary-700)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[var(--primary-600)]/30 hover:shadow-2xl hover:shadow-[var(--primary-600)]/40 hover:-translate-y-1"
        >
          <span className="text-lg">Plan a New Trip</span>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
             {isLoading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
             ) : (
               <Icon name="plus" className="w-6 h-6" />
             )}
          </div>
        </button>
      </footer>
    </div>
  );
};

export default HomeScreen;