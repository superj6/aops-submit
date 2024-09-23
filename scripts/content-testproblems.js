mwBody = document.getElementsByClassName('mw-body')[0];
wikiTables = mwBody.getElementsByClassName('wikitable');
answerKeyLink = wikiTables.length > 1 ? wikiTables[0].getElementsByTagName('a')[1] : undefined;
problemParts = Array.from(mwBody.querySelectorAll('#toc ~ h2, #toc ~ h3, #toc ~ p')).slice(0, -2);

potentProblems = []

problemParts.forEach(problemPart => {
  if(problemPart.tagName !== 'P'){
    potentProblems.push([])
  }
  potentProblems.at(-1).push(problemPart)
});

problems = potentProblems.filter(problem => problem.length > 1);

problems.forEach((problem, i) => {
  addonDiv = document.createElement('div');
  addonDiv.innerHTML = `
  <p id="problem-status-${i}">Not submitted</p>
  <input id="problem-input-${i}"/>
  <button id="problem-button-${i}">Submit</button>
`;
  
  addonDiv.querySelector(`#problem-button-${i}`).addEventListener('click', () => {
    submission = document.getElementById(`problem-input-${i}`).value;
    if(!submission) return;

    solutionUrl = problem.at(-1).getElementsByTagName('a')[0].href;

    fetch(solutionUrl)
      .then(response => response.text())
      .then(html => {
        parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
      })
      .then(doc => {
        latexImgs = Array.from(doc.getElementsByClassName('latex'));
        answer = latexImgs.reduce((accum, latexImg) => {
          //extract latex with boxed answer
          if(latexImg.alt.includes('box')){
            regMatch = latexImg.alt.match(/\((.*?)\)/) || latexImg.alt.match(/{(.*?)}/);
            accum = regMatch[1];
          }
          return accum;
        });

        document.getElementById(`problem-status-${i}`).textContent = 
          submission === answer ? 'Correct submission' : 'Wrong submission';
      });
  });

  problem[0].parentNode.insertBefore(addonDiv, problem.at(-1));
});
