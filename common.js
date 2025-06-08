async function loadConfig() {
  try {
    const response = await fetch('/nohint/config.json');
    if (!response.ok) {
      throw new Error('Failed to fetch config: ' + response.status);
    }
    const json = await response.json();
    window.appConfig = json;
  } catch (error) {
    console.error('Failed to load config:', error);
  }
}

async function updateStageIds() {
  await loadConfig();

  const parentPath = window.location.pathname;
  const relativePath = parentPath.slice(root.length);
  const segments = relativePath.split('/').filter(Boolean);
  const currentStageId = segments.length > 0 ? segments[0] : null;
  if (!currentStageId) {
    console.error('Failed to get currentStageId.');
    return;
  }
  localStorage.setItem('currentStageId', currentStageId);

  const peakStageId = localStorage.getItem('peakStageId');
  if (!peakStageId) {
    localStorage.setItem('peakStageId', currentStageId);
  }
  else {
    const stages = window.appConfig.stages;
    const peakStageIndex = stages.indexOf(peakStageId);
    if (peakStageIndex == -1) {
      console.error('Reset peakStageId because it was invalid: ' + peakStageId);
      localStorage.setItem('peakStageId', currentStageId);
    }
    else if (peakStageIndex < stages.indexOf(currentStageId)) {
      localStorage.setItem('peakStageId', currentStageId);
    }
  }
}

async function handleCorrectAnswer() {
  const root = '/nohint';
  const parentLocalStorage = window.parent.localStorage;

  var appConfig = window.parent.appConfig;
  if (!appConfig) {
    await loadConfig();
    appConfig = window.appConfig;
  }

  const currentStageId = parentLocalStorage.getItem('currentStageId');
  if (!currentStageId) {
    console.error('Failed to get currentStageId.');
    return;
  }

  var targetUrl = root + '/error';
  const stages = appConfig.stages;

  const currentStageIndex = stages.indexOf(currentStageId);
  if (currentStageIndex == -1) {
    console.error('Invalid currentStageId: ' + currentStageId);
    return;
  }
  else {
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex < stages.length) {
      const nextStageId = stages[nextStageIndex];
      targetUrl = root + '/' + nextStageId;
    }
    else {
      targetUrl = root + '/tbd';
    }
  }

  window.top.location.href = targetUrl;
}

function handleWrongAnswer() {
  try {
    const parentLocalStorage = window.parent.localStorage;
    const current = parentLocalStorage.getItem('wrongAnswerCount');

    if (current === null) {
      parentLocalStorage.setItem('wrongAnswerCount', '1');
    } else {
      let count = parseInt(current, 10);
      if (isNaN(count)) {
        count = 1;
      } else {
        count += 1;
      }
      parentLocalStorage.setItem('wrongAnswerCount', count.toString());
    }
  } catch (error) {
    console.error('Failed to access localStorage of the parent window:', error);
  }
}
