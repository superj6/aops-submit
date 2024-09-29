const mwBody = document.getElementsByClassName('mw-body')[0];
const problemList = mwBody.querySelector('ul ul') 
  || mwBody.getElementsByTagName('ul')[0];
const testNode = problemList.parentElement.parentElement.querySelector(':scope > li') 
  || (problemList.previousElementSibling != mwBody.getElementsByTagName('p')[0] 
  ? mwBody.getElementsByTagName('a')[0].parentElement 
  : problemList.getElementsByTagName('li')[0]);
const problemNodes = Array.from(problemList.getElementsByTagName('li'))
  .slice(testNode.tagName == 'LI' && testNode.parentElement == problemList ? (testNode.nextElementSibling.textContent.match(/[aA]nswer/) ? 2 : 1) : 0);
const testUrl = testNode.getElementsByTagName('a')[0].href;


var utils;
var testStatus;

async function initImports(){
  const src = chrome.runtime.getURL("/scripts/utils.js");
  utils = await import(src);
}

function displayTestStatus(){
  statusText = document.createElement('p');
  statusText.textContent = utils.testStatusToSummaryString(testStatus);

  testNode.insertBefore(statusText, testNode.getElementsByTagName('a')[0].nextSibling);
}

function displayProblemStatus(problemNode, idx){
  statusText = document.createElement('p');
  statusText.textContent = utils.statusTypes.problem[testStatus ? testStatus[idx] : 0];

  problemNode.appendChild(statusText);
}

async function main(){
  await initImports();

  testStatus = await utils.getTestStatus(testUrl);

  displayTestStatus();
  problemNodes.forEach(displayProblemStatus);
}

main();
