
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import type { SafetyInfo } from '../types';
import { useTravelData } from '../hooks/useTravelData';
import Icon from './Icon';
import { parseMarkdown } from '../lib/markdown';

const emergencyPhrases = [
    "I need a doctor",
    "Where is the nearest hospital?",
    "Please call the police",
    "I lost my passport",
];

const TranslationModal: React.FC<{ phrase: string; destination: string; onClose: () => void }> = ({ phrase, destination, onClose }) => {
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getTranslation = async () => {
            setIsLoading(true);
            const result = await geminiService.translateText(phrase, destination);
            setTranslation(result);
            setIsLoading(false);
        };
        getTranslation();
    }, [phrase, destination]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Quick Translation</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Icon name="close" className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <p className="text-gray-600 mb-2">{phrase}</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        {isLoading ? (
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-blue-800 font-bold text-2xl">{translation}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const SafetyScreen: React.FC = () => {
  const { activeTrip, alerts } = useTravelData();
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);

  const safetyAlerts = alerts.filter(a => a.category === 'safety');

  useEffect(() => {
    const fetchSafetyInfo = async () => {
      if (!activeTrip) {
        setIsLoading(false);
        setSafetyInfo(null);
        return;
      }
      setIsLoading(true);
      try {
        const info = await geminiService.getSafetyInfo(activeTrip.destination);
        setSafetyInfo(info);
      } catch (error) {
        console.error("Failed to fetch safety info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafetyInfo();
  }, [activeTrip]);

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-green-600 bg-green-100';
    if (score > 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!activeTrip) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No Trip Selected</h2>
        <p className="text-gray-500 mt-2">Please select a trip from the home screen to view safety information.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      ) : safetyInfo ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-700">Current Area: {safetyInfo.neighborhood}</h2>
            <div className="flex items-center justify-center my-4">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreColor(safetyInfo.score)}`}>
                <span className="text-4xl font-bold">{safetyInfo.score}</span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(safetyInfo.summary) }}/>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-700 mb-3">Local Safety Alerts</h2>
            {safetyAlerts.length > 0 ? (
                <div className="space-y-2">
                    {safetyAlerts.map(alert => (
                        <div key={alert.id} className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 rounded-r-lg">
                           <div className="flex items-start">
                             <Icon name="alert-triangle" className="w-5 h-5 mr-3 mt-0.5" />
                             <p className="text-sm">{alert.message}</p>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500 text-sm">No active safety alerts for your area.</p>
                </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-700 mb-3">Emergency Phrases</h2>
            <div className="grid grid-cols-2 gap-2">
                {emergencyPhrases.map(phrase => (
                    <button key={phrase} onClick={() => setSelectedPhrase(phrase)} className="text-sm text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg">
                        {phrase}
                    </button>
                ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-700 mb-3">Emergency Contacts</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <a href={`tel:${safetyInfo.emergencyContacts.police}`} className="block p-3 bg-blue-100 text-blue-700 rounded-lg">
                  <span className="text-2xl">🚓</span>
                  <span className="block text-sm font-semibold mt-1">Police</span>
                  <span className="block text-xs text-blue-600">{safetyInfo.emergencyContacts.police}</span>
                </a>
              </div>
              <div>
                 <a href={`tel:${safetyInfo.emergencyContacts.ambulance}`} className="block p-3 bg-red-100 text-red-700 rounded-lg">
                  <span className="text-2xl">🚑</span>
                  <span className="block text-sm font-semibold mt-1">Ambulance</span>
                   <span className="block text-xs text-red-600">{safetyInfo.emergencyContacts.ambulance}</span>
                </a>
              </div>
              <div>
                 <a href={`tel:${safetyInfo.emergencyContacts.fire}`} className="block p-3 bg-orange-100 text-orange-700 rounded-lg">
                  <span className="text-2xl">🚒</span>
                  <span className="block text-sm font-semibold mt-1">Fire</span>
                  <span className="block text-xs text-orange-600">{safetyInfo.emergencyContacts.fire}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Could not load safety information for {activeTrip.destination}.</p>
      )}
      {selectedPhrase && activeTrip && (
        <TranslationModal phrase={selectedPhrase} destination={activeTrip.destination} onClose={() => setSelectedPhrase(null)} />
      )}
    </div>
  );
};

export default SafetyScreen;
