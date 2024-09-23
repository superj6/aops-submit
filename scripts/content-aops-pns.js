mwBody = document.getElementsByClassName('mw-body')[0];
potentTestNodes = mwBody.querySelectorAll('td, li');

testNodes = Array.from(potentTestNodes)
  .filter(testNode => testNode.getElementsByTagName('a').length);

testNodes.forEach(testNode => {
  statusText = document.createElement('p')
  statusText.textContent = 'Unstarted'

  testNode.appendChild(statusText);
});
