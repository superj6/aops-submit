mwBody = document.getElementsByClassName('mw-body')[0];
problemList = mwBody.querySelector('ul ul') 
  || mwBody.getElementsByTagName('ul')[0];
problemNodes = Array.from(problemList.getElementsByTagName('li'));
testNode = problemList.parentElement.parentElement.querySelector(':scope > li') 
  || mwBody.getElementsByTagName('p')[1];


(() => {
  statusText = document.createElement('p');
  statusText.textContent = 'Not started';

  testNode.appendChild(statusText);
})();

problemNodes.forEach(problemNode => {
  statusText = document.createElement('p');
  statusText.textContent = 'No submission';

  problemNode.appendChild(statusText);
});
