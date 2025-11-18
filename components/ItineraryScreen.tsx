
import React, { useState } from 'react';
import { useTravelData } from '../hooks/useTravelData';
import ActivityCard from './ActivityCard';
import AlertBanner from './AlertBanner';
import SkeletonLoader from './SkeletonLoader';
import type { Day } from '../types';

const ItineraryScreen: React.FC = () => {
  const { activeTrip, isLoading } = useTravelData();
  const [activeDay, setActiveDay] = useState(1);

  if (isLoading && !activeTrip?.itinerary) {
    return <SkeletonLoader />;
  }

  if (!activeTrip || !activeTrip.itinerary) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-[var(--primary-900)]">No trip selected!</h2>
        <p className="text-[var(--primary-700)] mt-2">Go to the home screen to select or plan a trip.</p>
      </div>
    );
  }

  const { destination, days } = activeTrip.itinerary;
  const currentDayData = days.find(d => d.dayNumber === activeDay);

  return (
    <div className="min-h-full">
      <AlertBanner />

      <div className="sticky top-0 z-20 bg-gradient-to-b from-[var(--primary-50)]/90 to-[var(--primary-50)]/0 pt-2 pb-4 px-6 backdrop-blur-sm">
        <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
          {days.map((day, index) => (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.dayNumber)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap animate-scale-in shadow-sm ${
                activeDay === day.dayNumber 
                  ? 'bg-[var(--primary-600)] text-white shadow-[var(--primary-600)]/40 shadow-md transform scale-105' 
                  : 'bg-white/50 text-[var(--primary-700)] hover:bg-white hover:shadow-md border border-[var(--surface-border)]'
              }`}
              style={{animationDelay: `${index * 0.05}s`}}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {currentDayData ? (
          <>
            <div className="glass-card p-6 rounded-[24px] border border-white/50 shadow-sm animate-fade-in flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[var(--primary-600)] uppercase tracking-widest mb-1">
                   {new Date(currentDayData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
                <h2 className="text-2xl font-bold text-[var(--primary-900)]">
                  {new Date(currentDayData.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
                </h2>
              </div>
              <div className="text-center bg-[var(--primary-100)]/50 px-4 py-2 rounded-2xl">
                  <span className="block text-xl font-bold text-[var(--primary-700)]">{currentDayData.activities.length}</span>
                  <span className="text-[10px] font-bold text-[var(--primary-600)] uppercase">Activities</span>
              </div>
            </div>
            <div className="space-y-4">
                {currentDayData.activities.map((activity, index) => (
                <div key={activity.id} style={{animationDelay: `${index * 0.1}s`}}>
                    <ActivityCard activity={activity} isFirst={index === 0} />
                </div>
                ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4 animate-float">📅</div>
            <p className="text-lg font-bold text-[var(--primary-800)]">No activities for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryScreen;
