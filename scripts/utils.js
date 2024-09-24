function getDomFromUrl(url){
  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    });
}

export {getDomFromUrl};
