const MIN_SPEECH_RATE = 0.7;
const MAX_SPEECH_RATE = 1.2;
const DEFAULT_SPEECH_RATE = 1;
const SYNTHESIS_METHODS = ['cancel', 'getVoices', 'pause', 'resume', 'speak'];

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
    .filter((voice) => typeof voice.lang === 'string' && voice.lang.startsWith('en'));
}

function selectEnglishVoice(voices) {
  return (
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
      }
    };
  }

  return {
    supported: true,
    speak(text, rate = DEFAULT_SPEECH_RATE) {
      speechSynthesis.cancel();

      const utterance = new Utterance(text);
      const voice = selectEnglishVoice(getEnglishVoices(speechSynthesis));

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
    }
  };
}
