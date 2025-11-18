import React, { useState } from 'react';
import type { UserPreferences } from '../types';
import { useTravelData } from '../hooks/useTravelData';
import Icon from './Icon';

const activityOptions = ['Museums', 'Food Tours', 'Hiking', 'Nightlife', 'Shopping', 'History', 'Hidden Gems'];

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferencesState] = useState<UserPreferences>({
    budget: 'moderate',
    activities: [],
    travelStyle: 'chilled',
    safetyComfort: 3,
  });

  const { setPreferences: setGlobalPreferences, setView } = useTravelData();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleActivity = (activity: string) => {
    setPreferencesState(p => ({
      ...p,
      activities: p.activities.includes(activity)
        ? p.activities.filter(a => a !== activity)
        : [...p.activities, activity],
    }));
  };

  const handleSubmit = async () => {
    setGlobalPreferences(preferences);
    setView('home');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">What's your travel budget?</h2>
            <p className="text-gray-500 mt-2">This helps us recommend the right spots.</p>
            <div className="mt-6 space-y-4">
              {['economy', 'moderate', 'luxury'].map(b => (
                <button
                  key={b}
                  onClick={() => setPreferencesState(p => ({ ...p, budget: b as UserPreferences['budget'] }))}
                  className={`w-full text-left p-4 border rounded-lg transition-all ${preferences.budget === b ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'bg-white border-gray-300'}`}
                >
                  <span className="font-semibold capitalize">{b}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">What do you love to do?</h2>
            <p className="text-gray-500 mt-2">Choose a few of your favorite activities.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {activityOptions.map(activity => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={`px-4 py-2 border rounded-full font-medium transition-colors ${preferences.activities.includes(activity) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">What's your travel pace?</h2>
            <p className="text-gray-500 mt-2">Relaxed days or action-packed adventures?</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                  onClick={() => setPreferencesState(p => ({ ...p, travelStyle: 'chilled' }))}
                  className={`p-4 border rounded-lg transition-all text-center ${preferences.travelStyle === 'chilled' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'bg-white border-gray-300'}`}
                >
                  <span className="text-4xl">😌</span>
                  <span className="block font-semibold mt-2">Chilled Out</span>
                </button>
                <button
                  onClick={() => setPreferencesState(p => ({ ...p, travelStyle: 'packed' }))}
                  className={`p-4 border rounded-lg transition-all text-center ${preferences.travelStyle === 'packed' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'bg-white border-gray-300'}`}
                >
                  <span className="text-4xl">⚡️</span>
                  <span className="block font-semibold mt-2">Action-Packed</span>
                </button>
            </div>
          </div>
        );
      case 4:
         return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All set!</h2>
            <p className="text-gray-500 mt-2">We've saved your preferences. Let's start planning!</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold">Your Preferences:</h3>
                <ul className="list-disc list-inside mt-2 text-gray-600">
                    <li>Budget: <span className="font-medium capitalize">{preferences.budget}</span></li>
                    <li>Pace: <span className="font-medium capitalize">{preferences.travelStyle}</span></li>
                    <li>Activities: <span className="font-medium">{preferences.activities.join(', ')}</span></li>
                </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="flex-1 flex flex-col justify-center">
        {renderStep()}
      </div>
      <div className="py-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-2 text-gray-600 font-semibold rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          {step < 4 ? (
            <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center">
              Next <Icon name="arrow-right" className="w-5 h-5 ml-2"/>
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center"
            >
              Finish
              <Icon name="sparkles" className="w-5 h-5 ml-2"/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
