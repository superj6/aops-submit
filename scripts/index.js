import * as utils from '/scripts/utils.js';

const apiInput = document.getElementById('api-input');
const apiButton = document.getElementById('api-button');

async function main(){
  const apiKey = await utils.getApiKey();
  if(apiKey){
    apiInput.placeholder = apiKey;
  }
}

main();

apiButton.addEventListener('click', () => {
  const apiKey = apiInput.value;
  if(apiKey){
    apiInput.placeholder = apiKey;
    apiInput.value = '';
    utils.setApiKey(apiKey);
  }
});
