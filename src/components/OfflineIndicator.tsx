import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-sm border border-amber-400 px-3 py-1.5 text-xs font-bold text-neutral-950 shadow-xl animate-bounce">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline — O placar continua funcionando sem internet</span>
    </div>
  );
};
