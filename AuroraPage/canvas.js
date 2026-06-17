"use strict";
function useWebGL() {

  //Choose correct function for browser.
  //Paul Irish wrote this and gave it away.
  window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
  })();
            
  //catch when windows resizes, call onWindowResize()
  window.addEventListener( 'resize', onWindowResize, false );
  
  var samplesPerPixel = 1;
  //  x = 1     --> No AA (default).
  //  x > 1     --> Supersample Anti Aliasing.
  //  0 < x < 1 --> Reduced res
  //  x <= 0    --> I hate you so much...
  //  Could be useful for high-res displays with mediocre GPUs.
  //  Remember, we switched from SSAA to MSAA for a reason. SSAA is pig slow.
  //  And yes I realize I should have just made it 2^x but I like linearity.
	
  var canvas = document.getElementById('c');
  var gl = null;
  
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  }
  catch(e) {}
  
  if (!gl) {
    alert('Your browser or computer itself cannot support WebGL');
  }
  
  gl.clearColor(0.0,0.2,0.3,1.0);
  var time = Math.random() * 100000;  //randomly start, scaled up to equivalent
                                      //of several hours of runtime.
	
  var vertexPosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
  var vertices = [-1.0,1.0, 1.0,1.0, 1.0,-1.0, -1.0,1.0, 1.0,-1.0, -1.0,-1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
  var vs = document.getElementById('vertex-shader-aurora').innerHTML;
  var fs = document.getElementById('fragment-shader-aurora').innerHTML;
			
  var program = gl.createProgram();
  var vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vshader, vs);
  gl.compileShader(vshader);
  var fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fshader, fs);
  gl.compileShader(fshader);
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);	
  gl.useProgram(program);
	
	var uniSamples = gl.getUniformLocation(program,'samples');
	gl.uniform1f(uniSamples, Math.sqrt(samplesPerPixel));
	
  var uniTime = gl.getUniformLocation(program,'time');
  gl.uniform1f(uniTime, time);
		
  var uniRes = gl.getUniformLocation(program, 'res');
  gl.uniform2f(uniRes, canvas.width, canvas.height);
	
  program.vertexPosAttrib = gl.getAttribLocation(program, 'pos');
  gl.enableVertexAttribArray(program.vertexPosAttrib);
  gl.vertexAttribPointer(program.vertexPosAttrib, 2, gl.FLOAT, false, 0, 0);
	
  onWindowResize();
  animate();
  
  //Sphere-based variables.
  
  var aSphVert;
  var aSphNorm;
  var aSphUV;
  var numVertGlobe;
  
  //Generate the points of a sphere, not geosphere, with axis laying on x-axis
  //latBands are strips from pole to pole.
  //longBands are strips parallel to equator.
  //r is Radius, units all depend on your implementation.
  //cX, cY, cZ are X,Y,Z coordinates of center.
  //
  //Sample Usage: var aSphere = generateSphere(20,5,4,1,2,3);
  //Creates a radius 4 sphere centred at (x,y,z) -> (1,2,3) with 20 "timezone" 
  //wedges each divided into 5 strips. The poles would be at X=-1, and X=7.
  
  function generateSphere(latBands, longBands, r, cX, cY, cZ) {
    //Worker code is kept in main HTML script tag.
    //Probably for production code I'd want to load this from an XML file.
    var sphVertBlob = new Blob([document.querySelector('#workerGenSphVert').textContent]);
    var sphVertWorker = new Worker(window.URL.createObjectURL(sphVertBlob));
    sphVertWorker.onmessage = function(e) {
      aSphVert = e.data.split(',');
    }
    sphVertWorker.postMessage(latBands + ',' + longBands + ',' + r + ',' + cX + ',' + cY + ',' + cZ); //Spawn thread to calc vertex positions.
    
    var sphNormBlob = new Blob([document.querySelector('#workerGenSphNorm').textContent]);
    var sphNormWorker = new Worker(window.URL.createObjectURL(sphNormBlob));
    sphNormWorker.onmessage = function(e) {
      aSphNorm = e.data.split(',');
    }
    sphNormWorker.postMessage(latBands + ',' + longBands + ',' + r + ',' + cX + ',' + cY + ',' + cZ); //Spawn thread to calc vertex normals.
    
    var sphUVBlob = new Blob([document.querySelector('#workerGenSphUV').textContent]);
    var sphUVWorker = new Worker(window.URL.createObjectURL(sphUVBlob));
    sphNormWorker.onmessage = function(e) {
      aSphUV = e.data.split(',');
    }
    sphUVWorker.postMessage(latBands + ',' + longBands + ',' + r + ',' + cX + ',' + cY + ',' + cZ); //Spawn thread to calc vertex UV coords.
  }
		
  function onWindowResize(event) {
    canvas.width = window.innerWidth * Math.sqrt(samplesPerPixel);
    canvas.height = window.innerHeight * Math.sqrt(samplesPerPixel);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniRes, canvas.width, canvas.height);
  }
			
  function animate() {
    //Constant time per step will just slow the animation down if framerate dip
    //and that's better than hiccups... which people think is video looping.
    //Of course this is procedural and thus continuous until you run out of
    //floating point precision.
    time += 0.065;
    gl.uniform1f(uniTime, time);
    renderAurora();
  }
	
  function renderAurora() {
    window.requestAnimFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }	
}
