
import React, { useState } from 'react';
import { useTravelData } from '../hooks/useTravelData';
import { geminiService } from '../services/geminiService';
import Icon from './Icon';
import { parseMarkdown } from '../lib/markdown';

const AccordionItem: React.FC<{
    title: string;
    icon: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => {
    return (
        <div className="border-b border-gray-200/50 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 hover:bg-gray-50/50"
            >
                <div className="flex items-center">
                    <Icon name={icon} className="w-5 h-5 mr-3 text-gray-500" />
                    <span>{title}</span>
                </div>
                <Icon name="chevron-down" className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ProfileScreen: React.FC = () => {
  const { preferences, activeTrip } = useTravelData();
  const [openTool, setOpenTool] = useState<'translate' | 'tips' | null>(null);

  const [translationInput, setTranslationInput] = useState('');
  const [translationResult, setTranslationResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [culturalTips, setCulturalTips] = useState('');
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const handleTranslate = async () => {
    if (!translationInput.trim() || !activeTrip) return;
    setIsTranslating(true);
    const result = await geminiService.translateText(translationInput, activeTrip.destination);
    setTranslationResult(result);
    setIsTranslating(false);
  };

  const handleGetTips = async () => {
      if (!activeTrip) return;
      setIsLoadingTips(true);
      const tips = await geminiService.getCulturalTips(activeTrip.destination);
      setCulturalTips(tips);
      setIsLoadingTips(false);
  }
  
  const toggleTool = (tool: 'translate' | 'tips') => {
    setOpenTool(prev => (prev === tool ? null : tool));
  };

  if (!preferences) {
    return (
      <div className="p-4 text-center">
        <p>No preferences set. Please complete the onboarding process.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-100 overflow-y-auto">
      <header className="p-6 text-center relative animate-fade-in">
        <div className="inline-block p-2 bg-white/50 rounded-full shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Icon name="profile" className="w-10 h-10 text-white" />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome, Traveler</h1>
        <p className="text-gray-500 text-sm">Your preferences, your adventures.</p>
      </header>
      
      <main className="p-4 space-y-6">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-5 border border-white/50 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-bold text-lg text-gray-800 mb-4">Your Travel Style</h2>
          <div className="space-y-4">
              <div className="flex items-center">
                  <Icon name="cash" className="w-6 h-6 text-green-500 mr-4"/>
                  <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-700 capitalize">{preferences.budget}</p>
                  </div>
              </div>
              <div className="flex items-center">
                  <Icon name="clock" className="w-6 h-6 text-purple-500 mr-4"/>
                  <div>
                      <p className="text-sm text-gray-500">Pace</p>
                      <p className="font-semibold text-gray-700 capitalize">{preferences.travelStyle}</p>
                  </div>
              </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200/80">
            <p className="text-sm text-gray-500 mb-2">Favorite Activities</p>
             <div className="flex flex-wrap gap-2">
                 {preferences.activities.map(activity => (
                    <span key={activity} className="font-medium bg-white shadow-sm border text-gray-700 px-3 py-1 rounded-full text-xs transition-transform hover:scale-105">{activity}</span>
                 ))}
              </div>
          </div>
        </div>
        
        {activeTrip && (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 overflow-hidden animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                <h2 className="p-4 font-bold text-lg text-gray-800">Travel Tools</h2>
                <AccordionItem title="Quick Translator" icon="translate" isOpen={openTool === 'translate'} onToggle={() => toggleTool('translate')}>
                    <div className="space-y-3">
                        <textarea
                            value={translationInput}
                            onChange={(e) => setTranslationInput(e.target.value)}
                            placeholder="Type text to translate..."
                            className="w-full p-2 border bg-white/50 border-gray-300/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={2}
                        />
                        <button onClick={handleTranslate} disabled={isTranslating} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:bg-blue-300">
                            {isTranslating ? 'Translating...' : `Translate`}
                        </button>
                        {translationResult && (
                            <div className="p-3 bg-blue-50/50 rounded-md text-sm text-blue-800 font-medium border border-blue-200/50">
                                {translationResult}
                            </div>
                        )}
                    </div>
                </AccordionItem>
                <AccordionItem title="Cultural Tips" icon="book-open" isOpen={openTool === 'tips'} onToggle={() => toggleTool('tips')}>
                    {culturalTips ? (
                        <div className="text-sm text-gray-700 prose prose-sm max-w-none bg-gray-50/50 p-3 rounded-md border border-gray-200/50" dangerouslySetInnerHTML={{ __html: parseMarkdown(culturalTips) }}></div>
                    ) : (
                        <button onClick={handleGetTips} disabled={isLoadingTips} className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-indigo-300">
                            {isLoadingTips ? 'Getting Tips...' : `Get Tips for ${activeTrip.destination.split(',')[0]}`}
                        </button>
                    )}
                </AccordionItem>
            </div>
        )}
        
        <div className="pt-4 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
             <button className="w-full py-3 text-red-600 font-semibold hover:bg-red-100/50 rounded-lg transition-colors">
                Log Out
            </button>
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;
