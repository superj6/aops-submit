const testUrl = window.location.href;

const mwBody = document.getElementsByClassName('mw-body')[0];
const wikiTables = mwBody.getElementsByClassName('wikitable');
const answerKeyLink = wikiTables.length > 1 ? wikiTables[0].getElementsByTagName('a')[1] : undefined;
const problemParts = Array.from(mwBody.querySelectorAll('#toc ~ h2, #toc ~ h3, #toc ~ p')).slice(0, -2);

var utils;
var testStatus;
var problems;
var answerKey;

async function initImports(){
  const src = chrome.runtime.getURL("/scripts/utils.js");
  utils = await import(src);
}

async function getAnswerKey(){
  const keyUrl = answerKeyLink.href;
  const keyDoc = await utils.getDomFromUrl(keyUrl);

  const keyMwBody = keyDoc.getElementsByClassName('mw-body')[0];
  const potentAnswers = Array.from(keyMwBody.getElementsByTagName('li').length ? keyMwBody.getElementsByTagName('li') : keyMwBody.getElementsByTagName('p'));

  //answers are either list elements or numbered in p elements

  answerKey = potentAnswers
    .filter(answer => answer.tagName == 'LI' || answer.textContent.match(/([\d]+\.)(.*)/))
    .slice(0, problems.length)
    .map(answer => utils.parseSubmissionValue(answer.tagName == 'LI' ? answer.textContent : answer.textContent.split(' ')[1]));
}

function extractProblems(){
  let potentProblems = []

  problemParts.forEach(problemPart => {
    if(problemPart.tagName !== 'P'){
      potentProblems.push([])
    }
    potentProblems.at(-1).push(problemPart);
  });

  problems = potentProblems.filter(problem => problem.length > 1);
}

function addonToProblem(problem, idx){
  addonDiv = document.createElement('div');
  addonDiv.style.border = '1px solid black';
  addonDiv.style.padding = '5px';
  addonDiv.innerHTML = `
    <p id="problem-status-${idx}">${utils.statusTypes.problem[testStatus[idx]]}</p>
    <input id="problem-input-${idx}"/>
    <button id="problem-button-${idx}">Submit</button>
    <p id="problem-submission-${idx}"></p>
  `;
  
  addonDiv.querySelector(`#problem-button-${idx}`).addEventListener('click', async () => {
    submissionVal = document.getElementById(`problem-input-${idx}`).value;
    submissionVal = utils.parseSubmissionValue(submissionVal);
    if(!submissionVal) return;

    const solutionUrl = problem.at(-1).getElementsByTagName('a')[0].href;

    const solDoc = await utils.getDomFromUrl(solutionUrl);
    const latexImgs = Array.from(solDoc.getElementsByClassName('latex'));
    answerVal = latexImgs.reduce((accum, latexImg) => {
      //extract latex with boxed answer
      if(latexImg.alt.includes('box')){
        const regMatch = latexImg.alt.match(/\((.*?)\)/) || latexImg.alt.match(/{(.*?)}/);
        accum = utils.parseSubmissionValue(regMatch[1]);
      }
      return accum;
    });

    const submissionStatus = ((answerKey ? answerKey[idx] === submissionVal : false) 
      || submissionVal === answerVal) ? 2 : 1;
    testStatus = await utils.updateProblemStatus(testUrl, idx, submissionStatus);
    
    document.getElementById(`problem-status-${idx}`).textContent = utils.statusTypes.problem[testStatus[idx]];
    document.getElementById(`problem-submission-${idx}`).textContent = utils.statusTypes.submission[submissionStatus];
  });

  problem[0].parentNode.insertBefore(addonDiv, problem.at(-1));
}

async function main(){
  await initImports();

  extractProblems();

  if(answerKeyLink) getAnswerKey();

  testStatus = await utils.getTestStatus(testUrl);
  if(!testStatus){
    testStatus = await utils.initTestStatus(testUrl, problems);
  }

  problems.forEach(addonToProblem);
}

main();
