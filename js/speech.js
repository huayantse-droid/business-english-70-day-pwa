const MIN_SPEECH_RATE = 0.7;
const MAX_SPEECH_RATE = 1.2;
const DEFAULT_SPEECH_RATE = 1;
const SYNTHESIS_METHODS = ['cancel', 'getVoices', 'pause', 'resume', 'speak'];
const NOVELTY_VOICE_NAMES = new Set([
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
  'good news', 'jester', 'organ', 'superstar', 'trinoids', 'whisper',
  'wobble', 'zarvox'
]);
const PREFERRED_VOICE_NAMES = [
  'Samantha', 'Ava', 'Zoe', 'Flo', 'Sandy', 'Shelley', 'Daniel', 'Karen', 'Moira'
];

function clampRate(rate) {
  if (!Number.isFinite(rate)) {
    return DEFAULT_SPEECH_RATE;
  }

  return Math.min(MAX_SPEECH_RATE, Math.max(MIN_SPEECH_RATE, rate));
}

function getEnglishVoices(speechSynthesis) {
  if (typeof speechSynthesis.getVoices !== 'function') {
    return [];
  }

  return speechSynthesis
    .getVoices()
    .filter((voice) =>
      typeof voice.lang === 'string' &&
      voice.lang.startsWith('en') &&
      !NOVELTY_VOICE_NAMES.has(String(voice.name).toLowerCase())
    );
}

function selectEnglishVoice(voices, selectedVoiceName = '') {
  return (
    voices.find((voice) => voice.name === selectedVoiceName) ??
    PREFERRED_VOICE_NAMES
      .map((name) => voices.find((voice) => voice.name === name))
      .find(Boolean) ??
    voices.find((voice) => voice.lang === 'en-US') ??
    voices.find((voice) => voice.lang === 'en-GB') ??
    voices[0]
  );
}

export function createSpeechController(browser) {
  const speechSynthesis = browser?.speechSynthesis;
  const Utterance = browser?.SpeechSynthesisUtterance;
  const supported =
    speechSynthesis !== null &&
    typeof speechSynthesis === 'object' &&
    typeof Utterance === 'function' &&
    SYNTHESIS_METHODS.every((method) => typeof speechSynthesis[method] === 'function');

  if (!supported) {
    return {
      supported: false,
      speak() {},
      pause() {},
      resume() {},
      stop() {},
      getEnglishVoices() {
        return [];
      },
      onVoicesChanged() {
        return () => {};
      }
    };
  }

  return {
    supported: true,
    speak(text, rate = DEFAULT_SPEECH_RATE, selectedVoiceName = '') {
      speechSynthesis.cancel();

      const utterance = new Utterance(text);
      const voice = selectEnglishVoice(getEnglishVoices(speechSynthesis), selectedVoiceName);

      utterance.lang = 'en-US';
      utterance.rate = clampRate(rate);

      if (voice) {
        utterance.voice = voice;
      }

      speechSynthesis.speak(utterance);
    },
    pause() {
      speechSynthesis.pause();
    },
    resume() {
      speechSynthesis.resume();
    },
    stop() {
      speechSynthesis.cancel();
    },
    getEnglishVoices() {
      return getEnglishVoices(speechSynthesis);
    },
    onVoicesChanged(callback) {
      if (typeof speechSynthesis.addEventListener !== 'function') {
        return () => {};
      }

      const handler = () => callback(getEnglishVoices(speechSynthesis));
      speechSynthesis.addEventListener('voiceschanged', handler);
      return () => speechSynthesis.removeEventListener?.('voiceschanged', handler);
    }
  };
}
