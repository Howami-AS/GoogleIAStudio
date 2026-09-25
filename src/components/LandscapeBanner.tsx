import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, X } from 'lucide-react';
import { isPortraitOrientation, requestLandscapeMode } from '../utils/orientation';

export const LandscapeBanner: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if mobile width and portrait
      const isMobile = window.innerWidth <= 840;
      setIsPortrait(isMobile && isPortraitOrientation());
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 border-b border-amber-500/30 px-3 py-2 text-neutral-200 select-none animate-in slide-in-from-top duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <Smartphone className="w-4 h-4 rotate-90" />
          </div>
          <span>
            <strong className="text-white">Dica para Android/Celular:</strong> Use o aparelho na horizontal (paisagem) para ver os pontos gigantes à distância!
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => requestLandscapeMode()}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Girar Tela</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-neutral-400 hover:text-white rounded"
            title="Fechar dica"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
