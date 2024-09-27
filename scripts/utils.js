function getDomFromUrl(url){
  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    });
}

function latexDomToString(pArray){
  return pArray
    .map(pNode => 
      Array.from(pNode.childNodes).reduce((accum, node) => 
        accum + (node.tagName == 'IMG' ? node.alt : node.textContent), '')
    )
    .join('\n'); 
}

function getApiKey(){
  return chrome.storage.local.get('apiKey').then(obj => obj.apiKey);
}

function setApiKey(apiKey){
  chrome.storage.local.set({'apiKey': apiKey});
}

function getPromptCompletion(query){
  return getApiKey()
    .then(apiKey => 
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{role: 'user', content: query}]
        })
      })
    )
    .then(response => response.json())
    .then(response => response.choices[0].message.content);
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
  const intMatch = val.match(/\d+/);
  if(intMatch){
    return parseInt(intMatch[0]);
  }
  return val;
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
  latexDomToString,
  getApiKey,
  setApiKey,
  getPromptCompletion,
  parseSubmissionValue,
  statusTypes,
  testStatusToSummaryString,
  getTestStatus,
  setTestStatus,
  initTestStatus,
  updateProblemStatus
};
