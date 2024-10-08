const mwBody = document.getElementsByClassName('mw-body')[0];
const testList = mwBody.getElementsByTagName('tbody')[0] || mwBody.getElementsByTagName('ul')[0]
const potentTestNodes = testList.querySelectorAll('td, li');

var utils;

async function initImports(){
  const src = chrome.runtime.getURL("/scripts/utils.js");
  utils = await import(src);
} 

function getTestNodes(){
  return Array.from(potentTestNodes)
    .filter(testNode => testNode.getElementsByTagName('a').length);
}

async function displayTestStatus(testNode){
  const testUrl = `${testNode.getElementsByTagName('a')[0].href}_Problems`;
  const testStatus = await utils.getTestStatus(testUrl);

  statusText = document.createElement('p');
  statusText.textContent = utils.testStatusToSummaryString(testStatus);

  testNode.appendChild(statusText);
}

async function main(){
  await initImports();
  
  const testNodes = getTestNodes();
  testNodes.forEach(displayTestStatus);
}

main();
