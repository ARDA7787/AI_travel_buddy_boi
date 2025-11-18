

import { GoogleGenAI, Type, Content } from "@google/genai";
// FIX: Import 'Day' type to resolve TypeScript error.
import type { UserPreferences, Itinerary, Message, SafetyInfo, Activity, Day, RichCard, GroundingSource, TripInspiration } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const geminiService = {
  generateItinerary: async (destination: string, dates: { from: string, to: string }, preferences: UserPreferences): Promise<Itinerary> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a personalized travel itinerary for a trip to ${destination} from ${dates.from} to ${dates.to}.
    The traveler's preferences are:
    - Budget: ${preferences.budget}
    - Interests: ${preferences.activities.join(', ')}
    - Pace: ${preferences.travelStyle}
    
    Structure the output as a single JSON object. The root object should contain 'destination', 'startDate', 'endDate', and an array of 'days'.
    Each 'day' object should have a 'date', 'dayNumber', and an array of 'activities'.
    Each 'activity' object must include: 'title', 'description', 'category' (from 'food', 'museum', 'tour', 'outdoor', 'shopping', 'nightlife', 'hidden-gem'), 'startTime' ("HH:mm"), 'endTime' ("HH:mm"), 'location' (an object with 'lat', 'lng', 'address'), and 'costEstimate' (a number).
    Ensure the generated latitudes and longitudes are valid for the given destination.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        destination: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING },
                        days: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    dayNumber: { type: Type.INTEGER },
                                    activities: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                title: { type: Type.STRING },
                                                description: { type: Type.STRING },
                                                category: { type: Type.STRING },
                                                startTime: { type: Type.STRING },
                                                endTime: { type: Type.STRING },
                                                location: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        lat: { type: Type.NUMBER },
                                                        lng: { type: Type.NUMBER },
                                                        address: { type: Type.STRING }
                                                    }
                                                },
                                                costEstimate: { type: Type.NUMBER }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const itineraryData = JSON.parse(response.text);
        // Add IDs, as the model won't generate them
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
        console.error("Error generating itinerary from Gemini:", error);
        // Fallback to mock data on error
        const fallback = JSON.parse(JSON.stringify(FALLBACK_ITINERARY_DATA));
        fallback.destination = destination;
        fallback.startDate = dates.from;
        fallback.endDate = dates.to;
        return fallback;
    }
  },

  getChatResponse: async (history: Message[], location: { lat: number, lng: number } | null): Promise<Message> => {
    const model = 'gemini-2.5-flash';
    
    const contents: Content[] = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    let processedContents = contents;
    if (processedContents.length > 0 && processedContents[0].role === 'model') {
        processedContents = processedContents.slice(1);
    }

    if (processedContents.length === 0) {
        return {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: "Hello! How can I assist with your trip planning?",
        };
    }

    try {
        const config: any = {
            tools: [{ googleMaps: {} }, { googleSearch: {} }],
        };
        
        if (location) {
            config.toolConfig = {
              retrievalConfig: {
                latLng: {
                  latitude: location.lat,
                  longitude: location.lng
                }
              }
            }
        }
        
        const systemInstruction = `You are an AI Travel Buddy, a helpful and friendly travel companion. Use the Google Maps tool for location-based queries like finding restaurants, attractions, or asking for directions. Use the Google Search tool for up-to-date information, current events, or general knowledge. When you provide a specific recommendation (like a restaurant or attraction), structure your response as a JSON object with 'content' and an optional 'richCard' object. The imageUrl should be a real, working URL. For general chat, the richCard field should be null. Use markdown for formatting (e.g., **bold** for emphasis, asterisks for lists). Your final output should be a parseable JSON string.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: processedContents,
            config: config,
            systemInstruction: systemInstruction,
        });

        let assistantMessage: Message;
        let jsonResponse: any = {};
        
        try {
            const cleanedText = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
            console.warn("Response was not valid JSON, using raw text.", e);
            jsonResponse.content = response.text;
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const groundingSources: GroundingSource[] = groundingChunks?.reduce((acc: GroundingSource[], chunk) => {
            if (chunk.maps?.uri && chunk.maps?.title) {
                acc.push({ uri: chunk.maps.uri, title: chunk.maps.title, type: 'maps' });
            }
            if (chunk.web?.uri && chunk.web?.title) {
                acc.push({ uri: chunk.web.uri, title: chunk.web.title, type: 'search' });
            }
            return acc;
        }, []) || [];


        assistantMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: jsonResponse.content || response.text || 'I found something for you!',
            richCard: jsonResponse.richCard || undefined,
            grounding: groundingSources?.length > 0 ? groundingSources : undefined,
        };
        
        return assistantMessage;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            id: `msg-err-${Date.now()}`,
            role: 'assistant',
            content: "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment."
        };
    }
  },
  
  getItineraryAlternatives: async (disruptedActivity: Activity, location: { lat: number, lng: number } | null): Promise<Activity[]> => {
    console.log("Getting alternatives for:", disruptedActivity.title);

    const model = 'gemini-2.5-flash';
    const prompt = `Find 3 alternative activities near ${disruptedActivity.location.address} in Paris, France. The original activity was '${disruptedActivity.title}' (${disruptedActivity.category}) at ${disruptedActivity.startTime}. Alternatives should be similar. Respond with a raw JSON array of objects. Each object must have keys: "title", "description", "category" (from 'food', 'museum', 'tour', 'outdoor', 'shopping', 'nightlife', 'hidden-gem'), "location" (object with "address"), and "costEstimate" (number).`;
    
    try {
        const config: any = {
            tools: [{ googleMaps: {} }],
        };

        if (location) {
             config.toolConfig = {
              retrievalConfig: {
                latLng: {
                  latitude: location.lat,
                  longitude: location.lng
                }
              }
            }
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: config
        });

        const cleanedText = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const alternativesJson = JSON.parse(cleanedText);

        return alternativesJson.map((alt: any, index: number) => ({
            ...alt,
            id: `alt-${Date.now()}-${index}`,
            startTime: disruptedActivity.startTime,
            endTime: disruptedActivity.endTime,
            location: {
                ...alt.location,
                lat: 0,
                lng: 0,
            }
        }));

    } catch(error) {
        console.error("Error getting alternatives from Gemini:", error);
        await delay(1000);
        return [
            { id: 'alt-1', title: 'Musée Carnavalet', description: 'Discover the history of Paris in this beautiful museum located in two historic mansions. It\'s free!', category: 'museum', startTime: '16:30', endTime: '19:00', location: { lat: 48.857, lng: 2.361, address: '23 Rue de Sévigné, 75003 Paris' }, costEstimate: 0 },
            { id: 'alt-2', title: 'Centre Pompidou', description: 'Explore modern and contemporary art in a unique inside-out building. The rooftop offers great views.', category: 'museum', startTime: '16:30', endTime: '19:00', location: { lat: 48.8606, lng: 2.3522, address: 'Place Georges-Pompidou, 75004 Paris' }, costEstimate: 15 },
        ];
    }
  },

  getSafetyInfo: async (destination: string): Promise<SafetyInfo> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide safety information for a tourist in ${destination}. Respond with a single JSON object with keys: "neighborhood" (a generally central and popular area), "score" (a safety score from 1-100), "summary" (a brief overview), "recommendation" (a specific, actionable tip), and "emergencyContacts" (an object with "police", "ambulance", and "fire" numbers for the country). Use markdown for emphasis in the summary and recommendation.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        neighborhood: { type: Type.STRING },
                        score: { type: Type.INTEGER },
                        summary: { type: Type.STRING },
                        recommendation: { type: Type.STRING },
                        emergencyContacts: {
                            type: Type.OBJECT,
                            properties: {
                                police: { type: Type.STRING },
                                ambulance: { type: Type.STRING },
                                fire: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch(error) {
        console.error("Error getting safety info:", error);
        return {
          neighborhood: 'Unavailable',
          score: 0,
          summary: 'Could not retrieve safety information at this time.',
          recommendation: 'Always be aware of your surroundings and keep your valuables secure.',
          emergencyContacts: { police: 'N/A', ambulance: 'N/A', fire: 'N/A' },
        };
    }
  },

  translateText: async (text: string, destination: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Translate the following English phrase into the primary local language spoken in ${destination}. Phrase: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        return "Translation unavailable.";
    }
  },

  getCulturalTips: async (destination: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Provide 3 brief, essential cultural etiquette tips for a tourist visiting ${destination}. Focus on greetings, dining, and public transport. Use markdown for emphasis (e.g., **bold**) and for lists (using asterisks).`;
     try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
        });
        return response.text;
    } catch (error) {
        console.error("Error getting tips:", error);
        return "Could not fetch cultural tips at this time.";
    }
  },

  getTripInspirations: async (): Promise<TripInspiration[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Suggest 4 diverse and popular travel destinations. For each, provide a "destination" (City, Country), a short, enticing "description", and a "imageUrl" for a beautiful, royalty-free, and high-quality photo from a site like Unsplash or Pexels.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              inspirations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    destination: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imageUrl: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const json = JSON.parse(response.text);
      return json.inspirations;
    } catch (error) {
      console.error("Error getting trip inspirations:", error);
      return MOCK_INSPIRATIONS; // Fallback to mock data on error
    }
  },
};