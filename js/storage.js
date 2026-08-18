import { STEP_IDS } from './date-progress.js';

const PLAN_LENGTH = 70;
const STATE_VERSION = 1;
const MIN_SPEECH_RATE = 0.7;
const MAX_SPEECH_RATE = 1.2;
const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.2;
const DEFAULT_SPEECH_VOICE = 'Samantha';

export const STORAGE_KEY = 'businessEnglish70.state';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidDateKey(dateKey) {
  if (typeof dateKey !== 'string') {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day, 12);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidNumberInRange(value, minimum, maximum) {
  return Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isValidDayKey(dayKey) {
  const day = Number(dayKey);

  return Number.isInteger(day) && day >= 1 && day <= PLAN_LENGTH && String(day) === dayKey;
}

function isValidCompletedDays(completedDays) {
  return (
    isPlainObject(completedDays) &&
    Object.entries(completedDays).every(([dayKey, stepIds]) =>
      isValidDayKey(dayKey) &&
      Array.isArray(stepIds) &&
      stepIds.length > 0 &&
      stepIds.every((stepId) => STEP_IDS.includes(stepId)) &&
      new Set(stepIds).size === stepIds.length
    )
  );
}

function isValidState(state) {
  return (
    isPlainObject(state) &&
    state.version === STATE_VERSION &&
    isValidDateKey(state.startDate) &&
    isValidCompletedDays(state.completedDays) &&
    isPlainObject(state.settings) &&
    isValidNumberInRange(state.settings.speechRate, MIN_SPEECH_RATE, MAX_SPEECH_RATE) &&
    (state.settings.speechVoice === undefined || typeof state.settings.speechVoice === 'string') &&
    isValidNumberInRange(state.settings.fontScale, MIN_FONT_SCALE, MAX_FONT_SCALE)
  );
}

function parseStoredState(rawState) {
  if (rawState === null) {
    return null;
  }

  try {
    const state = JSON.parse(rawState);
    return isValidState(state) ? toStateContract(state) : null;
  } catch {
    return null;
  }
}

function toStateContract(state) {
  return {
    version: STATE_VERSION,
    startDate: state.startDate,
    completedDays: Object.fromEntries(
      Object.entries(state.completedDays).map(([day, stepIds]) => [day, [...stepIds]])
    ),
    settings: {
      speechRate: state.settings.speechRate,
      speechVoice: state.settings.speechVoice ?? DEFAULT_SPEECH_VOICE,
      fontScale: state.settings.fontScale
    }
  };
}

function clamp(value, fallback, minimum, maximum) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, value));
}

function assertValidToggle(day, stepId) {
  if (!Number.isInteger(day) || day < 1 || day > PLAN_LENGTH) {
    throw new RangeError('day must be an integer from 1 to 70');
  }

  if (!STEP_IDS.includes(stepId)) {
    throw new RangeError('stepId must be a known learning step');
  }
}

export function createDefaultState(startDateKey) {
  if (!isValidDateKey(startDateKey)) {
    throw new RangeError('startDateKey must be a valid YYYY-MM-DD date');
  }

  return {
    version: STATE_VERSION,
    startDate: startDateKey,
    completedDays: {},
    settings: {
      speechRate: 1,
      speechVoice: DEFAULT_SPEECH_VOICE,
      fontScale: 1
    }
  };
}

export function loadState(storage) {
  try {
    return parseStoredState(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function createResilientStateStore(browser) {
  let storage = null;
  let persistent = true;
  let memoryState = null;

  try {
    storage = browser.localStorage;
    persistent = Boolean(
      storage &&
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function'
    );
  } catch {
    persistent = false;
  }

  function memorySnapshot() {
    return memoryState === null ? null : toStateContract(memoryState);
  }

  return {
    get persistent() {
      return persistent;
    },
    load() {
      if (!persistent) {
        return memorySnapshot();
      }

      try {
        memoryState = parseStoredState(storage.getItem(STORAGE_KEY));
      } catch {
        persistent = false;
      }

      return memorySnapshot();
    },
    save(state) {
      memoryState = toStateContract(state);

      if (!persistent) {
        return false;
      }

      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
        return true;
      } catch {
        persistent = false;
        return false;
      }
    }
  };
}

export function saveState(storage, state) {
  const stateContract = toStateContract(state);
  storage.setItem(STORAGE_KEY, JSON.stringify(stateContract));
}

export function toggleStep(state, day, stepId) {
  assertValidToggle(day, stepId);

  const dayKey = String(day);
  const currentSteps = state.completedDays[dayKey] ?? [];
  const completedDays = { ...state.completedDays };

  if (currentSteps.includes(stepId)) {
    const nextSteps = currentSteps.filter((currentStepId) => currentStepId !== stepId);

    if (nextSteps.length === 0) {
      delete completedDays[dayKey];
    } else {
      completedDays[dayKey] = nextSteps;
    }
  } else {
    completedDays[dayKey] = [...currentSteps, stepId];
  }

  return { ...state, completedDays };
}

export function updateSettings(state, patch = {}) {
  const settings = {
    ...state.settings,
    speechVoice: typeof patch.speechVoice === 'string'
      ? patch.speechVoice
      : state.settings.speechVoice,
    speechRate: clamp(
      patch.speechRate,
      state.settings.speechRate,
      MIN_SPEECH_RATE,
      MAX_SPEECH_RATE
    ),
    fontScale: clamp(
      patch.fontScale,
      state.settings.fontScale,
      MIN_FONT_SCALE,
      MAX_FONT_SCALE
    )
  };

  return { ...state, settings };
}

export function resetState(storage, startDateKey) {
  const state = createDefaultState(startDateKey);
  saveState(storage, state);
  return state;
}
