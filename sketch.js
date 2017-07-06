var dropzone;
var jsonData;
var fullKey = '';
var pElements = [];
var pTexts = [];
var inputs = [];

function setup() {
  noCanvas();

  dropzone = select('#dropzone');
  dropzone.dragOver(highlight);
  dropzone.dragLeave(unhighlight);
  dropzone.drop(gotFile, unhighlight);
}

function gotFile(file) {
  createP("File: " + file.name + " is uploaded successfully. File Size: " + file.size);
  removeExistingContent();

  if (file.subtype === 'json') {
    jsonData = loadJSON(file.data, gotJSONData);
    document.getElementById('download-btn').style.display = 'block';
  }
  else createP("File is not JSON, please upload a json file");
}

function gotJSONData(data) {
  traverseJSON(data, true, process);
}

function traverseJSON(o, firstTier, func) {
  var oLength = Object.keys(o).length;
  var index = 0;

  for (var i in o) {
    var last;

    if (index === oLength - 1) last = true;
    else last = false;

    func.apply(this, [i, o[i], last, firstTier]);

    if (o[i] !== null) {
      if (typeof(o[i]) == "object") {
        // going one step down in the object tree
        traverseJSON(o[i], false, func);
      }
    }

    index++;

    // if it's the first-tier keys of the jsonData, afte down with it, delete the key
    if (firstTier) deleteLastKey();
  }
}

// called with every property and its value
function process(key, value, last) {
  if (typeof(value) !== "object") {
    createTextInput(fullKey + '.' + key, value);
    if (last) deleteLastKey();
  } else {
    fullKey += '.' + key;
  }
}

function deleteLastKey() {
  let lastDotIndex = fullKey.lastIndexOf('.');
  fullKey = fullKey.slice(0, lastDotIndex);
}

function createTextInput(key, value) {
  pTexts.push(key);

  var p = createP(key);
  p.addClass('translate-p');
  pElements.push(p);

  var input = createInput(value);
  input.addClass('translate-input');
  var currentInputIndex = inputs.length;
  input.index = currentInputIndex;
  inputs.push(input);
  input.input(inputEvent); // input callback function
}

function inputEvent() {
  console.log(pTexts[this.index]);
  console.log(this.value());
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
  console.log('jsonData UPDATED: ', jsonData);
}

function downloadJSON() {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "new-lang.json");
  dlAnchorElem.click();
}

function removeExistingContent() {
  var oldPs = document.getElementsByClassName('translate-p');
  var oldInputs = document.getElementsByClassName('translate-input');

  while (oldPs[0]) {
    oldPs[0].parentNode.removeChild(oldPs[0]);
  }

  while (oldInputs[0]) {
    oldInputs[0].parentNode.removeChild(oldInputs[0]);
  }

  fullKey = '';
  pElements = [];
  pTexts = [];
  inputs = [];
}

function highlight() {
  dropzone.style('background-color','#ccc');
}

function unhighlight() {
  dropzone.style('background-color','#fff');
}
