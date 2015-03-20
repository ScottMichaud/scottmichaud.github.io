/*
* WebCL & WebAudio Positional Demo
* Author: Scott Michaud
* License: Proprietary (so I can re-license later)
* Copyright 2015
*/

/*
*
*/

//region Forward Declares
var app = window.app || {};
window.pmAudio = window.pmAudio || {};
window.pmAudio.clAudioCtx = window.pmAudio.clAudioCtx || {};
//endregion

app.init = function () {
  "use strict";
  
  app.mouse = {x: 0, y: 0};
  
  //Particle properties.
  app.decay = 500; //Milliseconds
  app.totalParticles = 500; //Max number at any one time.
  
  app.numReady = 0;
  app.totalReady = 1; //Total number of things that need to complete
                      //After "load" event before Begin button enables.
  
  app.radioWebAudio = document.getElementById('typeWebAudio');
  app.radioCL = document.getElementById('typeWebCL');
  
  app.startStop = document.getElementById('startStop');
  app.glPoints = document.getElementById('glPoints');
  app.glPoints.width = document.getElementById('main').clientWidth;
  app.glPoints.height = document.getElementById('main').clientHeight;
  try {
    app.glCtx = app.glPoints.getContext('webgl') || app.glPoints.getContext('experimental-webgl');
  } catch (e) {}
  
  if (!app.glCtx) {
    window.console.error('Could not acquire a WebGL Context');
  }
  
  app.glCtx.clearColor(0.0, 0.0, 0.0, 0.0);
  app.glCtx.clear(app.glCtx.COLOR_BUFFER_BIT);
  
  app.map = document.getElementById('map');
  app.drawCtx = app.map.getContext('2d');
  app.map.width = document.getElementById('main').clientWidth;
  app.map.height = document.getElementById('main').clientHeight;
  app.map.addEventListener("mousedown", app.canvasLMBDown, false);
  app.map.addEventListener("mouseup", app.canvasLMBUp, false);
  app.map.addEventListener("mousemove", app.canvasMouseMove, false);
};

app.start = function () {
  "use strict";
  var i,
    tempOption,
    tempCLSelect,
    sampleLoader;
  
  tempCLSelect = document.getElementById('webclDeviceSelector');
  
  app.clCtx = new window.pmAudio.clAudioCtx();
  
  //If WebCL is present and lists devices.
  if (app.clCtx.clDevices) {
    for (i = 0; i < app.clCtx.clDevices.length; i += 1) {
      tempOption = document.createElement('option');
      tempOption.textContent = app.clCtx.clDevices[i].name;
      tempOption.setAttribute('value', i);
      tempCLSelect.appendChild(tempOption);
    }
  } else {
    document.getElementById('typeWebCL').setAttribute('disabled', 'disabled');
  }
  
  //Disable WebCL dropdown by default.
  tempCLSelect.setAttribute('disabled', 'disabled');
  document.getElementById('typeWebCL').removeAttribute('checked');
  document.getElementById('typeWebAudio').setAttribute('checked', 'checked');
  
  sampleLoader = new window.AudioSampleLoader();
  sampleLoader.src = 'assets/Water-Dirt-01.ogg';
  sampleLoader.onload = function () {
    app.rainSamples = sampleLoader.response;
    app.setReady();
  };
  sampleLoader.send();
  
  app.boid = new window.boid(30);
  app.boid.setCenter(app.map.width / 2, app.map.height / 2);
  app.boid.setTarget(app.map.width / 2, (app.map.height / 2) - 1);
  app.boid.defineBoid();
  
  app.boid.draw = function () {
    app.drawCtx.beginPath();
    app.drawCtx.moveTo(app.boid.points[0], app.boid.points[1]);
    app.drawCtx.lineTo(app.boid.points[2], app.boid.points[3]);
    app.drawCtx.lineTo(app.boid.points[4], app.boid.points[5]);
    app.drawCtx.lineTo(app.boid.points[6], app.boid.points[7]);
    app.drawCtx.fillStyle = '#000';
    app.drawCtx.fill();

    app.drawCtx.beginPath();
    app.drawCtx.arc(app.boid.location.x, app.boid.location.y, 4, 0, 2 * Math.PI);
    app.drawCtx.fillStyle = 'red';
    app.drawCtx.fill();
  };
  
  app.firstDraw();
  window.requestAnimationFrame(app.draw);
  
  window.setTimeout(function () {
    app.generateInitialParticles(app.totalParticles);
  }, 0);
};

//region Direct User Input Stuff

app.canvasLMBDown = function (e) {
  "use strict";
  
  if (e.which === 1) {
    app.boid.setCenter(app.mouse.x, app.mouse.y);
    app.boid.bIsOrienting = true;
  }
};

app.canvasLMBUp = function (e) {
  "use strict";
  
  if (e.which === 1) {
    app.boid.setTarget(app.mouse.x, app.mouse.y);
    app.boid.defineBoid();
    app.boid.bIsOrienting = false;
  }
};

app.canvasMouseMove = function (e) {
  "use strict";
  
  app.mouse.x = e.clientX - 75;
  app.mouse.y = e.clientY - 75;
};

//endregion

//region UI Element Stuff

app.beginPress = function () {
  "use strict";
  
  app.bIsRunning = true;
  app.startStop.textContent = "Stop";
  app.startStop.onclick = app.stopPress;
  
  app.lastFrame = window.performance.now();
};

app.stopPress = function () {
  "use strict";
  
  app.bIsRunning = false;
  app.startStop.textContent = "Begin";
  app.startStop.onclick = app.beginPress;
  app.glCtx.clear(app.glCtx.COLOR_BUFFER_BIT);
};

app.noOffloadSelected = function () {
  "use strict";
  
  document.getElementById('webclDeviceSelector').setAttribute('disabled', 'disabled');
  app.radioCL.removeAttribute('checked');
  app.radioWebAudio.setAttribute('checked', 'checked');
};

app.webCLOffloadSelected = function () {
  "use strict";
  
  document.getElementById('webclDeviceSelector').removeAttribute('disabled');
  app.radioCL.setAttribute('checked', 'checked');
  app.radioWebAudio.removeAttribute('checked');
};

//endregion

//region Drawing and Stuff

app.firstDraw = function () {
  "use strict";
  
  app.boid.defineBoid();
  app.boid.draw();
};

app.draw = function (timestamp) {
  "use strict";
  
  window.requestAnimationFrame(app.draw);
  
  if (app.bIsRunning) {
    app.simulateRain(timestamp);
    app.webGLDraw();
  }
  
  if (app.boid.bIsOrienting) {
    app.drawCtx.clearRect(0, 0, app.map.width, app.map.height);
    app.boid.setTarget(app.mouse.x, app.mouse.y);
    app.boid.defineBoid();
    app.boid.draw();
  }
  
  if (app.bWasResized) {
    app.bWasResized = false;
    app.drawCtx.clearRect(0, 0, app.map.width, app.map.height);
    app.boid.setTarget(app.mouse.x, app.mouse.y);
    app.boid.defineBoid();
    app.boid.draw();
  }
  
  app.lastFrame = timestamp;
};

app.simulateRain = function (timestamp) {
  "use strict";
  var i,
    deltaTime;
  
  for (i = 0; i < 3 * app.totalParticles; i += 3) {
    deltaTime = timestamp - app.lastFrame;
    
    app.pview[i + 2] -= (deltaTime / app.decay);
    
    //If particle is past decay, spawn a new one at a random location.
    //
    //New particles will have Z value of 1, which we can look for as
    //a trigger to spawn audio elsewhere.
    if (app.pview[i + 2] <= 0) {
      app.pview[i] = Math.random();
      app.pview[i + 1] = Math.random();
      app.pview[i + 2] = 1;
    }
  }
};

app.generateInitialParticles = function (number) {
  "use strict";
  var i;
  
  //Data Type AOS: {X, Y, Life}
  //X -> 32bit (4 bytes)
  //Y -> 32bit (4 bytes)
  //Life -> 32bit (4 bytes)
  //12 bytes per structure
  app.particles = new window.ArrayBuffer(number * 12);
  app.pview = new window.Float32Array(app.particles);
  app.totalParticles = number;
  
  for (i = 0; i < (3 * number); i += 3) {
    app.pview[i] = Math.random();
    app.pview[i + 1] = Math.random();
    app.pview[i + 2] = Math.random();
  }
  
  app.setReady();
};

app.setReady = function () {
  "use strict";
  
  app.numReady += 1;
  
  if (app.numReady === app.totalReady) {
    app.whenReady();
  }
};

app.whenReady = function () {
  "use strict";
  
  app.webGLPrepare();
  app.startStop.removeAttribute('disabled');
};

app.webGLPrepare = function () {
  "use strict";
  var fs,
    vs;
  
  vs = window.getShader(app.glCtx, 'vtxRainPoints');
  fs = window.getShader(app.glCtx, 'pxRainPoints');
  
  app.shaderProgram = app.glCtx.createProgram();
  app.glCtx.attachShader(app.shaderProgram, vs);
  app.glCtx.attachShader(app.shaderProgram, fs);
  app.glCtx.linkProgram(app.shaderProgram);
  
  app.glCtx.useProgram(app.shaderProgram);
  
  app.vtxPositionAttribute = app.glCtx.getAttribLocation(app.shaderProgram, 'points');
  app.glCtx.enableVertexAttribArray(app.vtxPositionAttribute);
  
  app.vtxRainBuffer = app.glCtx.createBuffer();
  app.glCtx.bindBuffer(app.glCtx.ARRAY_BUFFER, app.vtxRainBuffer);
  app.glCtx.bufferData(app.glCtx.ARRAY_BUFFER, app.pview, app.glCtx.STATIC_DRAW);
};

app.webGLDraw = function () {
  "use strict";
  
  app.glCtx.clear(app.glCtx.COLOR_BUFFER_BIT);
  app.glCtx.bindBuffer(app.glCtx.ARRAY_BUFFER, app.vtxRainBuffer);
  app.glCtx.bufferData(app.glCtx.ARRAY_BUFFER, app.pview, app.glCtx.STATIC_DRAW);
  app.glCtx.vertexAttribPointer(app.vtxPositionAttribute, 3, app.glCtx.FLOAT, false, 0, 0);
  app.glCtx.drawArrays(app.glCtx.POINTS, 0, app.totalParticles);
};

app.resize = function () {
  "use strict";
  
  app.map.width = document.getElementById('main').clientWidth;
  app.map.height = document.getElementById('main').clientHeight;
  app.boid.setCenter(app.map.width / 2, app.map.height / 2);
  app.boid.setTarget(app.map.width / 2, (app.map.height / 2) - 1);
  app.boid.defineBoid();
    
  app.glPoints.width = app.map.width;
  app.glPoints.height = app.map.height;
  app.glCtx.viewport(0, 0, app.glPoints.width, app.glPoints.height);
  
  app.bWasResized = true;
};

//endregion

//region WebAudio Processing

//endregion

//region WebCL Audio Processing

//endregion

//region Window Event Listeners
window.addEventListener('DOMContentLoaded', app.init, false);
window.addEventListener('load', app.start, false);
window.addEventListener('resize', app.resize, false);
//endregion
