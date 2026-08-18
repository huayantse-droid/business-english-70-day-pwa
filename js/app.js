import { cycles, getCycleForDay, getFocusForDay } from './course-data.js';
import {
  buildCalendar,
  calculatePlanDay,
  calculateStreak,
  getCompletedDayNumbers,
  isPlanComplete,
  toLocalDateKey
} from './date-progress.js';
import { rerenderPreservingFocus } from './focus.js';
import { createSpeechController } from './speech.js';
import {
  createDefaultState,
  createResilientStateStore,
  toggleStep,
  updateSettings
} from './storage.js';
import {
  renderCourse,
  renderCourses,
  renderProgress,
  renderSettings,
  renderSetup,
  renderStudy,
  renderToday
} from './views.js';

const STEP_IDS = new Set(['listen', 'dictate', 'memorize', 'output']);
const PRIMARY_ROUTES = new Set(['today', 'courses', 'progress', 'settings']);

export function parseRoute(hash = '') {
  const path = String(hash).replace(/^#\/?/, '').split('/').filter(Boolean);
  const name = path[0] || 'today';

  if (PRIMARY_ROUTES.has(name) && path.length === 1) {
    return { name };
  }

  if (name === 'study' && path.length === 3) {
    const day = Number(path[1]);
    const step = path[2];

    if (Number.isInteger(day) && day >= 1 && day <= 70 && STEP_IDS.has(step)) {
      return { name: 'study', day, step };
    }

    return { name: 'today' };
  }

  if (name === 'course' && path.length === 2) {
    const id = Number(path[1]);

    if (Number.isInteger(id) && id >= 1 && id <= cycles.length) {
      return { name: 'course', id };
    }

    return { name: 'courses' };
  }

  return { name: 'today' };
}

function initializeApp() {
  const app = document.querySelector('#app');
  const primaryNav = document.querySelector('#primary-nav');
  const headerSettings = document.querySelector('#settings-link');
  const storageWarning = document.querySelector('#storage-warning');
  const status = document.querySelector('#app-status');
  const speech = createSpeechController(window);
  const stateStore = createResilientStateStore(window);
  let state = stateStore.load();
  let studyUi = createStudyUiState();

  function createStudyUiState() {
    return {
      revealOriginal: false,
      revealedLines: [],
      hiddenLanguages: []
    };
  }

  function announce(message) {
    status.textContent = '';
    window.requestAnimationFrame(() => {
      status.textContent = message;
    });
  }

  function applySettings() {
    document.documentElement.style.setProperty('--font-scale', state?.settings?.fontScale ?? 1);
  }

  function updateStorageWarning() {
    storageWarning.hidden = stateStore.persistent;
  }

  function withPersistenceStatus(message, persisted) {
    return persisted ? message : `${message}；进度仅保留在本次使用期间`;
  }

  function getCurrentPlanDay() {
    return Math.max(1, calculatePlanDay(state.startDate, new Date()));
  }

  function getCycleProgress(completedDayNumbers) {
    const complete = new Set(completedDayNumbers);

    return cycles.map((cycle) => ({
      cycle,
      completed: Array.from(
        { length: cycle.dayEnd - cycle.dayStart + 1 },
        (_, offset) => cycle.dayStart + offset
      ).filter((day) => complete.has(day)).length,
      total: cycle.dayEnd - cycle.dayStart + 1
    }));
  }

  function setPrimaryNavigation(routeName) {
    const activeName = routeName === 'study' ? 'today' : routeName === 'course' ? 'courses' : routeName;

    for (const link of document.querySelectorAll('[data-route]')) {
      if (link.dataset.route === activeName) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  function renderCurrent({ focus = false } = {}) {
    applySettings();

    if (!state) {
      primaryNav.hidden = true;
      headerSettings.hidden = true;
      app.innerHTML = renderSetup({ defaultDate: toLocalDateKey(new Date()) });

      if (focus) {
        app.focus({ preventScroll: true });
      }

      return;
    }

    const route = parseRoute(window.location.hash);
    const currentPlanDay = getCurrentPlanDay();
    primaryNav.hidden = false;
    headerSettings.hidden = false;
    setPrimaryNavigation(route.name);

    switch (route.name) {
      case 'study': {
        const cycle = getCycleForDay(route.day);
        const completedSteps = state.completedDays[String(route.day)] ?? [];
        app.innerHTML = renderStudy({
          day: route.day,
          step: route.step,
          cycle,
          focus: getFocusForDay(route.day),
          completed: completedSteps.includes(route.step),
          speechSupported: speech.supported,
          ...studyUi
        });
        break;
      }
      case 'courses':
        app.innerHTML = renderCourses({ cycles, completedDays: state.completedDays });
        break;
      case 'course':
        app.innerHTML = renderCourse({
          cycle: cycles.find((cycle) => cycle.id === route.id),
          speechSupported: speech.supported
        });
        break;
      case 'progress': {
        const completedDayNumbers = getCompletedDayNumbers(state.completedDays);
        app.innerHTML = renderProgress({
          calendar: buildCalendar(state.startDate, state.completedDays, new Date()),
          completedCount: completedDayNumbers.length,
          streak: calculateStreak(state.startDate, state.completedDays, new Date()),
          cycleProgress: getCycleProgress(completedDayNumbers)
        });
        break;
      }
      case 'settings':
        app.innerHTML = renderSettings({
          startDate: state.startDate,
          speechRate: state.settings.speechRate,
          speechVoice: state.settings.speechVoice,
          speechVoices: speech.getEnglishVoices(),
          fontScale: state.settings.fontScale
        });
        break;
      case 'today':
      default: {
        const cycle = getCycleForDay(currentPlanDay);
        app.innerHTML = renderToday({
          day: currentPlanDay,
          cycle,
          focus: getFocusForDay(currentPlanDay),
          streak: calculateStreak(state.startDate, state.completedDays, new Date()),
          completedSteps: state.completedDays[String(currentPlanDay)] ?? [],
          planComplete: isPlanComplete(state.startDate, new Date())
        });
      }
    }

    if (focus) {
      app.focus({ preventScroll: true });
    }
  }

  function renderCurrentPreservingFocus() {
    return rerenderPreservingFocus(app, () => renderCurrent());
  }

  function persistAndRender(nextState, message) {
    state = nextState;
    const persisted = stateStore.save(state);
    renderCurrentPreservingFocus();
    updateStorageWarning();
    announce(withPersistenceStatus(message, persisted));
  }

  function handleSetup(form) {
    const startDate = new FormData(form).get('startDate');
    const nextState = createDefaultState(startDate);
    persistAndRender(nextState, '学习计划已创建');

    if (window.location.hash !== '#/today') {
      window.location.hash = '#/today';
    } else {
      renderCurrent({ focus: true });
    }
  }

  function handleSettingChange(control) {
    const setting = control.dataset.setting;

    if (setting === 'startDate') {
      if (!control.value) {
        control.value = state.startDate;
        announce('请选择有效的开始日期');
        return;
      }

      if (!window.confirm('修改开始日期会改变日期与 Day 编号的对应关系，已有打卡仍按 Day 保留。确定保存吗？')) {
        control.value = state.startDate;
        return;
      }

      persistAndRender({ ...state, startDate: control.value }, '开始日期已更新');
      return;
    }

    if (setting === 'speechRate') {
      persistAndRender(updateSettings(state, { speechRate: Number(control.value) }), '朗读语速已更新');
      return;
    }

    if (setting === 'speechVoice') {
      persistAndRender(updateSettings(state, { speechVoice: control.value }), '英文声音已更新');
      return;
    }

    if (setting === 'fontScale') {
      persistAndRender(updateSettings(state, { fontScale: Number(control.value) }), '页面字号已更新');
    }
  }

  function toggleRevealedLine(lineIndex) {
    const revealed = new Set(studyUi.revealedLines);

    if (revealed.has(lineIndex)) {
      revealed.delete(lineIndex);
    } else {
      revealed.add(lineIndex);
    }

    studyUi = { ...studyUi, revealedLines: [...revealed] };
    renderCurrentPreservingFocus();
  }

  function toggleExpressionLanguage(language) {
    const hidden = new Set(studyUi.hiddenLanguages);

    if (hidden.has(language)) {
      hidden.delete(language);
    } else {
      hidden.add(language);
    }

    studyUi = { ...studyUi, hiddenLanguages: [...hidden] };
    renderCurrentPreservingFocus();
  }

  function handleAction(actionElement) {
    const action = actionElement.dataset.action;

    switch (action) {
      case 'toggle-step': {
        const day = Number(actionElement.dataset.day);
        const step = actionElement.dataset.step;
        const wasComplete = (state.completedDays[String(day)] ?? []).includes(step);
        persistAndRender(toggleStep(state, day, step), wasComplete ? '已取消完成标记' : '环节已完成');
        break;
      }
      case 'reveal-all':
        studyUi = { ...studyUi, revealOriginal: !studyUi.revealOriginal };
        renderCurrentPreservingFocus();
        break;
      case 'reveal-line':
        toggleRevealedLine(Number(actionElement.dataset.lineIndex));
        break;
      case 'toggle-expression-language':
        toggleExpressionLanguage(actionElement.dataset.language);
        break;
      case 'speak-material':
      case 'speak-expression':
        speech.speak(
          actionElement.dataset.speechText,
          state.settings.speechRate,
          state.settings.speechVoice
        );
        announce('开始朗读英文');
        break;
      case 'preview-voice':
        speech.speak(
          "Thank you for joining today's project update.",
          state.settings.speechRate,
          state.settings.speechVoice
        );
        announce('正在试听英文声音');
        break;
      case 'pause-speech':
        speech.pause();
        announce('朗读已暂停');
        break;
      case 'resume-speech':
        speech.resume();
        announce('继续朗读');
        break;
      case 'stop-speech':
        speech.stop();
        announce('朗读已停止');
        break;
      case 'open-reset':
        document.querySelector('#reset-dialog')?.showModal();
        break;
      case 'cancel-reset':
        actionElement.closest('dialog')?.close();
        break;
      case 'confirm-reset':
        state = createDefaultState(toLocalDateKey(new Date()));
        const persisted = stateStore.save(state);
        studyUi = createStudyUiState();
        renderCurrentPreservingFocus();
        updateStorageWarning();
        announce(withPersistenceStatus('计划已重新开始', persisted));
        break;
    }
  }

  function handleDocumentInteraction(event) {
    if (event.type === 'submit') {
      const form = event.target.closest('form[data-action="setup"]');

      if (form) {
        event.preventDefault();
        handleSetup(form);
      }

      return;
    }

    if (event.type === 'change') {
      const settingControl = event.target.closest('[data-setting]');

      if (settingControl && state) {
        handleSettingChange(settingControl);
      }

      return;
    }

    const actionElement = event.target.closest('[data-action]');

    if (actionElement && state) {
      handleAction(actionElement);
    }
  }

  document.addEventListener('click', handleDocumentInteraction);
  document.addEventListener('change', handleDocumentInteraction);
  document.addEventListener('submit', handleDocumentInteraction);
  window.addEventListener('hashchange', () => {
    speech.stop();
    studyUi = createStudyUiState();
    renderCurrent({ focus: true });
    window.scrollTo(0, 0);
  });

  renderCurrent();
  updateStorageWarning();
  speech.onVoicesChanged(() => {
    if (state && parseRoute(window.location.hash).name === 'settings') {
      renderCurrentPreservingFocus();
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        console.warn('离线功能暂不可用。');
      });
    });
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initializeApp();
}
