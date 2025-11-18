import React, { useState, useEffect } from 'react';
import { useTravelData } from '../hooks/useTravelData';
import { openaiService } from '../services/openaiService';
import type { TripInspiration } from '../types';
import Icon from './Icon';

const InspirationCard: React.FC<{ inspiration: TripInspiration, onSelect: () => void }> = ({ inspiration, onSelect }) => (
    <button onClick={onSelect} className="relative w-full h-32 rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-white/20">
        <img src={inspiration.imageUrl} alt={inspiration.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full text-left">
            <h4 className="font-bold text-white text-sm mb-0.5 leading-tight">{inspiration.destination}</h4>
            <p className="text-white/80 text-[10px] line-clamp-1 font-medium">{inspiration.description}</p>
        </div>
    </button>
);

const PlanTripScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { planTrip, isLoading } = useTravelData();
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [inspirations, setInspirations] = useState<TripInspiration[]>([]);
    const [isLoadingInspirations, setIsLoadingInspirations] = useState(true);

    useEffect(() => {
        const fetchInspirations = async () => {
            setIsLoadingInspirations(true);
            const data = await openaiService.getTripInspirations();
            setInspirations(data);
            setIsLoadingInspirations(false);
        };
        fetchInspirations();
    }, []);

    const handlePlanTrip = () => {
        if (destination && startDate && endDate) {
            planTrip(destination, { from: startDate, to: endDate });
        } else {
            alert("Please fill in all fields.");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="pt-8 pb-4 px-6 flex items-center animate-slide-in-up">
                <button onClick={onBack} className="mr-4 p-3 bg-white/20 rounded-full text-[var(--primary-700)] hover:bg-white/40 hover:text-[var(--primary-900)] transition-all backdrop-blur-md shadow-sm">
                    <Icon name="arrow-left" className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--primary-900)]">Plan a New Trip</h1>
                    <p className="text-sm text-[var(--primary-700)]/80 font-medium">Let's create your next adventure 🌟</p>
                </div>
            </header>

            <main className="flex-1 px-6 pb-6 space-y-6 overflow-y-auto no-scrollbar">
                <div className="glass-card p-6 rounded-[24px] border border-white/40 shadow-sm animate-scale-in">
                    <h2 className="font-bold text-lg text-[var(--primary-900)] mb-4">Trip Details</h2>
                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-[var(--primary-700)] mb-2 block uppercase tracking-wide">Destination</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g., Tokyo, Japan"
                                className="w-full px-4 py-3.5 bg-white/40 border border-white/50 rounded-xl focus:outline-none focus:bg-white/60 focus:ring-2 focus:ring-[var(--primary-300)] transition-all font-medium text-[var(--primary-900)] placeholder-[var(--primary-400)]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--primary-700)] mb-2 block uppercase tracking-wide">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/40 border border-white/50 rounded-xl focus:outline-none focus:bg-white/60 focus:ring-2 focus:ring-[var(--primary-300)] transition-all font-medium text-[var(--primary-900)]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--primary-700)] mb-2 block uppercase tracking-wide">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/40 border border-white/50 rounded-xl focus:outline-none focus:bg-white/60 focus:ring-2 focus:ring-[var(--primary-300)] transition-all font-medium text-[var(--primary-900)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="animate-scale-in" style={{animationDelay: '0.1s'}}>
                     <h2 className="font-bold text-lg text-[var(--primary-900)] mb-4 ml-1">Need inspiration? ✨</h2>
                     {isLoadingInspirations ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-32 bg-white/20 rounded-[20px] animate-pulse"></div>
                            ))}
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {inspirations.map(insp => (
                                <InspirationCard key={insp.destination} inspiration={insp} onSelect={() => setDestination(insp.destination)} />
                            ))}
                        </div>
                     )}
                </div>
            </main>
            <footer className="p-6 animate-slide-in-up">
                <button
                    onClick={handlePlanTrip}
                    disabled={isLoading || !destination || !startDate || !endDate}
                    className="group w-full flex items-center justify-center px-6 py-4 bg-[var(--primary-600)] text-white font-bold rounded-[20px] hover:bg-[var(--primary-700)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[var(--primary-600)]/30 hover:shadow-2xl hover:shadow-[var(--primary-600)]/40 hover:-translate-y-1"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <span>Generate Itinerary</span>
                            <Icon name="sparkles" className="w-6 h-6 ml-2 group-hover:rotate-12 transition-transform" />
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
};

export default PlanTripScreen;
