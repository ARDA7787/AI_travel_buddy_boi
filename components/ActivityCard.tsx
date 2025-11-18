
import React from 'react';
import type { Activity } from '../types';
import Icon from './Icon';

interface ActivityCardProps {
  activity: Activity;
  isFirst: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isFirst }) => {
  const { startTime, endTime, title, description, category } = activity;

  return (
    <div className="flex items-stretch space-x-4 relative animate-scale-in group">
      <div className="flex flex-col items-center relative">
        {/* Vertical Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[var(--primary-200)] -translate-x-1/2"></div>
        
        {/* Icon Bubble */}
        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-4 ring-[var(--primary-50)] transition-all duration-300 group-hover:scale-110 ${
           category === 'hidden-gem' 
             ? 'bg-gradient-to-br from-purple-400 to-indigo-600' 
             : 'bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)]'
        }`}>
          <Icon name={category === 'hidden-gem' ? 'sparkles' : category} className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex-1 pb-8 pt-0">
        <div className="flex items-center mb-2 ml-1">
            <div className="w-2 h-2 rounded-full bg-[var(--primary-400)] mr-2"></div>
            <p className="text-xs font-bold text-[var(--primary-700)] tracking-wide">{startTime} - {endTime}</p>
        </div>
        
        <div className="glass-card p-5 rounded-[20px] hover:bg-white/60 transition-all duration-300 group-hover:translate-x-1 relative overflow-hidden">
          {category === 'hidden-gem' && (
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Icon name="sparkles" className="w-24 h-24 text-purple-600" />
            </div>
          )}
          
          <div className="relative z-10">
              <h3 className="font-bold text-lg text-[var(--primary-900)] leading-tight mb-2">{title}</h3>
              <p className="text-sm text-[var(--primary-800)]/70 leading-relaxed mb-3">{description}</p>
              <div>
                 <span className={`inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                     category === 'hidden-gem'
                       ? 'bg-purple-100 text-purple-700 border-purple-200'
                       : 'bg-[var(--primary-50)] text-[var(--primary-700)] border-[var(--primary-200)]'
                 }`}>
                     {category.replace('-', ' ')}
                 </span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
