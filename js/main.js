var svgString;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var containerPng;
var img, img2;
var svg;
var url;
var imgContainSmt = false;
//Afficher les img
function initBg() {
  clearPreviousPattern();
  //récupere les infos du dom et convertie en string
  svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));

  var DOMURL = self.URL || self.webkitURL || self;
  img = new Image();
  img2 = new Image();
  svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  url = DOMURL.createObjectURL(svg);

  img.onload = function () {
    //init canvas with img
    ctx.drawImage(img, 0, 0);
    png = canvas.toDataURL("image/png");

    //create img élément
    /*containerPng = document.createElement("div");
    document.body.appendChild(containerPng);
    containerPng.innerHTML = '<img src="'+png+'"/>';*/
    //document.querySelector('#png-container').innerHTML = '<img src="'+png+'"/>';

    DOMURL.revokeObjectURL(png);

    document.querySelectorAll('.bg').forEach(el => el.style.backgroundImage = 'url(' + canvas.toDataURL("image/png") + ')');
  }
  img.src = url;
  imgContainSmt = true;
}

//clear before redraw pattern
function clearPreviousPattern() {
  document.querySelectorAll('.bg').forEach(el => el.style.backgroundImage = 'none');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (containerPng) {
    containerPng.remove();
  }
}


var nbScreen = localStorage.getItem('nbScreen');

//init nbscreen if first stime
if (!nbScreen) {
  nbScreen = 0;
}
console.log('nombre de screen : ' + nbScreen);
localStorage.setItem('nbScreen', nbScreen++);

//Screen bg
$("#screen-bg").click(function () {
  html2canvas($(".bg"), {
    onrendered: function (canvas) {
      theCanvas = canvas;
      canvas.toBlob(function (blob) {
        saveAs(blob, "pattern-" + nbScreen + ".png");
      });
    }
  });
  localStorage.setItem('nbScreen', nbScreen++);
});


//download base64 img
/*var link = document.createElement("a");
document.body.appendChild(link); // for Firefox
link.setAttribute("href", png);
link.setAttribute("download", "nom.png");
link.click();*/


/////////////////////////
// Create new shape
///////////////////////////

// variable for the namespace 
const svgns = "http://www.w3.org/2000/svg";
var containerRect = [];
var id = 0;
var posX = 0;
var depX = 0;
var posY = 0;
var rx = 0;
var mySvg = document.getElementById("shape-generator");
var svgWidth = mySvg.getBoundingClientRect().width;
var valueSnap = document.getElementById("snap-range").value;
var rectSize = 10;

function newRect() {
  // make a simple rectangle
  let newRect = document.createElementNS(svgns, "rect");
  if (posX > svgWidth / 4) {
    posX = 0;
    depX = 0;
    posY += rectSize;
  }
  if (posY > mySvg.getBoundingClientRect().height / 4) {
    posX = 0;
    depX = 0;
    posY = 0;
  }
  newRect.setAttribute("x", posX);
  newRect.setAttribute("y", posY);
  newRect.setAttribute("rx", rx);
  newRect.setAttribute("width", rectSize);
  newRect.setAttribute("height", rectSize);
  newRect.setAttribute("fill", "#000000");
  newRect.setAttribute("data-name", "rectangle " + id);
  newRect.setAttribute("id", "draggable" + id);
  mySvg.appendChild(newRect);

  DraggableVar = "draggable" + id;
  DraggableVar = new PlainDraggable(newRect);
  containerRect.push(DraggableVar);
  getSnap(valueSnap);

  id++;
  depX++;
  posX = depX * rectSize;
  initBg();
  console.log(posX, posY, depX, id);
}


function deleteLastShape() {
  console.log(containerRect);
  containerRect.splice(-1, 1);
  mySvg.lastChild.remove();
  mySvg.lastChild.remove();
  initBg();
}

function deleteAllShape() {
  containerRect = [];
  console.log(mySvg.firstChild);
  while (mySvg.firstChild) {
    mySvg.removeChild(mySvg.firstChild);
    console.log(mySvg.firstChild);
  }
  initBg();
}

//////////////////////////
//customisation de la shape
//////////////////////////

//OPTIONS DRAG - snap 

function initSnap(changeSnap) {
  containerRect.forEach(function (item) {
    item.snap = { step: svgWidth / changeSnap };
    //item.snap = { step: 5 };
    item.onMove = function () { initBg() };
  });
}

//taille
const widthSlider = document.querySelector("#width-range");

widthSlider.addEventListener("input", e => {
  $(".bg").css('background-size', e.target.value + "px");
});

//corner
const cornerSlider = document.querySelector("#corner-range");

cornerSlider.addEventListener("input", e => {
  console.log("rx value : " + e.target.value);
  rx = e.target.value;
  $("svg rect").each(function () {
    $(this).attr("rx", e.target.value);
  });
  initBg();
});

//snap
const snapSlider = document.querySelector("#snap-range");

function getSnap() {
  valueSnap = snapSlider.value;
  console.log(valueSnap);
  initSnap(valueSnap);
  console.log(document.querySelector("rect"))
}


//size container
/*
const widthContainerSlider = document.querySelector("#width-container-range");

widthContainerSlider.addEventListener("input", e => {
  mySvg.setAttribute("width", e.target.value);
  mySvg.setAttribute("height", e.target.value);
  canvas.setAttribute("width", e.target.value);
  canvas.setAttribute("height", e.target.value);
  initBg();
});*/
const sizeRectSlider = document.querySelector("#size-rect-range");

sizeRectSlider.addEventListener("input", e => {
  rectSize = e.target.value;
  containerRect.forEach(function (item) {
    console.log(item.element);
    item.element.setAttribute("width", rectSize);
    item.element.setAttribute("height", rectSize);
  });
  initBg();
});

/////////
//couleur
/////////

//changer input
var currentColor;
const couleurPicker = document.querySelector("#color-rect");
couleurPicker.addEventListener("input", function () {
  var colorPickerValue = this.value;
  console.log(selectedItem, colorPickerValue);
  selectedItem.setAttribute("fill", colorPickerValue);
  document.getElementById("color-input").innerHTML = colorPickerValue;
  initBg();
});

//selectionner un rect
var allRect = document.querySelectorAll("#shape-generator rect");
var selectedItem;
var selectedItemColor;
var colorParam = document.getElementById("color-param");

document.addEventListener('click', function (e) {
  if (e.target.tagName == "rect") {
    //store value of clicked element
    selectedItem = e.target;
    selectedItemColor = selectedItem.getAttribute("fill");
    couleurPicker.value = selectedItemColor;
    console.log(selectedItem, selectedItemColor);

    //display value
    document.getElementById("rect-selected").innerHTML = selectedItem.getAttribute("data-name");
    document.getElementById("color-input").innerHTML = selectedItemColor;
    colorParam.classList.remove("hide");

  }
  //hide param if last click isn't a rect 
  /*else{
    colorParam.classList.add("hide");
    document.getElementById("rect-selected").innerHTML = "Aucun élément selectionné";
  }*/
});


/////////////////////////
//initialiser une valeur 
///////////////////////////
snapSlider.addEventListener("input", getSnap);
$("#valid-bg").on("click", clearPreviousPattern);
$("#valid-bg").on("click", deleteAllShape);
//newRect();


/////////////////////////
// Locomotive
///////////////////////////
var scroller;

var sliderVitesseBg = document.getElementById("vitesse-bg-range");
var vitesseBg = sliderVitesseBg.value;

var sliderLerpBg = document.getElementById("lerp-bg-range");
var lerpBg = sliderLerpBg.value;

var sliderHeightBg = document.getElementById("height-bg-range");
var heightBg = sliderHeightBg.value;

var containerBg = document.querySelector('.container-bg');


sliderVitesseBg.addEventListener("input", e => {
  vitesseBg = e.target.value;
  initDivBg();
  initBg();
});

sliderLerpBg.addEventListener("input", e => {
  lerpBg = e.target.value;
  initDivBg();
  initBg();
});

sliderHeightBg.addEventListener("input", e => {
  heightBg = e.target.value;
  initDivBg();
  initBg();
});

var direction = "horizontal";

function changeDirection() {
  if (direction == "horizontal") {
    direction = "vertical";
  } else {
    direction = "horizontal";
  }
  initDivBg();
  initBg();
}

var nbDiv = 30;
function initDivBg() {
  while (containerBg.firstChild) {
    containerBg.removeChild(containerBg.firstChild);
  }
  if (scroller) {
    scroller.destroy();
  }
  for (var i = 0; i < nbDiv; i++) {
    var newBg = document.createElement("div");
    var newLerp = parseInt(lerpBg, 10) + i / nbDiv * 0.2;
    //commun
    newBg.setAttribute("data-scroll", "");
    newBg.setAttribute("data-scroll-repeat", "true");
    newBg.style.height = heightBg + "px";

    newBg.classList.add("bg");

    if (i % 2 == 0) { //impair - premier
      newBg.setAttribute("data-scroll-speed", vitesseBg);
      newBg.setAttribute("data-scroll-direction", direction);
      newBg.setAttribute("data-scroll-delay", newLerp);
    } else { //pair
      newBg.setAttribute("data-scroll-speed", vitesseBg * -1);
      newBg.setAttribute("data-scroll-direction", direction);
      newBg.setAttribute("data-scroll-delay", newLerp);
    }
    containerBg.appendChild(newBg);
  }
  newScrollClass();
}

function newScrollClass() {
  scroller = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
  });
}

initDivBg();
newRect();
