
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { UserPreferences, Trip, Alert, Message, Activity, Itinerary, RichCard, View } from '../types';
import { geminiService } from '../services/geminiService';

const SAMPLE_TRIP: Trip = {
  id: 'trip-paris-sample',
  destination: 'Paris, France',
  startDate: '2024-08-10',
  endDate: '2024-08-12',
  status: 'in-progress',
  isSample: true,
  itinerary: {
    id: 'trip-paris-1',
    destination: 'Paris, France',
    startDate: '2024-08-10',
    endDate: '2024-08-12',
    days: [
       {
        id: 'day-1',
        date: '2024-08-10',
        dayNumber: 1,
        activities: [
          { id: 'act-1', title: 'Arrival & Check-in', description: 'Arrive at CDG, take RER B to city center, check into hotel in Le Marais.', category: 'hidden-gem', startTime: '14:00', endTime: '16:00', location: { lat: 48.8566, lng: 2.3522, address: 'Le Marais, Paris' }, costEstimate: 30 },
          { id: 'act-2', title: 'Louvre Museum', description: 'Explore iconic art including the Mona Lisa. Pre-book tickets to avoid long queues.', category: 'museum', startTime: '16:30', endTime: '19:00', location: { lat: 48.8606, lng: 2.3376, address: 'Rue de Rivoli, 75001 Paris' }, costEstimate: 22 },
          { id: 'act-3', title: 'Dinner at Le Bouillon Chartier', description: 'Experience classic French cuisine in a historic, bustling setting.', category: 'food', startTime: '20:00', endTime: '21:30', location: { lat: 48.872, lng: 2.344, address: '7 Rue du Faubourg Montmartre, 75009 Paris' }, costEstimate: 25 },
        ],
      },
      {
        id: 'day-2',
        date: '2024-08-11',
        dayNumber: 2,
        activities: [
          { id: 'act-4', title: 'Eiffel Tower', description: 'Visit the iconic landmark. Go early to beat the crowds. Consider climbing the stairs for a unique experience.', category: 'tour', startTime: '09:00', endTime: '11:00', location: { lat: 48.8584, lng: 2.2945, address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris' }, costEstimate: 28 },
          { id: 'act-5', title: 'Seine River Cruise', description: 'A relaxing boat tour offering unique views of Paris landmarks from the water.', category: 'tour', startTime: '11:30', endTime: '12:30', location: { lat: 48.8627, lng: 2.2876, address: 'Port de la Bourdonnais, 75007 Paris' }, costEstimate: 18 },
          { id: 'act-6', 'title': 'Montmartre & Sacré-Cœur', description: 'Explore the charming, artistic neighborhood and enjoy panoramic city views from the basilica.', category: 'outdoor', startTime: '14:00', endTime: '17:00', location: { lat: 48.8867, lng: 2.3431, address: 'Montmartre, 75018 Paris' }, costEstimate: 5 },
          { id: 'act-7', title: 'Dinner in Montmartre', description: 'Dine at a cozy bistro in the artistic heart of Paris.', category: 'food', startTime: '19:00', endTime: '20:30', location: { lat: 48.8872, lng: 2.3411, address: 'Place du Tertre, 75018 Paris' }, costEstimate: 40 },
        ],
      },
       {
        id: 'day-3',
        date: '2024-08-12',
        dayNumber: 3,
        activities: [
          { id: 'act-8', title: 'Musée d\'Orsay', description: 'Admire the world\'s largest collection of Impressionist and Post-Impressionist masterpieces in a stunning former railway station.', category: 'museum', startTime: '10:00', endTime: '12:30', location: { lat: 48.8600, lng: 2.3266, address: '1 Rue de la Légion d\'Honneur, 75007 Paris' }, costEstimate: 16 },
          { id: 'act-9', title: 'Shopping on Champs-Élysées', description: 'Stroll down the famous avenue, window shopping at luxury stores and ending at the Arc de Triomphe.', category: 'shopping', startTime: '14:00', endTime: '16:00', location: { lat: 48.8695, lng: 2.3075, address: 'Avenue des Champs-Élysées, 75008 Paris' }, costEstimate: 0 },
          { id: 'act-10', title: 'Departure', description: 'Head back to CDG for your flight home.', category: 'hidden-gem', startTime: '17:00', endTime: '18:00', location: { lat: 49.0097, lng: 2.5479, address: 'Charles de Gaulle Airport' }, costEstimate: 12 },
        ],
      }
    ],
  },
};

interface TravelContextState {
  preferences: UserPreferences | null;
  trips: Trip[];
  activeTrip: Trip | null;
  alerts: Alert[];
  messages: Message[];
  isLoading: boolean;
  view: View;
  setView: (view: View) => void;
  setPreferences: (prefs: UserPreferences) => void;
  planTrip: (destination: string, dates: { from: string, to: string }) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  handleDisruption: (alertId: string) => Promise<void>;
  acceptAlternative: (alertId: string, alternative: Activity) => void;
  clearAlert: (alertId: string) => void;
  addActivityFromRichCard: (card: RichCard) => void;
  setActiveTrip: (tripId: string | null) => void;
  clearActiveTrip: () => void;
}

const TravelContext = createContext<TravelContextState | undefined>(undefined);

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  return [state, setState];
};


export const TravelContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = usePersistentState<UserPreferences | null>('travel-prefs', null);
  const [trips, setTrips] = usePersistentState<Trip[]>('travel-trips', [SAMPLE_TRIP]);
  const [activeTripId, setActiveTripId] = usePersistentState<string | null>('travel-active-trip', null);
  const [messagesByTrip, setMessagesByTrip] = usePersistentState<Record<string, Message[]>>('travel-messages', {});
  const [alertsByTrip, setAlertsByTrip] = usePersistentState<Record<string, Alert[]>>('travel-alerts', {});
  const [view, setView] = useState<View>('onboarding');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  const activeTrip = trips.find(t => t.id === activeTripId) || null;
  const messages = activeTrip ? messagesByTrip[activeTrip.id] || [] : [];
  const alerts = activeTrip ? alertsByTrip[activeTrip.id] || [] : [];
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Could not get user location:", error.message);
      }
    );
  }, []);

  useEffect(() => {
    if (preferences) {
      setView(activeTripId ? 'trip' : 'home');
    } else {
      setView('onboarding');
    }
    setIsLoading(false);
  }, [preferences, activeTripId]);

  const setActiveTrip = (tripId: string | null) => {
    setActiveTripId(tripId);
    if(tripId) setView('trip');
  };

  const clearActiveTrip = () => {
    setActiveTripId(null);
    setView('home');
  }

  const planTrip = useCallback(async (destination: string, dates: { from: string, to: string }) => {
    if (!preferences) return;
    setIsLoading(true);
    try {
      const itinerary = await geminiService.generateItinerary(destination, dates, preferences);
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        destination: itinerary.destination,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        status: 'in-progress',
        itinerary,
      };
      setTrips(prev => [...prev, newTrip]);
      setActiveTripId(newTrip.id);
      
      setTimeout(() => {
        const itineraryAlert: Alert = {
          id: `alert-itinerary-${Date.now()}`,
          tripId: newTrip.id,
          category: 'itinerary',
          type: 'closure',
          severity: 'high',
          message: 'Your 4:30 PM museum visit is affected by a local strike. Here are some alternatives.',
          affectedActivityId: 'act-2'
        };
        const safetyAlert: Alert = {
          id: `alert-safety-${Date.now()}`,
          tripId: newTrip.id,
          category: 'safety',
          type: 'transit',
          severity: 'medium',
          message: 'Public transport strike announced for tomorrow. Plan for delays.',
        }
        setAlertsByTrip(prev => ({ ...prev, [newTrip.id]: [itineraryAlert, safetyAlert] }));
      }, 5000);

    } catch (error) {
      console.error("Failed to plan trip:", error);
    } finally {
      setIsLoading(false);
    }
  }, [preferences, setTrips]);

  const sendMessage = async (text: string) => {
    if (!activeTrip) return;

    const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', content: text };
    const currentMessages = messagesByTrip[activeTrip.id] || [];
    const newMessages = [...currentMessages, userMessage];
    setMessagesByTrip(prev => ({...prev, [activeTrip.id]: newMessages}));
    setIsLoading(true);
    
    try {
      const assistantMessage = await geminiService.getChatResponse(newMessages, userLocation);
      setMessagesByTrip(prev => ({...prev, [activeTrip.id]: [...newMessages, assistantMessage]}));
    } catch (error) {
      console.error("Failed to get chat response:", error);
      const errorMessage: Message = { id: `msg-err-${Date.now()}`, role: 'assistant', content: "Sorry, I couldn't process that. Please try again." };
      setMessagesByTrip(prev => ({...prev, [activeTrip.id]: [...newMessages, errorMessage]}));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisruption = useCallback(async (alertId: string) => {
    if (!activeTrip) return;
    const alert = alerts.find(a => a.id === alertId);
    if (!alert || !activeTrip.itinerary) return;

    const affectedActivity = activeTrip.itinerary.days
      .flatMap(d => d.activities)
      .find(a => a.id === alert.affectedActivityId);

    if (affectedActivity) {
      setIsLoading(true);
      const alternatives = await geminiService.getItineraryAlternatives(affectedActivity, userLocation);
      setAlertsByTrip(prev => {
        const tripAlerts = prev[activeTrip.id] || [];
        return {
          ...prev,
          [activeTrip.id]: tripAlerts.map(a => a.id === alertId ? { ...a, alternatives } : a)
        }
      });
      setIsLoading(false);
    }
  }, [alerts, activeTrip, setAlertsByTrip, userLocation]);

  const acceptAlternative = (alertId: string, alternative: Activity) => {
    if (!activeTrip || !activeTrip.itinerary) return;

    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const newItinerary: Itinerary = JSON.parse(JSON.stringify(activeTrip.itinerary));
    let activityReplaced = false;

    for (const day of newItinerary.days) {
      const activityIndex = day.activities.findIndex(a => a.id === alert.affectedActivityId);
      if (activityIndex !== -1) {
        day.activities[activityIndex] = { ...alternative, id: alert.affectedActivityId || alternative.id };
        activityReplaced = true;
        break;
      }
    }
    
    if (activityReplaced) {
      setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, itinerary: newItinerary } : t));
      clearAlert(alertId);
    }
  };

  const clearAlert = (alertId: string) => {
     if (!activeTrip) return;
     setAlertsByTrip(prev => {
       const tripAlerts = prev[activeTrip.id] || [];
       return {
        ...prev,
        [activeTrip.id]: tripAlerts.filter(a => a.id !== alertId)
       }
     });
  };

  const addActivityFromRichCard = (card: RichCard) => {
    if (!activeTrip || !activeTrip.itinerary) return;

    const lastDayIndex = activeTrip.itinerary.days.length - 1;
    if (lastDayIndex < 0) return;

    const lastDay = activeTrip.itinerary.days[lastDayIndex];
    const lastActivity = lastDay.activities[lastDay.activities.length - 1];

    let newStartTime = "21:00"; 
    if (lastActivity) {
        const [hours, minutes] = lastActivity.endTime.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes, 0, 0);
        endDate.setMinutes(endDate.getMinutes() + 15); 
        newStartTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    }

    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const newStartDate = new Date();
    newStartDate.setHours(startHours, startMinutes, 0, 0);
    newStartDate.setMinutes(newStartDate.getMinutes() + 90); 
    const newEndTime = `${String(newStartDate.getHours()).padStart(2, '0')}:${String(newStartDate.getMinutes()).padStart(2, '0')}`;

    const newActivity: Activity = {
        id: `rc-${Date.now()}`,
        title: card.title,
        description: card.description,
        category: card.type === 'restaurant' ? 'food' : 'tour',
        startTime: newStartTime,
        endTime: newEndTime,
        location: { lat: 48.8566, lng: 2.3522, address: 'Added from chat' },
        costEstimate: card.type === 'restaurant' ? 40 : 20,
    };

    const newTrip = JSON.parse(JSON.stringify(activeTrip));
    newTrip.itinerary.days[lastDayIndex].activities.push(newActivity);
    setTrips(prev => prev.map(t => t.id === activeTrip.id ? newTrip : t));

    const confirmationMessage: Message = {
        id: `msg-confirm-${Date.now()}`,
        role: 'assistant',
        content: `Great! I've added "${card.title}" to your itinerary for Day ${lastDay.dayNumber}.`
    };
    setMessagesByTrip(prev => ({...prev, [activeTrip.id]: [...messages, confirmationMessage]}));
  };

  const value = {
    preferences,
    trips,
    activeTrip,
    alerts,
    messages,
    isLoading,
    view,
    setView,
    setPreferences,
    planTrip,
    sendMessage,
    handleDisruption,
    acceptAlternative,
    clearAlert,
    addActivityFromRichCard,
    setActiveTrip,
    clearActiveTrip,
  };

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravelData = (): TravelContextState => {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravelData must be used within a TravelContextProvider');
  }
  return context;
};
