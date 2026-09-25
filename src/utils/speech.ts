// Web Speech API Voice Synthesizer for announcing scores in Portuguese

class SpeechAnnouncer {
  public enabled: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
    }
  }

  private initVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Portuguese voices (pt-BR or pt-PT)
    const ptVoice = voices.find(v => v.lang.startsWith('pt-BR')) || voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) {
      this.voice = ptVoice;
    }
  }

  public speak(text: string) {
    if (!this.enabled || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // cancel pending speech for zero latency
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'pt-BR';
      utterance.rate = 1.08; // slightly brisk for sports announcer
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error fallback
    }
  }

  public announceScore(
    scoreTextA: string,
    scoreTextB: string,
    servingTeamName: string,
    extraNotice?: string
  ) {
    if (!this.enabled) return;

    let announcement = `${scoreTextA} a ${scoreTextB}`;
    if (extraNotice) {
      announcement += `, ${extraNotice}`;
    }
    this.speak(announcement);
  }
}

export const announcer = new SpeechAnnouncer();
