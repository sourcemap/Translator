var dropzone;
var jsonData;
var fullKey = '';

function setup() {
  noCanvas();

  dropzone = select('#dropzone');
  dropzone.dragOver(highlight);
  dropzone.dragLeave(unhighlight);
  dropzone.drop(gotFile, unhighlight);
}

function gotFile(file) {
  createP("File Name: " + file.name + "; File Size: " + file.size);
  console.log(file.data);
  jsonData = loadJSON(file.data, gotJSONData);
}

function gotJSONData(data) {
  console.log(data);
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
  console.log(key + " : " + value);
  if (typeof(value) !== "object") {
    createTextInput(fullKey + '.' + key);
    if (last) deleteLastKey();
  } else {
    fullKey += '.' + key;
  }
}

function deleteLastKey() {
  // debugger
  let lastDotIndex = fullKey.lastIndexOf('.');
  fullKey = fullKey.slice(0, lastDotIndex);
}

function createTextInput(key) {
  createP(key);
  createInput('');
}

function highlight() {
  dropzone.style('background-color','#ccc');
}

function unhighlight() {
  dropzone.style('background-color','#fff');
}
