import OpenAI from 'openai';
import type { UserPreferences, Itinerary, Message, SafetyInfo, Activity, Day, RichCard, TripInspiration } from '../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const FALLBACK_ITINERARY_DATA: Itinerary = {
  id: 'trip-paris-fallback',
  destination: 'Paris, France',
  startDate: '2024-08-10',
  endDate: '2024-08-12',
  days: [
    { id: 'day-1', date: '2024-08-10', dayNumber: 1, activities: [ { id: 'act-1', title: 'Arrival & Check-in', description: 'Arrive at CDG, take RER B to city center, check into hotel in Le Marais.', category: 'hidden-gem', startTime: '14:00', endTime: '16:00', location: { lat: 48.8566, lng: 2.3522, address: 'Le Marais, Paris' }, costEstimate: 30 } ]},
  ],
};

const MOCK_INSPIRATIONS: TripInspiration[] = [
  { destination: 'Kyoto, Japan', description: 'Ancient temples, serene gardens, and vibrant geisha districts.', imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=2070&auto=format&fit=crop' },
  { destination: 'Amalfi Coast, Italy', description: 'Dramatic cliffs, pastel-colored villages, and sparkling blue waters.', imageUrl: 'https://images.unsplash.com/photo-1533105079780-52b9be462077?q=80&w=2070&auto=format&fit=crop' },
  { destination: 'Reykjavik, Iceland', description: 'Stunning natural wonders, from the Northern Lights to volcanic landscapes.', imageUrl: 'https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?q=80&w=2070&auto=format&fit=crop' },
  { destination: 'Medellín, Colombia', description: 'A city of eternal spring, known for its innovation and vibrant culture.', imageUrl: 'https://images.unsplash.com/photo-1588622485547-2479f6a275b2?q=80&w=2070&auto=format&fit=crop' }
];

export const openaiService = {
  generateItinerary: async (destination: string, dates: { from: string, to: string }, preferences: UserPreferences): Promise<Itinerary> => {
    const system = 'You are an expert travel planner. Always return strictly valid JSON as instructed.';
    const user = `Generate a personalized travel itinerary for a trip to ${destination} from ${dates.from} to ${dates.to}.
The traveler's preferences are:
- Budget: ${preferences.budget}
- Interests: ${preferences.activities.join(', ')}
- Pace: ${preferences.travelStyle}

Return a JSON object with keys: destination, startDate, endDate, days (array). Each day has date, dayNumber, activities (array). Each activity has title, description, category (one of food, museum, tour, outdoor, shopping, nightlife, hidden-gem), startTime (HH:mm), endTime (HH:mm), location { lat, lng, address }, costEstimate (number).`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      });
      const text = completion.choices?.[0]?.message?.content?.trim() || '{}';
      const itineraryData = JSON.parse(text);
      const itineraryWithIds: Itinerary = {
        ...itineraryData,
        id: `trip-${Date.now()}`,
        days: itineraryData.days.map((day: Day, dayIndex: number) => ({
          ...day,
          id: `day-${dayIndex + 1}`,
          activities: day.activities.map((activity: Activity, actIndex: number) => ({
            ...activity,
            id: `act-${dayIndex + 1}-${actIndex + 1}`
          }))
        }))
      };
      return itineraryWithIds;
    } catch (error) {
      const fallback = JSON.parse(JSON.stringify(FALLBACK_ITINERARY_DATA));
      fallback.destination = destination;
      fallback.startDate = dates.from;
      fallback.endDate = dates.to;
      return fallback;
    }
  },

  getChatResponse: async (history: Message[], location: { lat: number, lng: number } | null): Promise<Message> => {
    const system = 'You are an AI Travel Buddy. Reply in JSON {"content": string, "richCard": object|null}. richCard has optional keys: title, description, imageUrl, type (restaurant|attraction), websiteUrl, address. Never include code fences.';
    const messages = [
      { role: 'system' as const, content: system },
      ...history.map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content }))
    ];

    const userHint = location ? `User approximate location (lat,lng): ${location.lat}, ${location.lng}. Prefer nearby recommendations.` : '';

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [...messages, { role: 'user', content: userHint }]
      });
      const text = completion.choices?.[0]?.message?.content?.trim() || '{}';
      let parsed: any = {};
      try { parsed = JSON.parse(text); } catch { parsed = { content: text }; }
      const richCard = parsed.richCard && parsed.richCard.title ? {
        type: parsed.richCard.type === 'restaurant' ? 'restaurant' : 'attraction',
        title: parsed.richCard.title,
        imageUrl: parsed.richCard.imageUrl || 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop',
        rating: typeof parsed.richCard.rating === 'number' ? parsed.richCard.rating : 4.6,
        description: parsed.richCard.description || ''
      } as RichCard : undefined;
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: parsed.content || text || 'How can I help you plan your trip?',
        richCard
      };
      return assistantMessage;
    } catch (error) {
      return {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please try again in a moment."
      };
    }
  },

  getItineraryAlternatives: async (disruptedActivity: Activity, location: { lat: number, lng: number } | null): Promise<Activity[]> => {
    const system = 'Return strictly valid JSON with key "alternatives" as an array of activities.';
    const user = `Find 2-3 alternative activities similar to "${disruptedActivity.title}" (${disruptedActivity.category}) near ${disruptedActivity.location.address}. Each has title, description, category (food|museum|tour|outdoor|shopping|nightlife|hidden-gem), location { address }, costEstimate (number).`;
    const loc = location ? `User location: ${location.lat}, ${location.lng}.` : '';

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `${user} ${loc}` }
        ]
      });
      const text = completion.choices?.[0]?.message?.content?.trim() || '{"alternatives": []}';
      const data = JSON.parse(text);
      return (data.alternatives || []).map((alt: any, index: number) => ({
        ...alt,
        id: `alt-${Date.now()}-${index}`,
        startTime: disruptedActivity.startTime,
        endTime: disruptedActivity.endTime,
        location: { ...(alt.location || {}), lat: 0, lng: 0 }
      }));
    } catch (error) {
      await delay(1000);
      return [
        { id: 'alt-1', title: 'Local Museum', description: 'Explore a nearby museum with rich collections.', category: 'museum', startTime: disruptedActivity.startTime, endTime: disruptedActivity.endTime, location: { lat: 0, lng: 0, address: 'City Center' }, costEstimate: 15 },
        { id: 'alt-2', title: 'Riverside Walk', description: 'Scenic walk with views and cafes.', category: 'outdoor', startTime: disruptedActivity.startTime, endTime: disruptedActivity.endTime, location: { lat: 0, lng: 0, address: 'Riverside' }, costEstimate: 0 }
      ];
    }
  },

  getSafetyInfo: async (destination: string): Promise<SafetyInfo> => {
    const system = 'Return strictly valid JSON with keys neighborhood, score, summary, recommendation, emergencyContacts { police, ambulance, fire }';
    const user = `Provide tourist safety information for ${destination}.`;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      });
      const text = completion.choices?.[0]?.message?.content?.trim() || '{}';
      return JSON.parse(text);
    } catch (error) {
      return {
        neighborhood: 'Unavailable',
        score: 0,
        summary: 'Could not retrieve safety information at this time.',
        recommendation: 'Always be aware of your surroundings and keep your valuables secure.',
        emergencyContacts: { police: 'N/A', ambulance: 'N/A', fire: 'N/A' }
      };
    }
  },

  translateText: async (text: string, destination: string): Promise<string> => {
    const system = 'Translate the user text into the primary local language spoken at the given destination. Reply with the translation only.';
    const user = `Destination: ${destination}. Text: ${text}`;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      });
      return completion.choices?.[0]?.message?.content?.trim() || 'Translation unavailable.';
    } catch (error) {
      return 'Translation unavailable.';
    }
  },

  getCulturalTips: async (destination: string): Promise<string> => {
    const system = 'Provide exactly 3 brief cultural etiquette tips in markdown with lists and bold where appropriate.';
    const user = `Destination: ${destination}`;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      });
      return completion.choices?.[0]?.message?.content?.trim() || 'Could not fetch cultural tips at this time.';
    } catch (error) {
      return 'Could not fetch cultural tips at this time.';
    }
  },

  getTripInspirations: async (): Promise<TripInspiration[]> => {
    const system = 'Return strictly valid JSON with key "inspirations" as an array of 4 items with destination, description, imageUrl (royalty-free).';
    const user = 'Suggest 4 diverse and popular travel destinations.';
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      });
      const text = completion.choices?.[0]?.message?.content?.trim() || '{"inspirations": []}';
      const data = JSON.parse(text);
      return data.inspirations || MOCK_INSPIRATIONS;
    } catch (error) {
      return MOCK_INSPIRATIONS;
    }
  }
};
