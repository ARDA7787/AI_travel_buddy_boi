import React from 'react';
import type { Screen } from '../types';
import Icon from './Icon';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const navItems: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'itinerary', label: 'Itinerary', icon: 'itinerary' },
  { screen: 'map', label: 'Map', icon: 'map' },
  { screen: 'chat', label: 'Chat', icon: 'chat' },
  { screen: 'safety', label: 'Safety', icon: 'safety' },
  { screen: 'profile', label: 'Profile', icon: 'profile' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="w-full px-6 pb-6 pt-2 bg-gradient-to-t from-[var(--primary-50)]/80 to-transparent">
      <div className="glass-strong rounded-[32px] border border-white/40 shadow-2xl backdrop-blur-2xl mx-auto max-w-[360px]">
        <div className="flex justify-between items-center h-[72px] px-6">
          {navItems.map((item) => (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 group ${
                activeScreen === item.screen ? '-translate-y-3' : ''
              }`}
            >
              <div className={`absolute inset-0 rounded-full bg-[var(--primary-400)] opacity-0 transition-opacity duration-300 blur-md ${activeScreen === item.screen ? 'opacity-40' : ''}`}></div>
              
              <div className={`relative z-10 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
                activeScreen === item.screen 
                  ? 'bg-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary-600)]/40 ring-4 ring-white/30' 
                  : 'text-[var(--primary-700)] hover:bg-white/30'
              }`}>
                <Icon name={item.icon} className="w-5 h-5" />
              </div>
              
              {activeScreen === item.screen && (
                <span className="absolute -bottom-6 text-[10px] font-bold text-[var(--primary-800)] animate-fade-in tracking-wide">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
