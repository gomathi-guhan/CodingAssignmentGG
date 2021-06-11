const searchButtonId = document.getElementById('searchButton');
searchButtonId.addEventListener('click', searchRes);
function searchRes() {
  searchContentHandle();
}
const clearButtonId = document.getElementById('clear');
clearButtonId.addEventListener('click', searchRes);

const searchContentHandle = () => {
  setSearchFocus();
  const search = document.getElementById('search');
  search.addEventListener('input', showClearTxtBtn);
  const clear = document.getElementById('clear');
  clear.addEventListener('click', clearSearchTxt);
  clear.addEventListener('keydown', clrPushListener);
  const form = document.getElementById('searchBar');
  form.addEventListener('submit', submitTheSearchResultFn);
};

const submitTheSearchResultFn = event => {
  event.preventDefault();
  delSearchResults();
  processTheSearchFn();
  setSearchFocus();
};

const processTheSearchFn = async () => {
  clearStatsLine();
  const searchTerm = getSearchTerm();
  if (searchTerm === '') return;
  const resultArray = await retrieveSearchResults(searchTerm);
  if (resultArray.length) buildSearchResultOutput(resultArray);
  setStatsLine(resultArray.length);
};

const getSearchTerm = () => {
  const rawSearchTerm = document.getElementById('search').value.trim();
  const regex = /[ ]{2,}/gi;
  const searchTerm = rawSearchTerm.replaceAll(regex, ' ');
  return searchTerm;
};

const retrieveSearchResults = async searchTerm => {
  const wikiSearchString = getWikiSearchString(searchTerm);
  const wikiSearchResults = await requestDataHandle(wikiSearchString);
  let resultArray = [];
  if (wikiSearchResults.hasOwnProperty('query')) {
    resultArray = processWikiResults(wikiSearchResults.query.pages);
  }
  return resultArray;
};

const getWikiSearchString = searchTerm => {
  const maxChars = getMaxChars();
  const rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
  const searchString = encodeURI(rawSearchString);
  return searchString;
};

const getMaxChars = () => {
  const width = window.innerWidth || document.body.clientWidth;
  let maxChars;
  if (width < 414) maxChars = 65;
  if (width >= 414 && width < 1400) maxChars = 100;
  if (width >= 1400) maxChars = 130;
  return maxChars;
};

const requestDataHandle = async searchString => {
  try {
    const response = await fetch(searchString);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};

const processWikiResults = results => {
  const resultArray = [];
  Object.keys(results).forEach(key => {
    const id = key;
    const title = results[key].title;
    const text = results[key].extract;
    const img = results[key].hasOwnProperty('thumbnail')
      ? results[key].thumbnail.source
      : null;
    const item = {
      id: id,
      title: title,
      img: img,
      text: text
    };
    resultArray.push(item);
  });
  return resultArray;
};

const setSearchFocus = () => {
  document.getElementById('search').focus();
};

const showClearTxtBtn = () => {
  const search = document.getElementById('search');
  const clear = document.getElementById('clear');
  if (search.value.length) {
    clear.classList.remove('none');
    clear.classList.add('flex');
  } else {
    clear.classList.add('none');
    clear.classList.remove('flex');
  }
};

const clearSearchTxt = event => {
  event.preventDefault();
  document.getElementById('search').value = '';
  const clear = document.getElementById('clear');
  clear.classList.add('none');
  clear.classList.remove('flex');
  setSearchFocus();
};

const clrPushListener = event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    document.getElementById('clear').click();
  }
};

const delSearchResults = () => {
  const parentElement = document.getElementById('searchResults');
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const buildSearchResultOutput = resultArray => {
  resultArray.forEach(result => {
    const resultItem = createResultItem(result);
    const resultContents = document.createElement('div');
    resultContents.classList.add('resultContents');
    if (result.img) {
      const resultImage = createResultImage(result);
      resultContents.append(resultImage);
    }
    const resultText = createResultText(result);
    resultContents.append(resultText);
    resultItem.append(resultContents);
    const searchResults = document.getElementById('searchResults');
    searchResults.append(resultItem);
  });
};

const createResultItem = result => {
  const resultItem = document.createElement('div');
  resultItem.classList.add('resultItem');
  const resultTitle = document.createElement('div');
  resultTitle.classList.add('resultTitle');
  const link = document.createElement('a');
  link.href = `https://en.wikipedia.org/?curid=${result.id}`;
  link.textContent = result.title;
  link.target = '_blank';
  resultTitle.append(link);
  resultItem.append(resultTitle);
  return resultItem;
};

const createResultImage = result => {
  const resultImage = document.createElement('div');
  resultImage.classList.add('resultImage');
  const img = document.createElement('img');
  img.src = result.img;
  img.alt = result.title;
  resultImage.append(img);
  return resultImage;
};

const createResultText = result => {
  const resultText = document.createElement('div');
  resultText.classList.add('resultText');
  const resultDescription = document.createElement('p');
  resultDescription.classList.add('resultDescription');
  resultDescription.textContent = result.text;
  resultText.append(resultDescription);
  return resultText;
};

const clearStatsLine = () => {
  document.getElementById('stats').textContent = '';
};

const setStatsLine = numberOfResults => {
  const statLine = document.getElementById('stats');
  if (numberOfResults) {
    statLine.textContent = `Displaying ${numberOfResults} results.`;
  } else {
    statLine.textContent = 'Sorry, no results.';
  }
};
