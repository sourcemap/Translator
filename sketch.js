var dropzone;
var jsonData;
var fullKey = '';
var selectedLang = 'en';

var pTexts = [];
var inputs = [];
var divs = []; // divs holds all the parent keys
var spans = []; // spans holds all the last children keys
var divsWithSpans = [];

var languages;

function setup() {
  noCanvas();

  dropzone = select('#dropzone');
  dropzone.dragOver(highlight);
  dropzone.dragLeave(unhighlight);
  dropzone.drop(gotFile, unhighlight);

  languages = loadJSON('short-langs.json', createDropdownItems);
}

function gotFile(file) {
  createP("File: " + file.name + " is uploaded successfully. File Size: " + file.size + '.');
  removeExistingContent();

  if (file.subtype === 'json') {
    jsonData = loadJSON(file.data, gotJSONData);
    document.getElementById('dropAndButton').style.visibility = 'visible';
  }
  else createP("File is not JSON, please upload a json file.");
}

function gotJSONData(data) {
  traverseJSON(data, true, null, process);
}

function traverseJSON(o, firstTier, parentId, func) {
  var oLength = Object.keys(o).length;
  var index = 0;

  for (var i in o) {
    var last;

    if (index === oLength - 1) last = true;
    else last = false;

    func.apply(this, [i, o[i], last, parentId]);

    if (o[i] !== null) {
      if (typeof(o[i]) == "object") {
        // if (last && !firstTier) deleteLastKey();
        // going one step down in the object tree
        // not the firstTier, and pass in the parent's id
        let idFromFullKey = fullKey.split('.').join('');
        traverseJSON(o[i], false, idFromFullKey, func);
      }
    }

    index++;

    // if it's the first-tier keys of the jsonData, afte down with it, delete the key
    if (firstTier) deleteLastKey();
  }
}

// called with every property and its value
function process(key, value, last, parentId) {
  // if it's the end of a node, create a div with a span and input
  if (typeof(value) !== "object") {
    var div = createDiv('');
    div.addClass('translate-div');
    var marginValue = (fullKey.split('.').length - 1) * 50;
    div.style('margin-left', marginValue + 'px');
    divsWithSpans.push(div);

    var span = createSpan(key);
    spans.push(span);
    span.parent(div);

    createTextInput(fullKey + '.' + key, value, div);

    if (last) deleteLastKey();

  } else { // if it's not the end of a node, create a div, and a expand button
    var div = createDiv(key);
    div.addClass('translate-div');
    var marginValue = (fullKey.split('.').length - 1) * 50;
    div.style('margin-left', marginValue + 'px');

    var idFordivAndBtn = (fullKey + '.' + key).split('.').join('');
    div.id(idFordivAndBtn);
    // div.id(key);
    divs.push(div);

    // add a view button that can toggle the sub section
    var btn = createButton(idFordivAndBtn);
    // var btn = createButton(key);
    btn.addClass('view-btn');
    btn.mouseClicked(toggleDivs);
    btn.parent(div);

    fullKey += '.' + key;
  }

  if (parentId) {
    div.parent(select('#' + parentId));
  }
}

function toggleDivs() {
  let key = this.html();
  let selectString = '#' + key + ' .translate-div';
  $(selectString).toggle();
}

function deleteLastKey() {
  let lastDotIndex = fullKey.lastIndexOf('.');
  fullKey = fullKey.slice(0, lastDotIndex);
}

function createTextInput(key, value, div) {
  pTexts.push(key);

  var input = createInput(value);
  input.addClass('translate-input');
  var currentInputIndex = inputs.length;
  input.index = currentInputIndex;
  inputs.push(input);
  input.input(inputEvent); // input callback function
  input.parent(div);
}

function inputEvent() {
  findnUpdateJSONkey(jsonData, pTexts[this.index], this.value());
}

// use the pText e.g. '.ADMIN.BAR.Create New' to find the object in the jsonData object and update it
function findnUpdateJSONkey(object, path, value) {
  path = path.substring(1); // delete the first dot

  var stack = path.split('.');

  while(stack.length > 1){
    object = object[stack.shift()];
  }

  object[stack.shift()] = value;
}

function downloadJSON() {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", selectedLang + ".json");
  dlAnchorElem.click();
}

function removeExistingContent() {
  var oldDivs = document.getElementsByClassName('translate-div');
  var oldInputs = document.getElementsByClassName('translate-input');

  while (oldDivs[0]) {
    oldDivs[0].parentNode.removeChild(oldDivs[0]);
  }

  while (oldInputs[0]) {
    oldInputs[0].parentNode.removeChild(oldInputs[0]);
  }

  fullKey = '';
  pTexts = [];
  inputs = [];
  divs = [];
  divsWithSpans = [];
  spans = [];
}

function createDropdownItems() {
  var dropdown = select('#langMenu');

  for (let i = 0; i < Object.keys(languages).length; i++) {
    let dropdownItem = createA('#', languages[i].name + ', ' + languages[i].nativeName);
    dropdownItem.addClass('dropdown-item');
    dropdownItem.id(languages[i].code);
    dropdownItem.parent(dropdown);
  }

  callbackForDropdown();
}

function callbackForDropdown() {
  $("#langMenu a").click(function(e){
    e.preventDefault(); // cancel the link behaviour
    var selText = $(this).text();
    $("#dropdownMenuButton").text(selText);
    selectedLang = $(this)[0].id;
  });
}

function highlight() {
  dropzone.style('background-color','#e6e6e6');
}

function unhighlight() {
  dropzone.style('background-color','#fff');
}
