function getDomFromUrl(url){
  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    });
}

const statusTypes = {
  problem: [
    'No attempt',
    'Wrong attempt',
    'Correct attempt'
  ],
  submission: [
    'None',
    'Wrong',
    'Correct'
  ]
}

function getTestStatus(testUrl){
  return chrome.storage.local.get(testUrl).then(obj => obj[testUrl]);
}

function setTestStatus(testUrl, testStatus){
  chrome.storage.local.set({[testUrl]: testStatus});
  return testStatus;
}

function initTestStatus(testUrl, problems){
  testStatus = Array(problems.length).fill(0);
  return setTestStatus(testUrl, testStatus);
}

function updateProblemStatus(testUrl, problemIdx, submissionStatus){
  return getTestStatus(testUrl).then(testStatus => {
    console.log(testStatus);
    testStatus[problemIdx] = Math.max(testStatus[problemIdx], submissionStatus);
    return setTestStatus(testUrl, testStatus);
  });
}

export {
  getDomFromUrl,
  statusTypes,
  getTestStatus,
  setTestStatus,
  initTestStatus,
  updateProblemStatus
};
