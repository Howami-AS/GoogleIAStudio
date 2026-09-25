import React, { useState } from 'react';
import { X, Check, RotateCcw, Palette, Shield } from 'lucide-react';
import { SportRulesConfig, SportType, Team, BeachTennisFormat } from '../types/scoreboard';
import { SPORT_DEFAULTS } from '../utils/rules';

interface MatchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SportRulesConfig;
  teamA: Team;
  teamB: Team;
  onSave: (newConfig: SportRulesConfig, newTeamA: Team, newTeamB: Team) => void;
}

const COLOR_PRESETS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald / Green
  '#f59e0b', // Amber / Yellow
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f97316', // Orange
];

export const MatchSettingsModal: React.FC<MatchSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  teamA,
  teamB,
  onSave,
}) => {
  const [sport, setSport] = useState<SportType>(config.sport);
  const [setsToWin, setSetsToWin] = useState<number>(config.setsToWin);
  const [beachTennisFormat, setBeachTennisFormat] = useState<BeachTennisFormat>(config.beachTennisFormat);
  const [goldenPoint, setGoldenPoint] = useState<boolean>(config.goldenPoint);
  const [superTiebreak, setSuperTiebreak] = useState<boolean>(config.superTiebreakFinalSet);

  const [nameA, setNameA] = useState(teamA.name);
  const [playersA, setPlayersA] = useState(teamA.players || '');
  const [colorA, setColorA] = useState(teamA.color);

  const [nameB, setNameB] = useState(teamB.name);
  const [playersB, setPlayersB] = useState(teamB.players || '');
  const [colorB, setColorB] = useState(teamB.color);

  if (!isOpen) return null;

  const handleSportChange = (newSport: SportType) => {
    setSport(newSport);
    const defaults = SPORT_DEFAULTS[newSport];
    setSetsToWin(defaults.setsToWin);
    setBeachTennisFormat(defaults.beachTennisFormat);
    setGoldenPoint(defaults.goldenPoint);
    setSuperTiebreak(defaults.superTiebreakFinalSet);
  };

  const handleSave = () => {
    const updatedConfig: SportRulesConfig = {
      ...config,
      sport,
      setsToWin,
      beachTennisFormat,
      goldenPoint,
      superTiebreakFinalSet: superTiebreak,
    };

    const updatedTeamA: Team = {
      ...teamA,
      name: nameA.trim() || 'Equipe 1',
      players: playersA.trim(),
      color: colorA,
    };

    const updatedTeamB: Team = {
      ...teamB,
      name: nameB.trim() || 'Equipe 2',
      players: playersB.trim(),
      color: colorB,
    };

    onSave(updatedConfig, updatedTeamA, updatedTeamB);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Configurações da Partida</h3>
        <p className="text-xs text-neutral-400 mb-6">Ajuste modalidade, regras oficiais e equipes</p>

        <div className="space-y-6">
          {/* Modalidade Esportiva */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Modalidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'volleyball_indoor', label: 'Vôlei Quadra', icon: '🏐' },
                { id: 'volleyball_beach', label: 'Vôlei Praia', icon: '🏖️' },
                { id: 'beach_tennis', label: 'Beach Tennis', icon: '🎾' },
                { id: 'badminton', label: 'Badminton', icon: '🏸' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSportChange(item.id as SportType)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-sm font-semibold transition-all ${
                    sport === item.id
                      ? 'bg-neutral-800 border-amber-400/60 text-white shadow'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Regras específicas por Esporte */}
          <div className="bg-neutral-950/60 rounded-2xl p-4 border border-neutral-800/60 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Regras do {sport === 'beach_tennis' ? 'Beach Tennis' : sport === 'badminton' ? 'Badminton' : 'Vôlei'}
            </h4>

            {sport === 'beach_tennis' ? (
              <>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                    Formato de Disputa
                  </label>
                  <select
                    value={beachTennisFormat}
                    onChange={(e) => setBeachTennisFormat(e.target.value as BeachTennisFormat)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="single_set_6">Set Único até 6 Games (Padrão de Torneio)</option>
                    <option value="single_set_8">Set Longo até 8 Games (Tie-break em 8-8)</option>
                    <option value="best_of_3">Melhor de 3 Sets (com Super Tie-break)</option>
                    <option value="short_set_4">Short Set (até 4 Games)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-sm font-medium text-white block">Ponto de Ouro (No-Ad)</span>
                    <span className="text-xs text-neutral-400">Em 40-40, quem fizer o ponto vence o game</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={goldenPoint}
                    onChange={(e) => setGoldenPoint(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                  Sets para Vencer a Partida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1, label: '1 Set' },
                    { val: 2, label: 'Melhor de 3 (vence 2)' },
                    { val: 3, label: 'Melhor de 5 (vence 3)' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setSetsToWin(s.val)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        setsToWin === s.val
                          ? 'bg-neutral-800 border-white text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800/40'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configuração das Equipes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Equipes & Cores
            </h4>

            {/* Equipe 1 */}
            <div className="p-3.5 bg-neutral-950/60 rounded-2xl border border-neutral-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorA }} />
                <span className="text-xs font-bold text-neutral-200">Equipe 1</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do Time"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Jogadores / Dupla (opcional)"
                  value={playersA}
                  onChange={(e) => setPlayersA(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColorA(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      colorA === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Equipe 2 */}
            <div className="p-3.5 bg-neutral-950/60 rounded-2xl border border-neutral-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorB }} />
                <span className="text-xs font-bold text-neutral-200">Equipe 2</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do Time"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Jogadores / Dupla (opcional)"
                  value={playersB}
                  onChange={(e) => setPlayersB(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-xl px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColorB(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      colorB === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold transition-colors shadow-lg"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
