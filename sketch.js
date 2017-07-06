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
  createP("File Name: " + file.name + "; File Size: " + file.size);
  removeExistingContent();

  if (file.subtype === 'json') {
    jsonData = loadJSON(file.data, gotJSONData);
    document.getElementById('save-btn').style.display = 'block';
    document.getElementById('download-btn').style.display = 'block';
  }
  else createP("File is not JSON, please upload a json file");
}

function gotJSONData(data) {
  traverseJSON(data, process);
}

function traverseJSON(o, func) {
  var oLength = Object.keys(o).length;
  var index = 0;

  for (var i in o) {
    var last;

    if (index === oLength - 1) last = true;
    else last = false;

    func.apply(this, [i, o[i], last]);

    if (o[i] !== null) {
      if (typeof(o[i]) == "object") {
        // going one step down in the object tree
        traverseJSON(o[i], func);
      }
    }

    index++;
  }
}

// called with every property and its value
function process(key, value, last) {
  if (typeof(value) !== "object") {
    createTextInput(fullKey + '.' + key);
    if (last) deleteLastKey();
  } else {
    fullKey += '.' + key;
  }
}

function deleteLastKey() {
  let lastDotIndex = fullKey.lastIndexOf('.');
  fullKey = fullKey.slice(0, lastDotIndex);
}

function createTextInput(key) {
  pTexts.push(key);

  var p = createP(key);
  p.addClass('translate-p');
  pElements.push(p);

  var input = createInput('');
  input.addClass('translate-input');
  inputs.push(input);
  input.input(inputEvent); // input callback function
}

function inputEvent() {
  console.log(this.value());
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
