import React, { useState } from 'react';
import { useTravelData } from '../hooks/useTravelData';
import type { Activity } from '../types';
import Icon from './Icon';

// Bounding box for the static Paris map image
const MAP_BOUNDS = {
  latMin: 48.815, // South
  latMax: 48.902, // North
  lngMin: 2.224,  // West
  lngMax: 2.469,  // East
};

// Map image URL (a generic, royalty-free map of Paris)
const MAP_IMAGE_URL = 'https://i.imgur.com/bK5E5t0.png';

const normalize = (value: number, min: number, max: number) => {
  return (value - min) / (max - min);
};

const ActivityPin: React.FC<{ activity: Activity; isSelected: boolean; onSelect: () => void }> = ({ activity, isSelected, onSelect }) => {
  const top = (1 - normalize(activity.location.lat, MAP_BOUNDS.latMin, MAP_BOUNDS.latMax)) * 100;
  const left = normalize(activity.location.lng, MAP_BOUNDS.lngMin, MAP_BOUNDS.lngMax) * 100;
  
  if (top < 0 || top > 100 || left < 0 || left > 100) {
    return null; // Don't render pins outside the map bounds
  }

  return (
    <button
      onClick={onSelect}
      className="absolute transform -translate-x-1/2 -translate-y-full focus:outline-none"
      style={{ top: `${top}%`, left: `${left}%`, zIndex: isSelected ? 10 : 1 }}
    >
      <div className={`p-1.5 rounded-full shadow-lg transition-all ${isSelected ? 'bg-blue-600' : 'bg-white'}`}>
        <Icon name={activity.category} className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
      </div>
       <div className={`absolute top-full left-1/2 w-0 h-0 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 transition-colors ${isSelected ? 'border-l-transparent border-r-transparent border-t-blue-600' : 'border-l-transparent border-r-transparent border-t-white'}`}></div>
    </button>
  );
};

const MapScreen: React.FC = () => {
  const { activeTrip } = useTravelData();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  if (!activeTrip || !activeTrip.itinerary) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No Trip Selected</h2>
        <p className="text-gray-500 mt-2">Select a trip to see the map.</p>
      </div>
    );
  }

  // For this demo, we'll just show Day 2 activities as they are more spread out
  const todayActivities = activeTrip.itinerary.days.find(d => d.dayNumber === 2)?.activities || [];

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="relative flex-1">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${MAP_IMAGE_URL})` }}
        >
          {todayActivities.map(activity => (
            <ActivityPin 
              key={activity.id} 
              activity={activity}
              isSelected={selectedActivity?.id === activity.id}
              onSelect={() => setSelectedActivity(activity)}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-white p-4 border-t shadow-t-lg h-36">
        {selectedActivity ? (
          <div>
            <h3 className="font-bold text-gray-800">{selectedActivity.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedActivity.description}</p>
            <p className="text-xs font-semibold text-gray-500 mt-2">{selectedActivity.startTime} - {selectedActivity.endTime}</p>
          </div>
        ) : (
          <div className="text-center pt-4">
            <p className="text-gray-600 font-semibold">Select a pin to see details</p>
            <p className="text-sm text-gray-500">Showing activities for Day 2</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen;
