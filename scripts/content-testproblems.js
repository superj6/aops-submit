const mwBody = document.getElementsByClassName('mw-body')[0];
const wikiTables = mwBody.getElementsByClassName('wikitable');
const answerKeyLink = wikiTables.length > 1 ? wikiTables[0].getElementsByTagName('a')[1] : undefined;
const problemParts = Array.from(mwBody.querySelectorAll('#toc ~ h2, #toc ~ h3, #toc ~ p')).slice(0, -2);

var utils;
async function initImports(){
  const src = chrome.runtime.getURL("/scripts/utils.js");
  utils = await import(src);
}

function extractProblems(){
  let potentProblems = []

  problemParts.forEach(problemPart => {
    if(problemPart.tagName !== 'P'){
      potentProblems.push([])
    }
    potentProblems.at(-1).push(problemPart)
  });

  return potentProblems.filter(problem => problem.length > 1);
}

function getDomFromUrl(url){
  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    });
}

function addonToProblem(problem, idx){
  addonDiv = document.createElement('div');
  addonDiv.innerHTML = `
    <p id="problem-status-${idx}">Not submitted</p>
    <input id="problem-input-${idx}"/>
    <button id="problem-button-${idx}">Submit</button>
  `;
  
  addonDiv.querySelector(`#problem-button-${idx}`).addEventListener('click', async () => {
    submission = document.getElementById(`problem-input-${idx}`).value;
    if(!submission) return;

    const solutionUrl = problem.at(-1).getElementsByTagName('a')[0].href;

    const solDoc = await getDomFromUrl(solutionUrl);
    const latexImgs = Array.from(solDoc.getElementsByClassName('latex'));
    answer = latexImgs.reduce((accum, latexImg) => {
      //extract latex with boxed answer
      if(latexImg.alt.includes('box')){
        const regMatch = latexImg.alt.match(/\((.*?)\)/) || latexImg.alt.match(/{(.*?)}/);
        accum = regMatch[1];
      }
      return accum;
    });

    document.getElementById(`problem-status-${idx}`).textContent = 
      submission === answer ? 'Correct submission' : 'Wrong submission';
      
  });

  problem[0].parentNode.insertBefore(addonDiv, problem.at(-1));
}

async function main(){
  await initImports();

  const problems = extractProblems();
  problems.forEach(addonToProblem);
}

main();
