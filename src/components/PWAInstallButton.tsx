import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already running as an installed PWA in standalone mode, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android native prompt flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition-all active:scale-95 shadow-md shadow-emerald-900/40 border border-emerald-400/40"
        title="Instalar Placar como Aplicativo no Celular/Computador"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 font-bold text-xs transition-all border border-emerald-500/40 shadow-sm"
          title="Instalar no iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-neutral-200 shadow-2xl">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white text-center mb-1">
                Instalar no iPhone / iPad
              </h3>
              <p className="text-xs text-neutral-400 text-center mb-5">
                Para ter o placar em tela cheia na sua tela de início:
              </p>

              <div className="space-y-3 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Toque no botão de <strong>Compartilhar</strong>{' '}
                    <Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> na barra do navegador Safari.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers before prompt fires or manual install instructions
  return (
    <>
      <button
        onClick={() => setShowAndroidGuide(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 font-bold text-xs transition-all border border-emerald-500/30"
        title="Como instalar no dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-neutral-200 shadow-2xl">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-1">
              Instalar Aplicativo PWA
            </h3>
            <p className="text-xs text-neutral-400 text-center mb-4">
              Instale o Scoreboard Pro para jogar offline e em tela cheia:
            </p>

            <div className="space-y-3 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  No Chrome/Android ou Edge, toque no <strong>menu de 3 pontinhos (⋮)</strong> no canto superior.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
