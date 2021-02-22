"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var dx = 0;
var dxLoc;
var dy = -.76;
var dyLoc;

let vertices;
let colors;

var direction = 1;
var Xvelocity = .05;
var Yvelocity = .015;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.9, .9, .9, 1.0);

    vertices = [];
    colors = [];

    //Draw Stuff
    drawSolidRectangle(vec2(.25, .25), vec2(-.25, .25), vec2(-.25, -.25), vec2(.25, -.25), vec3(1, .8, 0));
    drawSolidRectangle(vec2(.2, -.1), vec2(-.2, -.1), vec2(-.2, -.15), vec2(.2, -.15), vec3(0, 0, 0));
    drawSolidRectangle(vec2(.175, .1), vec2(.125, .1), vec2(.125, .05), vec2(.175, .05), vec3(0, 0, 0));
    drawSolidRectangle(vec2(-.175, .1), vec2(-.125, .1), vec2(-.125, .05), vec2(-.175, .05), vec3(0, 0, 0));


    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    let cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    let colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);


    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data bufferData

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "utheta");
    dxLoc = gl.getUniformLocation(program, "udx");
    dyLoc = gl.getUniformLocation(program, "udy");


    //Slider to manipulate Xvelocity
    document.getElementById("slider").onchange = function(event) {
        Xvelocity = parseFloat(event.target.value) * direction;
        console.log("slider!!!");
    }

    render();
};

//draws a solid colored triangle
function drawSolidTriangle(pt0, pt1, pt2, color) {
    //adds values to points and colors global variables
    vertices.push(pt0);
    vertices.push(pt1);
    vertices.push(pt2);

    colors.push(color);
    colors.push(color);
    colors.push(color);
}

//draws a solid colored rectangle by drawing 2 triangles
function drawSolidRectangle(pt0, pt1, pt2, pt3, color) {
    //adds values to points and colors global variables
    vertices.push(pt0);
    vertices.push(pt1);
    vertices.push(pt2);

    vertices.push(pt0);
    vertices.push(pt2);
    vertices.push(pt3);

    colors.push(color);
    colors.push(color);
    colors.push(color);
    colors.push(color);
    colors.push(color);
    colors.push(color);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

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

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    requestAnimationFrame(render);
}
