"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var dx = 0;
var dxLoc;
var dy = -.76;
var dyLoc;

//Initializing vertices and colors for moving and static visuals
let verticesMov;
let colorsMov;
let verticesStat;
let colorsStat;

var direction = 1;
var Xvelocity = .05;
var Yvelocity = .015;

//Initializing program for moving visuals and program variable for static visuals
var program;
var programStat;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);

    verticesMov = [];
    colorsMov = [];
    verticesStat = [];
    colorsStat = [];

    //Draw Stuff
    drawSolidRectangle(vec2(.25, .25), vec2(-.25, .25), vec2(-.25, -.25), vec2(.25, -.25), vec3(1, .8, 0), false);
    drawSolidRectangle(vec2(.2, -.1), vec2(-.2, -.1), vec2(-.2, -.15), vec2(.2, -.15), vec3(0, 0, 0), false);
    drawSolidRectangle(vec2(.175, .1), vec2(.125, .1), vec2(.125, .05), vec2(.175, .05), vec3(0, 0, 0), false);
    drawSolidRectangle(vec2(-.175, .1), vec2(-.125, .1), vec2(-.125, .05), vec2(-.175, .05), vec3(0, 0, 0), false);

    drawSolidRectangle(vec2(.25, .25), vec2(-.25, .25), vec2(-.25, -.25), vec2(.25, -.25), vec3(1, .8, 0), true);
    drawSolidRectangle(vec2(.2, -.1), vec2(-.2, -.1), vec2(-.2, -.15), vec2(.2, -.15), vec3(0, 0, 0), true);
    drawSolidRectangle(vec2(.175, .1), vec2(.125, .1), vec2(.125, .05), vec2(.175, .05), vec3(0, 0, 0), true);
    drawSolidRectangle(vec2(-.175, .1), vec2(-.125, .1), vec2(-.125, .05), vec2(-.175, .05), vec3(0, 0, 0), true);


    // Initialize program for moving visuals
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);



    thetaLoc = gl.getUniformLocation(program, "utheta");
    dxLoc = gl.getUniformLocation(program, "udx");
    dyLoc = gl.getUniformLocation(program, "udy");

    //Initializing program for static visuals
    programStat = initShaders(gl, "vertex-shader-still", "fragment-shader-still");

    //Slider to manipulate Xvelocity
    document.getElementById("slider").onchange = function(event) {
        Xvelocity = parseFloat(event.target.value) * direction;
        console.log("slider!!!");
    }

    render();
};

//draws a solid colored triangle and dictates whether its moving or not
function drawSolidTriangle(pt0, pt1, pt2, color, motion) {
    if (motion) {
        verticesMov.push(pt0);
        verticesMov.push(pt1);
        verticesMov.push(pt2);
        
        for (var i = 0; i < 3; i++)
            colorsMov.push(color);
    } else {
        verticesStat.push(pt0);  
        verticesStat.push(pt1); 
        verticesStat.push(pt2);

        for (var i = 0; i < 3; i++)
            colorsStat.push(color);
    }

}

//draws a solid colored rectangle by drawing 2 triangles and dictates whether its moving or not
function drawSolidRectangle(pt0, pt1, pt2, pt3, color, motion) {
    if (motion) {
        verticesMov.push(pt0);
        verticesMov.push(pt1);
        verticesMov.push(pt2);
    
        verticesMov.push(pt0);
        verticesMov.push(pt2);
        verticesMov.push(pt3);
        
        for (var i = 0; i < 6; i++)
            colorsMov.push(color);
    } else {
      verticesStat.push(pt0);  
      verticesStat.push(pt1); 
      verticesStat.push(pt2); 

      verticesStat.push(pt0); 
      verticesStat.push(pt2); 
      verticesStat.push(pt3); 

      for (var i = 0; i < 6; i++)
         colorsStat.push(color);
    }

}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Moving visual drawing
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMov), gl.STATIC_DRAW);

    // Associate out shader variables with our data bufferData

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    let cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsMov), gl.STATIC_DRAW );
    
    let colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    //bounce

    if (Math.abs(dx) > .75) {
        Xvelocity = -Xvelocity;
        direction = -direction;
    }

    dx += Xvelocity;

    if (dy < -.75)
        Yvelocity = 0.015; 
    dy += Yvelocity;
    Yvelocity -= .0001;

    theta += .07;
    gl.uniform1f(thetaLoc, theta);
    gl.uniform1f(dxLoc, dx);
    gl.uniform1f(dyLoc, dy);

    gl.drawArrays(gl.TRIANGLES, 0, verticesMov.length);

    //Static visual drawing
    gl.useProgram(programStat);

    var bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesStat), gl.STATIC_DRAW);

    // Associate out shader variables with our data bufferData

    var positionLoc2 = gl.getAttribLocation(programStat, "aPosition");
    gl.vertexAttribPointer(positionLoc2, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc2);

    let cBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsStat), gl.STATIC_DRAW );
    
    let colorLoc2 = gl.getAttribLocation(programStat, "aColor");
    gl.vertexAttribPointer(colorLoc2, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc2);

    gl.drawArrays(gl.TRIANGLES, 0, verticesStat.length);

    requestAnimationFrame(render);
}
