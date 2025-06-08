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

async function handleCorrectAnswer() {
  const root = '/nohint';
  const parentLocalStorage = window.parent.localStorage;

  var appConfig = window.parent.appConfig;
  if (!appConfig) {
    await loadConfig();
    appConfig = window.appConfig;
  }

  var currentStageId = parentLocalStorage.getItem('currentStageId');
  if (!currentStageId) {
    const parentPath = window.parent.location.pathname;
    const relativePath = parentPath.slice(root.length);
    const segments = relativePath.split('/').filter(Boolean);
    currentStageId = segments.length > 0 ? segments[0] : null;
  }

  var targetUrl = root + '/error';
  const stages = appConfig.stages;

  const currentStageIndex = stages.indexOf(currentStageId);
  if (currentStageIndex == -1) {
    console.error('Invalid currentStageId.');
    parentLocalStorage.removeItem('currentStageId');
  }
  else {
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex < stages.length) {
      const nextStageId = stages[nextStageIndex];

      parentLocalStorage.setItem('currentStageId', nextStageId);

      var peakStageId = parentLocalStorage.getItem('peakStageId');
      if (!peakStageId) {
        peakStageId = nextStageId;
        parentLocalStorage.setItem('peakStageId', nextStageId);
      }

      const peakStageIndex = stages.indexOf(peakStageId);
      if (peakStageIndex == -1) {
        console.error('Invaild peakStageId.');
        parentLocalStorage.removeItem('peakStageId');
      }
      else {
        if (peakStageIndex < nextStageIndex) {
          parentLocalStorage.setItem('peakStageId', nextStageId);
        }

        targetUrl = root + '/' + nextStageId;
      }
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
