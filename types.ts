

export type Screen = 'itinerary' | 'map' | 'chat' | 'safety' | 'profile';
export type View = 'onboarding' | 'home' | 'trip' | 'planTrip';

export interface UserPreferences {
  budget: 'economy' | 'moderate' | 'luxury';
  activities: string[];
  travelStyle: 'chilled' | 'packed';
  safetyComfort: number; // 1-5 scale
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'museum' | 'tour' | 'outdoor' | 'shopping' | 'nightlife' | 'hidden-gem';
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  costEstimate: number;
}

export interface Day {
  id: string;
  date: string; // "YYYY-MM-DD"
  dayNumber: number;
  activities: Activity[];
}

export interface Itinerary {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: Day[];
}

export interface Trip {
  id:string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in-progress' | 'completed';
  itinerary: Itinerary | null;
  isSample?: boolean;
}

export interface RichCard {
  type: 'restaurant' | 'attraction';
  title: string;
  imageUrl: string;
  rating: number;
  description: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
  type: 'maps' | 'search';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  richCard?: RichCard;
  grounding?: GroundingSource[];
}

export interface Alert {
  id: string;
  tripId: string;
  category: 'itinerary' | 'safety';
  type: 'weather' | 'closure' | 'safety' | 'transit';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedActivityId?: string;
  alternatives?: Activity[];
}

export interface SafetyInfo {
  neighborhood: string;
  score: number; // 1-100
  summary: string;
  recommendation: string;
  emergencyContacts: {
    police: string;
    ambulance: string;
    fire: string;
  };
}

export interface TripInspiration {
  destination: string;
  description: string;
  imageUrl: string;
}