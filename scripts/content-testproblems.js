const testUrl = window.location.href;

const mwBody = document.getElementsByClassName('mw-body')[0];
const wikiTables = mwBody.getElementsByClassName('wikitable');
const answerKeyLink = wikiTables.length > 1 ? wikiTables[0].getElementsByTagName('a')[1] : undefined;
const problemParts = Array.from(mwBody.querySelectorAll('#toc ~ h2, #toc ~ h3, #toc ~ p'));

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
  let potentProblems = [];

  const problemPartSols = problemParts.map(part => part.textContent.match(/[sS]olution/) ? true : false);

  problemParts.slice(0, problemPartSols.lastIndexOf(true) + 1).forEach(problemPart => {
    if(problemPart.tagName !== 'P'){
      potentProblems.push([])
    }
    potentProblems.at(-1).push(problemPart);
  });

  problems = potentProblems.filter(problem => problem[0].textContent.match(/[pP]roblem/));
}

async function processAnswerProblem(idx){
  problem = problems[idx];

  const submissionVal = utils.parseSubmissionValue(document.getElementById(`problem-input-${idx}`).value);
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
}

async function processProofProblem(idx){
  problem = problems[idx];

  const submissionVal = document.getElementById(`problem-input-${idx}`).value;
  if(!submissionVal) return;

  const problemVal = utils.latexDomToString(problem.slice(1, -1));

  const solutionUrl = problem.at(-1).getElementsByTagName('a')[0].href;
  const solDoc = await utils.getDomFromUrl(solutionUrl);
  const solMwBody = solDoc.getElementsByClassName('mw-parser-output')[0];
  const solParts = Array.from(solMwBody.querySelectorAll(':scope > h2, :scope > p'));
  const solPartTags = solParts.map(part => part.tagName.match(/H\d/) && part.textContent.match(/[sS]olution/) && !part.textContent.match(/[vV]ideo/) ? true : false);
  const solStartIdx = solPartTags.indexOf(true) + 1;
  const solEndIdx = solPartTags.indexOf(true, solStartIdx) != -1 ? solPartTags.indexOf(true, solStartIdx) : solPartTags.length;
  const answerVal = utils.latexDomToString(solParts.slice(solStartIdx, solEndIdx));

  const gradingPrompt = `Problem: """${problemVal}""".
Solution proof: """${answerVal}""".

You are given the following submission proof: """${submissionVal}""".

Grade the submission on a scale of 0-7. On the first line only output the number grade. On the following lines give a brief explanation. The submission does not need to be exactly the same as the solution for full points, but it should use some similar ideas, follow a reasonable sequence of logic, and reach the same conclusion. No deductions for being too brief or too complex as long as the steps are correct, small deductions for minor logic errors, full points deducted for entirely wrong approach. Grade leniently if the conclusion is the same, harshly otherwise.`;

  let gradingFeedback;
  try{
    gradingFeedback = await utils.getPromptCompletion(gradingPrompt);
  }catch(err){
    document.getElementById(`problem-submission-${idx}`).textContent = 'Grading error - likely need to update OpenAI API key';
    return;
  }

  const gradeVal = utils.parseSubmissionValue(gradingFeedback.split('\n')[0]);  
  const submissionStatus = gradeVal >= 6 ? 2 : 1;
  testStatus = await utils.updateProblemStatus(testUrl, idx, submissionStatus);

  document.getElementById(`problem-status-${idx}`).textContent = utils.statusTypes.problem[testStatus[idx]];
  document.getElementById(`problem-submission-${idx}`).innerHTML = `
${utils.statusTypes.submission[submissionStatus]}
<details>
    <summary style="display: list-item">Explanation</summary>
    ${gradingFeedback}
</details>`;
}

function addonToProblem(problem, idx){
  inputNode = answerKeyLink ? 'input' : 'textarea';

  addonDiv = document.createElement('div');
  addonDiv.style.border = '1px solid black';
  addonDiv.style.padding = '5px';
  addonDiv.innerHTML = `
    <p id="problem-status-${idx}">${utils.statusTypes.problem[testStatus[idx]]}</p>
    <${inputNode} id="problem-input-${idx}"></${inputNode}>
    <button id="problem-button-${idx}">Submit</button>
    <p id="problem-submission-${idx}"></p>
  `;
 
  addonDiv.querySelector(`#problem-button-${idx}`).addEventListener('click', 
    () => answerKeyLink ? processAnswerProblem(idx) : processProofProblem(idx));

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
