const mwBody = document.getElementsByClassName('mw-body')[0];
const problemList = mwBody.querySelector('ul ul') 
  || mwBody.getElementsByTagName('ul')[0];
const problemNodes = Array.from(problemList.getElementsByTagName('li'));
const testNode = problemList.parentElement.parentElement.querySelector(':scope > li') 
  || mwBody.getElementsByTagName('p')[1];
const testUrl = testNode.getElementsByTagName('a')[0].href;

var utils;
var testStatus;

async function initImports(){
  const src = chrome.runtime.getURL("/scripts/utils.js");
  utils = await import(src);
}

function displayTestStatus(){
  statusText = document.createElement('p');
  if(testStatus){
    let total = testStatus.length;
    let correct = testStatus.filter(status => status === 2).length;
    statusText.textContent = `${correct}/${total} complete`;
  }else{
    statusText.textContent = 'Not started';
  }

  testNode.appendChild(statusText);
}

function displayProblemStatus(problemNode, idx){
  statusText = document.createElement('p');
  if(testStatus){
    statusText.textContent = utils.statusTypes.problem[testStatus[idx]];
  }else{
    statusText.textContent = 'Not started';    
  }

  problemNode.appendChild(statusText);
}

async function main(){
  await initImports();

  testStatus = await utils.getTestStatus(testUrl);

  displayTestStatus();
  problemNodes.forEach(displayProblemStatus);
}

main();
