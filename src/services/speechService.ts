// Web Speech Synthesis (TTS) & Recognition (STT) for pronunciation

interface SpeechOptions {
  lang?: 'en-US' | 'en-GB';
  rate?: number; // 0.5 to 2.0
  pitch?: number;
}

// Check speech recognition type definitions
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export class SpeechService {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognitionInstance: SpeechRecognitionInstance | null = null;

  // Speak text with options
  public static speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const lang = options.lang || 'en-US';
      utterance.lang = lang;
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;

      // Find best matching voice
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Premium')));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      } else {
        const fallbackVoice = voices.find(v => v.lang.startsWith('en'));
        if (fallbackVoice) utterance.voice = fallbackVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  // Stop speech synthesis
  public static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Stop speech recognition microphone
  public static stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
        this.recognitionInstance.stop();
      } catch {
        // ignore
      }
      this.recognitionInstance = null;
    }
  }

  // Check if speech recognition is supported in browser
  public static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    return !!(windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition);
  }

  // Start listening to user voice and return similarity score & recognized transcript
  public static listenAndGrade(
    targetWord: string,
    onResult: (score: number, transcript: string, isCorrect: boolean) => void,
    onError: (err: string) => void,
    onStart?: () => void
  ): () => void {
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };

    const SpeechRecConstructor = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecConstructor) {
      onError('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Microphone). Hãy dùng Chrome/Edge.');
      return () => {};
    }

    try {
      if (this.recognitionInstance) {
        this.recognitionInstance.abort();
      }

      const rec = new SpeechRecConstructor();
      this.recognitionInstance = rec;
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript.trim().toLowerCase();
          const cleanTarget = targetWord.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
          const cleanTranscript = transcript.replace(/[^a-z0-9\s]/gi, '');

          // Calculate similarity score
          const score = this.calculateSimilarity(cleanTarget, cleanTranscript);
          const isCorrect = score >= 75 || cleanTarget === cleanTranscript || cleanTranscript.includes(cleanTarget);

          onResult(score, transcript, isCorrect);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEventLike) => {
        let msg = 'Không nhận diện được giọng nói';
        if (event.error === 'not-allowed') {
          msg = 'Vui lòng cấp quyền truy cập Microphone trong trình duyệt để luyện phát âm.';
        } else if (event.error === 'no-speech') {
          msg = 'Không nghe thấy giọng nói. Hãy thử đọc lại to và rõ ràng hơn nhé.';
        }
        onError(msg);
      };

      rec.onend = () => {
        this.recognitionInstance = null;
      };

      rec.start();
      if (onStart) onStart();

      return () => {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      };
    } catch (e) {
      onError('Lỗi khởi tạo Microphone: ' + String(e));
      return () => {};
    }
  }

  // Levenshtein similarity percentage
  private static calculateSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 100;
    if (!s1.length || !s2.length) return 0;

    const track = Array(s2.length + 1).fill(null).map(() =>
      Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    const distance = track[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);
    const score = Math.round(((maxLen - distance) / maxLen) * 100);
    return Math.max(0, Math.min(100, score));
  }
}
