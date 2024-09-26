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

function parseSubmissionValue(val){
  //differentiate between multiple choice and numeric values
  if(isNaN(val)){
    return val;
  }else{
    return Number(val);
  }
}

function testStatusToSummaryString(testStatus){
  if(!testStatus) return 'Not started';
  let total = testStatus.length;

  let attempted = testStatus.filter(probStatus => probStatus > 0).length;
  if(!attempted) return 'Not started';

  let correct = testStatus.filter(probStatus => probStatus === 2).length;
  return `${correct}/${total} complete`;
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
    testStatus[problemIdx] = Math.max(testStatus[problemIdx], submissionStatus);
    return setTestStatus(testUrl, testStatus);
  });
}

export {
  getDomFromUrl,
  parseSubmissionValue,
  statusTypes,
  testStatusToSummaryString,
  getTestStatus,
  setTestStatus,
  initTestStatus,
  updateProblemStatus
};
