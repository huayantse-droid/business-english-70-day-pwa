const STEP_META = Object.freeze([
  Object.freeze({ id: 'listen', number: '01', title: '选料与朗读', description: '先盲听，再用英文语音熟悉材料节奏' }),
  Object.freeze({ id: 'dictate', number: '02', title: '听写与核对', description: '逐句听写，按需揭晓原文并自行纠错' }),
  Object.freeze({ id: 'memorize', number: '03', title: '背诵核心表达', description: '切换中英文提示，逐条跟读商务表达' }),
  Object.freeze({ id: 'output', number: '04', title: '同步输出', description: '在真实商务场景中主动使用所学表达' })
]);

const SPEECH_UNAVAILABLE = '当前浏览器不支持英文朗读，其他学习功能仍可正常使用。';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clampDay(value) {
  const day = Number(value);
  return Number.isInteger(day) ? Math.min(70, Math.max(1, day)) : 1;
}

function toPercent(value, total) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Math.round(Math.min(1, Math.max(0, value / total)) * 100);
}

function progressAttributes(label, progress) {
  return `role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"`;
}

function renderSpeechUnavailable(supported) {
  return supported === false
    ? `<p class="speech-unavailable" role="status">${SPEECH_UNAVAILABLE}</p>`
    : '';
}

function renderSpeechControls(material, supported) {
  if (supported === false) {
    return renderSpeechUnavailable(false);
  }

  return `
    <div class="cluster" aria-label="英文朗读控制">
      <button type="button" data-action="speak-material" data-speech-text="${escapeHtml(material)}">播放英文</button>
      <button type="button" class="secondary" data-action="pause-speech">暂停</button>
      <button type="button" class="secondary" data-action="resume-speech">继续</button>
      <button type="button" class="ghost" data-action="stop-speech">停止</button>
    </div>`;
}

function renderViewHeader(eyebrow, title, description = '', headingId = '') {
  return `
    <header class="view-header">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1${headingId ? ` id="${escapeHtml(headingId)}"` : ''}>${escapeHtml(title)}</h1>
      ${description ? `<p class="lead">${escapeHtml(description)}</p>` : ''}
    </header>`;
}

function splitMaterialLines(material) {
  const normalized = String(material ?? '').trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/(?<=[.!?])\s+|\n{2,}/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isCompletedDay(stepIds) {
  return STEP_META.every(({ id }) => asArray(stepIds).includes(id));
}

export function renderSetup({ defaultDate = '' } = {}) {
  return `
    <section class="view setup-view" aria-labelledby="setup-title">
      <form class="card setup-card stack" data-action="setup">
        <p class="eyebrow">Your 70-day field journal</p>
        <h1 id="setup-title">从哪一天开始？</h1>
        <p>每天按听、写、背、说完成四个小环节。进度只保存在这台设备的当前浏览器中。</p>
        <label class="field">
          <span>计划开始日期</span>
          <input type="date" name="startDate" value="${escapeHtml(defaultDate)}" required>
        </label>
        <button type="submit">开始 70 天计划</button>
      </form>
    </section>`;
}

export function renderToday({
  day = 1,
  cycle = {},
  focus = {},
  streak = 0,
  completedSteps = [],
  planComplete = false
} = {}) {
  const safeDay = clampDay(day);
  const completed = new Set(asArray(completedSteps));
  const nextStep = STEP_META.find(({ id }) => !completed.has(id)) ?? STEP_META.at(-1);
  const progress = toPercent(completed.size, STEP_META.length);
  const allComplete = completed.size === STEP_META.length;

  return `
    <section class="view" aria-labelledby="today-title">
      <article class="card day-hero">
        <p class="kicker">Cycle ${escapeHtml(cycle.id ?? Math.ceil(safeDay / 7))} · Day ${safeDay}</p>
        <div class="day-number"><strong>${safeDay}</strong><span>/ 70</span></div>
        <h1 id="today-title">${escapeHtml(cycle.title || '今日学习')}</h1>
        <p>${escapeHtml(cycle.scene || '')}</p>
        <div class="progress-track" ${progressAttributes(`今日完成度 ${progress}%`, progress)}><span style="--progress: ${progress}%"></span></div>
      </article>

      ${planComplete ? `
        <div class="plan-complete" role="status">
          <p class="kicker">70-day milestone</p>
          <h2>70 天计划周期已结束</h2>
          <p>你仍可回顾 Day 70 的学习任务，课程手册和历史进度仍可继续访问。</p>
        </div>` : ''}

      <div class="stat-row">
        <article class="stat-card"><strong>${Math.max(0, Number(streak) || 0)}</strong><span>连续学习天数</span></article>
        <article class="stat-card"><strong>${completed.size}/4</strong><span>今日完成环节</span></article>
      </div>

      <article class="card stack">
        <div>
          <p class="kicker">Today’s focus</p>
          <h2>${escapeHtml(focus.title || '今日重点')}</h2>
          <p>${escapeHtml(focus.instruction || '')}</p>
          ${focus.acceptance ? `<p class="meta">完成标准 · ${escapeHtml(focus.acceptance)}</p>` : ''}
        </div>
        <div class="step-list">
          ${STEP_META.map((step) => `
            <a class="step-card${completed.has(step.id) ? ' is-complete' : ''}" href="#/study/${safeDay}/${step.id}">
              <span class="step-number">${step.number}</span>
              <span><h3>${step.title}</h3><p>${step.description}</p></span>
              <span class="check-mark" aria-label="${completed.has(step.id) ? '已完成' : '未完成'}">${completed.has(step.id) ? '✓' : '›'}</span>
            </a>`).join('')}
        </div>
        <a class="button" href="#/study/${safeDay}/${nextStep.id}">${allComplete ? '回顾今日学习' : completed.size ? '继续学习' : '开始今天的学习'}</a>
      </article>
    </section>`;
}

function renderStudyNavigation(day, activeStep) {
  return `
    <nav class="study-nav" aria-label="今日学习环节">
      ${STEP_META.map((step) => `
        <a href="#/study/${day}/${step.id}"${step.id === activeStep ? ' aria-current="step"' : ''}>
          <span class="visually-hidden">${step.title}</span>${step.number}
        </a>`).join('')}
    </nav>`;
}

function renderMaterialStep({ cycle, step, speechSupported, revealOriginal, revealedLines }) {
  const material = String(cycle.material ?? '');
  const lines = splitMaterialLines(material);
  const revealed = new Set(asArray(revealedLines).map(Number));
  const showAll = revealOriginal === true;

  return `
    <div class="stack">
      ${renderSpeechControls(material, speechSupported)}
      <div class="cluster">
        <button type="button" class="secondary" data-action="reveal-all" data-focus-key="reveal-all">${showAll ? '隐藏全部原文' : '显示全部原文'}</button>
      </div>
      <article class="material-card">
        <h2>${step === 'listen' ? '听前先不看原文' : '逐句核对原文'}</h2>
        ${showAll
          ? `<p class="material-copy">${escapeHtml(material)}</p>`
          : `<div class="material-copy is-concealed">${lines.map((line, index) => {
              const isRevealed = revealed.has(index);
              return `
                <div class="split">
                  <span class="${isRevealed ? '' : 'concealed-line'}"${isRevealed ? '' : ' aria-hidden="true"'}>${escapeHtml(line)}</span>
                  <button type="button" class="ghost" data-action="reveal-line" data-line-index="${index}" data-focus-key="reveal-line-${index}" aria-label="${isRevealed ? '隐藏' : '揭晓'}第 ${index + 1} 句原文">${isRevealed ? '隐藏' : '揭晓'}</button>
                </div>`;
            }).join('')}</div>`}
      </article>
    </div>`;
}

function renderMemorizeStep({ cycle, speechSupported, hiddenLanguages }) {
  const hidden = new Set(asArray(hiddenLanguages));

  return `
    <div class="stack">
      ${renderSpeechUnavailable(speechSupported)}
      <div class="cluster" aria-label="表达显示方式">
        <button type="button" class="secondary" data-action="toggle-expression-language" data-language="english" aria-label="英文显示" aria-pressed="${!hidden.has('english')}" data-focus-key="language-english">${hidden.has('english') ? '显示英文' : '隐藏英文'}</button>
        <button type="button" class="secondary" data-action="toggle-expression-language" data-language="chinese" aria-label="中文显示" aria-pressed="${!hidden.has('chinese')}" data-focus-key="language-chinese">${hidden.has('chinese') ? '显示中文' : '隐藏中文'}</button>
      </div>
      <article class="material-card">
        <h2>核心表达</h2>
        <ul class="expression-list">
          ${asArray(cycle.expressions).map((expression, index) => {
            const english = expression?.english ?? '';
            const purpose = expression?.purpose ?? '';
            return `
              <li class="expression-item">
                <div>
                  <div class="expression-english${hidden.has('english') ? ' is-hidden-text' : ''}"${hidden.has('english') ? ' aria-hidden="true"' : ''}>${escapeHtml(english)}</div>
                  <p class="expression-purpose${hidden.has('chinese') ? ' is-hidden-text' : ''}"${hidden.has('chinese') ? ' aria-hidden="true"' : ''}>${escapeHtml(purpose)}</p>
                </div>
                ${speechSupported === false ? '' : `<button type="button" class="ghost" data-action="speak-expression" data-expression-index="${index}" data-speech-text="${escapeHtml(english)}" aria-label="朗读第 ${index + 1} 条表达">▶</button>`}
              </li>`;
          }).join('')}
        </ul>
      </article>
    </div>`;
}

function renderOutputStep(cycle) {
  return `
    <article class="material-card">
      <p class="kicker">Put it to work</p>
      <h2>输出练习</h2>
      <h3>实战场景</h3>
      <p class="material-copy">${escapeHtml(cycle.outputScenario || '')}</p>
      <p class="field-help">第一版不保存文字或录音。完成练习后，请在下方自行打卡。</p>
    </article>`;
}

export function renderStudy({
  day = 1,
  step = 'listen',
  cycle = {},
  focus = {},
  completed = false,
  speechSupported = true,
  revealOriginal = false,
  revealedLines = [],
  hiddenLanguages = []
} = {}) {
  const safeDay = clampDay(day);
  const stepMeta = STEP_META.find((candidate) => candidate.id === step) ?? STEP_META[0];
  const activeStep = stepMeta.id;
  let content;

  if (activeStep === 'memorize') {
    content = renderMemorizeStep({ cycle, speechSupported, hiddenLanguages });
  } else if (activeStep === 'output') {
    content = renderOutputStep(cycle);
  } else {
    content = renderMaterialStep({ cycle, step: activeStep, speechSupported, revealOriginal, revealedLines });
  }

  const currentIndex = STEP_META.findIndex(({ id }) => id === activeStep);
  const nextStep = STEP_META[currentIndex + 1];

  return `
    <section class="view" aria-labelledby="study-title">
      ${renderViewHeader(`Day ${safeDay} · ${escapeHtml(cycle.title || '')}`, stepMeta.title, stepMeta.description, 'study-title')}
      ${renderStudyNavigation(safeDay, activeStep)}
      ${content}
      <div class="card stack" style="margin-top: 1rem">
        <div>
          <h2>${escapeHtml(focus.title || '今日重点')}</h2>
          <p>${escapeHtml(focus.acceptance || '')}</p>
        </div>
        <button type="button" class="${completed ? 'secondary' : ''}" data-action="toggle-step" data-day="${safeDay}" data-step="${activeStep}" data-focus-key="complete-step-${safeDay}-${activeStep}">${completed ? '取消完成标记' : '完成这个环节'}</button>
        ${nextStep ? `<a class="button secondary" href="#/study/${safeDay}/${nextStep.id}">进入下一环节</a>` : `<a class="button secondary" href="#/today">返回今日</a>`}
      </div>
    </section>`;
}

export function renderCourses({ cycles = [], completedDays = {} } = {}) {
  return `
    <section class="view" aria-labelledby="courses-title">
      ${renderViewHeader('10 cycles · 70 days', '课程手册', '所有周期均可自由浏览。每个主题用七天完成听、写、背、说的循环。', 'courses-title')}
      <div class="course-grid">
        ${asArray(cycles).map((cycle) => {
          const completed = Array.from({ length: 7 }, (_, offset) => cycle.dayStart + offset)
            .filter((day) => isCompletedDay(completedDays[String(day)])).length;
          const progress = toPercent(completed, 7);
          return `
            <a class="course-card" href="#/course/${escapeHtml(cycle.id)}">
              <span class="course-number">${escapeHtml(String(cycle.id).padStart(2, '0'))}</span>
              <span>
                <h2>${escapeHtml(cycle.title)}</h2>
                <p>Day ${escapeHtml(cycle.dayStart)}–${escapeHtml(cycle.dayEnd)} · ${escapeHtml(cycle.scene)}</p>
                <span class="progress-track" ${progressAttributes(`Cycle ${cycle.id} · ${cycle.title} 完成度 ${progress}%`, progress)}><span style="--progress: ${progress}%"></span></span>
              </span>
              <span aria-hidden="true">›</span>
            </a>`;
        }).join('')}
      </div>
    </section>`;
}

export function renderCourse({ cycle = {}, speechSupported = true } = {}) {
  const material = String(cycle.material ?? '');

  return `
    <section class="view" aria-labelledby="course-title">
      ${renderViewHeader(`Cycle ${cycle.id ?? ''} · Day ${cycle.dayStart ?? ''}–${cycle.dayEnd ?? ''}`, cycle.title || '课程详情', cycle.scene || '', 'course-title')}
      <div class="stack">
        <article class="material-card stack">
          <h2>英文材料</h2>
          ${renderSpeechControls(material, speechSupported)}
          <p class="material-copy">${escapeHtml(material)}</p>
        </article>
        <article class="material-card">
          <h2>核心表达</h2>
          <ul class="expression-list">
            ${asArray(cycle.expressions).map((expression, index) => `
              <li class="expression-item">
                <div><div class="expression-english">${escapeHtml(expression?.english)}</div><p class="expression-purpose">${escapeHtml(expression?.purpose)}</p></div>
                ${speechSupported === false ? '' : `<button type="button" class="ghost" data-action="speak-expression" data-expression-index="${index}" data-speech-text="${escapeHtml(expression?.english)}" aria-label="朗读第 ${index + 1} 条表达">▶</button>`}
              </li>`).join('')}
          </ul>
        </article>
        ${renderOutputStep(cycle)}
      </div>
    </section>`;
}

export function renderProgress({
  calendar = [],
  completedCount = 0,
  streak = 0,
  cycleProgress = []
} = {}) {
  const overall = toPercent(Number(completedCount), 70);

  return `
    <section class="view" aria-labelledby="progress-title">
      ${renderViewHeader('Your field journal', '70 天进度', '点选任意一天，可继续学习或补做任务。', 'progress-title')}
      <div class="stat-row">
        <article class="stat-card"><strong>${Math.max(0, Number(completedCount) || 0)}</strong><span>累计完成天数</span></article>
        <article class="stat-card"><strong>${Math.max(0, Number(streak) || 0)}</strong><span>当前连续天数</span></article>
      </div>
      <article class="card stack">
        <div class="split"><h2>学习日历</h2><span class="meta">${overall}%</span></div>
        <div class="progress-track" ${progressAttributes(`总计划完成度 ${overall}%`, overall)}><span style="--progress: ${overall}%"></span></div>
        <div class="calendar" aria-label="70 天学习日历">
          ${asArray(calendar).map((cell) => `
            <a class="calendar-cell" href="#/study/${clampDay(cell?.day)}/listen" data-status="${escapeHtml(cell?.status || 'pending')}"${cell?.isToday ? ' aria-current="date"' : ''} aria-label="Day ${clampDay(cell?.day)}，${escapeHtml(cell?.dateKey || '')}，${escapeHtml(cell?.status || 'pending')}">${clampDay(cell?.day)}</a>`).join('')}
        </div>
        <div class="calendar-legend" aria-label="日历图例">
          <span><i class="legend-dot complete"></i>已完成</span>
          <span><i class="legend-dot today"></i>今天</span>
          <span><i class="legend-dot missed"></i>待补学</span>
          <span><i class="legend-dot"></i>待完成</span>
        </div>
      </article>
      <article class="card" style="margin-top: 1rem">
        <h2>周期完成度</h2>
        <div class="cycle-progress">
          ${asArray(cycleProgress).map((entry) => {
            const cycle = entry?.cycle ?? {};
            const completed = Number(entry?.completed) || 0;
            const total = Number(entry?.total) || 7;
            const progress = toPercent(completed, total);
            return `
              <div class="cycle-row">
                <span><strong>${escapeHtml(cycle.title || entry?.title || '')}</strong><br><small>Cycle ${escapeHtml(cycle.id || entry?.id || '')}</small></span>
                <span>${completed}/${total}</span>
                <div class="progress-track" ${progressAttributes(`Cycle ${cycle.id || entry?.id || ''} 完成度 ${progress}%`, progress)}><span style="--progress: ${progress}%"></span></div>
              </div>`;
          }).join('')}
        </div>
      </article>
    </section>`;
}

function rateChoice(rate, selectedRate) {
  const value = String(rate);
  return `<label><input type="radio" name="speechRate" value="${value}" data-setting="speechRate" data-focus-key="setting-speech-rate-${value}"${Number(selectedRate) === rate ? ' checked' : ''}><span>${value}×</span></label>`;
}

export function renderSettings({
  startDate = '',
  speechRate = 1,
  speechVoice = 'Samantha',
  speechVoices = [],
  fontScale = 1
} = {}) {
  const safeScale = Number.isFinite(Number(fontScale)) ? Number(fontScale) : 1;
  const availableVoices = asArray(speechVoices);
  const voiceOptions = availableVoices.length > 0
    ? availableVoices
    : [{ name: speechVoice || 'Samantha', lang: 'en-US' }];

  return `
    <section class="view" aria-labelledby="settings-title">
      ${renderViewHeader('Made for this device', '设置', '调整学习节奏与阅读体验。更改会立即保存在当前浏览器中。', 'settings-title')}
      <div class="stack">
        <section class="settings-group stack" aria-labelledby="plan-settings">
          <h2 id="plan-settings">学习计划</h2>
          <label class="field">
            <span>计划开始日期</span>
            <input type="date" value="${escapeHtml(startDate)}" data-setting="startDate" required data-focus-key="setting-start-date">
            <small class="field-help">修改日期会改变自然日期与 Day 编号的对应关系，已有打卡仍按 Day 保留。</small>
          </label>
        </section>

        <section class="settings-group stack" aria-labelledby="speech-settings">
          <h2 id="speech-settings">英文朗读</h2>
          <fieldset class="stack">
            <legend>朗读语速</legend>
            <div class="choice-row">${[0.7, 0.85, 1, 1.2].map((rate) => rateChoice(rate, speechRate)).join('')}</div>
          </fieldset>
          <label class="field">
            <span>英文声音</span>
            <select data-setting="speechVoice" data-focus-key="setting-speech-voice">
              ${voiceOptions.map((voice) => {
                const name = String(voice?.name || '');
                const lang = String(voice?.lang || 'en');
                return `<option value="${escapeHtml(name)}"${name === speechVoice ? ' selected' : ''}>${escapeHtml(name)} (${escapeHtml(lang)})</option>`;
              }).join('')}
            </select>
            <small class="field-help">默认优先使用 Samantha；不同设备可用声音可能不同。</small>
          </label>
          <button type="button" class="secondary" data-action="preview-voice" data-focus-key="preview-speech-voice">试听声音</button>
        </section>

        <section class="settings-group stack" aria-labelledby="reading-settings">
          <h2 id="reading-settings">阅读字号</h2>
          <label class="field">
            <span>页面字号 <output>${Math.round(safeScale * 100)}%</output></span>
            <input type="range" min="0.9" max="1.2" step="0.05" value="${escapeHtml(safeScale)}" data-setting="fontScale" data-focus-key="setting-font-scale">
          </label>
        </section>

        <section class="settings-group" aria-labelledby="install-help">
          <h2 id="install-help">添加到主屏幕</h2>
          <p><strong>iPhone / iPad：</strong>在 Safari 点“分享”，再选“添加到主屏幕”。</p>
          <p><strong>Android：</strong>在 Chrome 菜单中选择“安装应用”或“添加到主屏幕”。</p>
        </section>

        <section class="settings-group" aria-labelledby="data-note">
          <h2 id="data-note">本机数据说明</h2>
          <p>进度仅保存在当前浏览器。清除网站数据、使用无痕模式或更换设备都会丢失记录，本应用不会上传学习数据。</p>
          <button type="button" class="danger" data-action="open-reset" data-focus-key="reset-plan">重新开始计划</button>
        </section>
      </div>

      <dialog id="reset-dialog" aria-labelledby="reset-title">
        <div class="dialog-body">
          <h2 id="reset-title">确认重新开始？</h2>
          <p>这会清空所有 70 天打卡记录，并以今天作为新的开始日期。此操作无法撤销。</p>
        </div>
        <div class="dialog-actions">
          <button type="button" class="secondary" data-action="cancel-reset">取消</button>
          <button type="button" class="danger" data-action="confirm-reset" data-focus-key="reset-plan">清空并重新开始</button>
        </div>
      </dialog>
    </section>`;
}
