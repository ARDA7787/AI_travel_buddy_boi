
import React, { useState } from 'react';
import { useTravelData } from '../hooks/useTravelData';
import type { Alert, Activity } from '../types';
import Icon from './Icon';

const AlertModal: React.FC<{ alert: Alert; onClose: () => void }> = ({ alert, onClose }) => {
  const { isLoading, handleDisruption, acceptAlternative } = useTravelData();

  React.useEffect(() => {
    if (!alert.alternatives) {
      handleDisruption(alert.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.id, alert.alternatives]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-strong rounded-[32px] shadow-2xl w-full max-w-md border border-white/20 animate-scale-in overflow-hidden">
        <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-xl text-[var(--primary-900)]">Itinerary Change</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-all">
            <Icon name="close" className="w-6 h-6 text-[var(--primary-700)]" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[var(--primary-800)] mb-6 font-medium leading-relaxed">{alert.message}</p>
          {isLoading && !alert.alternatives ? (
             <div className="text-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)] mx-auto mb-3"></div>
                <p className="text-sm text-[var(--primary-700)] font-semibold">Finding alternatives...</p>
             </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar">
              {alert.alternatives?.map((alt, index) => (
                <div key={alt.id} className="glass-card border border-white/30 rounded-2xl p-4 flex justify-between items-center hover:bg-white/40 transition-all animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex-1 mr-3">
                    <h4 className="font-bold text-[var(--primary-900)] text-sm">{alt.title}</h4>
                    <p className="text-xs text-[var(--primary-700)] mt-1 line-clamp-2">{alt.description}</p>
                  </div>
                  <button onClick={() => acceptAlternative(alert.id, alt)} className="px-4 py-2 bg-[var(--primary-600)] text-white text-xs font-bold rounded-xl shadow-lg shadow-[var(--primary-600)]/30 hover:bg-[var(--primary-700)] transition-all shrink-0">
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 bg-white/5 flex justify-end space-x-3 border-t border-white/20">
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-[var(--primary-700)] hover:text-[var(--primary-900)] transition-all">
                Dismiss
            </button>
            <button disabled={isLoading} onClick={() => handleDisruption(alert.id)} className="px-6 py-3 text-sm bg-white/20 text-[var(--primary-800)] font-bold rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-white/30">
                More Options
            </button>
        </div>
      </div>
    </div>
  );
};

const AlertBanner: React.FC = () => {
  const { alerts, clearAlert } = useTravelData();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const itineraryAlerts = alerts.filter(a => a.category === 'itinerary');

  if (itineraryAlerts.length === 0) {
    return null;
  }

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
  };
  
  const handleDismissAlert = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    clearAlert(alertId);
  }

  return (
    <>
      <div className="px-6 pt-4 space-y-3">
        {itineraryAlerts.map((alert, index) => (
          <div
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            className="glass-card border-l-4 border-amber-400 p-4 rounded-2xl shadow-sm cursor-pointer flex justify-between items-start hover:translate-y-[-2px] transition-all animate-slide-in-right border-y border-r border-white/30 bg-amber-50/30"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⚠️</span>
                <p className="font-bold text-amber-800 text-sm">Heads up!</p>
              </div>
              <p className="text-xs text-amber-900/80 font-medium leading-relaxed">{alert.message}</p>
            </div>
            <button onClick={(e) => handleDismissAlert(e, alert.id)} className="ml-3 p-1.5 rounded-full hover:bg-amber-100/50 text-amber-700 transition-all">
              <Icon name="close" className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>
      {selectedAlert && <AlertModal alert={selectedAlert} onClose={handleCloseModal} />}
    </>
  );
};

export default AlertBanner;
