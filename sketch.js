var dropzone;
var jsonData;
var fullKey = '';
var selectedLang = 'en';

var pTexts = [];
var inputs = [];
var divs = []; // divs holds all the parent keys
var spans = []; // spans holds all the last children keys
var divsWithSpans = [];

var dataContainer;

var languages = [
      {"code":"ar","name":"Arabic","nativeName":"العربية"},
      {"code":"cn","name":"Chinese","nativeName":"中文 (Zhōngwén), 汉语, 漢語"},
      {"code":"nl","name":"Dutch","nativeName":"Nederlands, Vlaams"},
      {"code":"en","name":"English","nativeName":"English"},
      {"code":"fr","name":"French","nativeName":"français, langue française"},
      {"code":"de","name":"German","nativeName":"Deutsch"},
      {"code":"el","name":"Greek, Modern","nativeName":"Ελληνικά"},
      {"code":"he","name":"Hebrew (modern)","nativeName":"עברית"},
      {"code":"id","name":"Indonesian","nativeName":"Bahasa Indonesia"},
      {"code":"it","name":"Italian","nativeName":"Italiano"},
      {"code":"ja","name":"Japanese","nativeName":"日本語 (にほんご／にっぽんご)"},
      {"code":"ko","name":"Korean","nativeName":"한국어 (韓國語), 조선말 (朝鮮語)"},
      {"code":"kj","name":"Kwanyama, Kuanyama","nativeName":"Kuanyama"},
      {"code":"la","name":"Latin","nativeName":"latine, lingua latina"},
      {"code":"lv","name":"Latvian","nativeName":"latviešu valoda"},
      {"code":"mn","name":"Mongolian","nativeName":"монгол"},
      {"code":"no","name":"Norwegian","nativeName":"Norsk"},
      {"code":"pl","name":"Polish","nativeName":"polski"},
      {"code":"pt","name":"Portuguese","nativeName":"Português"},
      {"code":"ro","name":"Romanian, Moldavian, Moldovan","nativeName":"română"},
      {"code":"ru","name":"Russian","nativeName":"русский язык"},
      {"code":"es","name":"Spanish; Castilian","nativeName":"español, castellano"},
      {"code":"sv","name":"Swedish","nativeName":"svenska"},
      {"code":"th","name":"Thai","nativeName":"ไทย"},
      {"code":"tr","name":"Turkish","nativeName":"Türkçe"},
      {"code":"vi","name":"Vietnamese","nativeName":"Tiếng Việt"}
];

function setup() {
  noCanvas();

  dropzone = select('#dropzone');
  dropzone.dragOver(highlight);
  dropzone.dragLeave(unhighlight);
  dropzone.drop(gotFile, unhighlight);

  createDropdownItems();
}

function gotFile(file) {
  dataContainer = select('#data-container');

  var resultP = createP("File: " + file.name + " is uploaded successfully. File Size: " + file.size + '.');
  resultP.parent(dataContainer);
  removeExistingContent();

  if (file.subtype === 'json') {
    jsonData = loadJSON(file.data, gotJSONData);
    document.getElementById('dropAndButton').style.visibility = 'visible';
  }
  else {
    var resultP = createP("File is not JSON, please upload a json file.");
    resultP.parent(dataContainer);
  }
}

function gotJSONData(data) {
  traverseJSON(data, true, 0, null, process);
}

function traverseJSON(o, firstTier, backSteps, parentId, func) {
  var oLength = Object.keys(o).length;
  var index = 0;

  for (var i in o) {
    var last = false;

    if (index === oLength - 1 && !firstTier) {
        last = true;
        backSteps++; // if this is the last item on this level, backsteps++
    }

    func.apply(this, [i, o[i], last, backSteps, parentId]);

    if (o[i] !== null) {
      if (typeof(o[i]) == "object") {
        // going one step down in the object tree and pass in the parent's id
        let idFromFullKey = fullKey.split('.').join('');
        traverseJSON(o[i], false, backSteps, idFromFullKey, func);
      }
    }

    index++;
  }
}

// called with every property and its value
function process(key, value, last, backSteps, parentId) {
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

    if (last) {
        deleteLastKey(backSteps);
    }

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
  } else {
    div.parent(dataContainer);
  }
}

function toggleDivs() {
  let key = this.html();
  let selectString = '#' + key + ' .translate-div';
  $(selectString).toggle();
}

function deleteLastKey(num) {
  let keys = fullKey.split('.');
  for (let j = 0; j < num; j++) {
    keys.pop();
  }
  fullKey = keys.join('.');
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
  dropzone.style('background-color','#00FFC7');
}

function unhighlight() {
  dropzone.style('background-color','#D4F1FA');
}
