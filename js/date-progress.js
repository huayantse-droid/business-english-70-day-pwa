const PLAN_LENGTH = 70;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const STEP_IDS = Object.freeze(['listen', 'dictate', 'memorize', 'output']);

function parseLocalDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    throw new TypeError('dateKey must use YYYY-MM-DD format');
  }

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new RangeError('dateKey must be a valid local date');
  }

  return date;
}

function getLocalDateParts(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('date must be a valid Date');
  }

  return [date.getFullYear(), date.getMonth(), date.getDate()];
}

function getLocalCalendarDayNumber(date) {
  const [year, month, day] = getLocalDateParts(date);
  return Date.UTC(year, month, day) / MILLISECONDS_PER_DAY;
}

function calculatePlanDayDifference(startDateKey, currentDate) {
  const startDate = parseLocalDateKey(startDateKey);
  return getLocalCalendarDayNumber(currentDate) - getLocalCalendarDayNumber(startDate) + 1;
}

function isCompletedStepList(steps) {
  return Array.isArray(steps) && STEP_IDS.every((stepId) => steps.includes(stepId));
}

export function toLocalDateKey(date) {
  const [year, month, day] = getLocalDateParts(date);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function calculatePlanDay(startDateKey, currentDate) {
  return Math.max(0, Math.min(PLAN_LENGTH, calculatePlanDayDifference(startDateKey, currentDate)));
}

export function isPlanComplete(startDateKey, currentDate) {
  return calculatePlanDayDifference(startDateKey, currentDate) > PLAN_LENGTH;
}

export function getDayDateKey(startDateKey, day) {
  if (!Number.isInteger(day) || day < 1 || day > PLAN_LENGTH) {
    throw new RangeError('day must be an integer from 1 to 70');
  }

  const date = parseLocalDateKey(startDateKey);
  date.setDate(date.getDate() + day - 1);
  return toLocalDateKey(date);
}

export function getCompletedDayNumbers(completedDays) {
  if (!completedDays || typeof completedDays !== 'object' || Array.isArray(completedDays)) {
    return [];
  }

  return Object.entries(completedDays)
    .filter(([, steps]) => isCompletedStepList(steps))
    .map(([day]) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= PLAN_LENGTH)
    .sort((firstDay, secondDay) => firstDay - secondDay);
}

export function calculateStreak(startDateKey, completedDays, currentDate) {
  const currentPlanDay = calculatePlanDay(startDateKey, currentDate);
  const completedDaySet = new Set(
    getCompletedDayNumbers(completedDays).filter((day) => day <= currentPlanDay)
  );
  const latestCompletedDay = Math.max(0, ...completedDaySet);
  let streak = 0;

  for (let day = latestCompletedDay; completedDaySet.has(day); day -= 1) {
    streak += 1;
  }

  return streak;
}

export function buildCalendar(startDateKey, completedDays, currentDate) {
  const currentDayDifference = calculatePlanDayDifference(startDateKey, currentDate);
  const completedDaySet = new Set(getCompletedDayNumbers(completedDays));

  return Array.from({ length: PLAN_LENGTH }, (_, index) => {
    const day = index + 1;
    const isToday = currentDayDifference === day;
    let status = 'pending';

    if (completedDaySet.has(day)) {
      status = 'complete';
    } else if (isToday) {
      status = 'today';
    } else if (currentDayDifference > day) {
      status = 'missed';
    }

    return {
      day,
      dateKey: getDayDateKey(startDateKey, day),
      status,
      isToday
    };
  });
}
