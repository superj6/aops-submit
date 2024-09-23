mwBody = document.getElementsByClassName('mw-body')[0];
testList = mwBody.getElementsByTagName('tbody')[0] || mwBody.getElementsByTagName('ul')[0]
potentTestNodes = testList.querySelectorAll('td, li');

testNodes = Array.from(potentTestNodes)
    .filter(testNode => testNode.getElementsByTagName('a').length);

testNodes.forEach(testNode => {
  statusText = document.createElement('p');
  statusText.textContent = 'Not started';

  testNode.appendChild(statusText);
});
