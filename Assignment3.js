"use strict";

var canvas;
var gl;

var theta = [];
var thetaLoc = [];
var dx = [];
var dxLoc = [];
var dy = [];
var dyLoc = [];

//Revolution/Circular movement variables
var speedMod = 500;
var direction = 1;

//Initializing vertices and colors for moving and static visuals
let verticesMov;
let colorsMov;
let verticesStat;
let colorsStat;

//Initializing program for moving visuals and program variable for static visuals
var program = [];
var bufferId = [];
var positionLoc = [];
let cBuffer = [];
let colorLoc = [];
var programStat;

//Initializing planet array
let planetArr;
var sunRadius = .1;

//Establishing planet object
function planet(angle, speed, radius, size) {
    this.angle = angle;
    this.speed = speed;
    this.radius = radius;
    this.size = size;
}

window.onload = function init()
{   
    planetArr = [];
    //Initialize planets
    let mercury = new planet(0, ((2*Math.PI)/121), .2, (sunRadius / 285.41 * 10));
    let venus = new planet(0, ((2*Math.PI)/308), .3, (sunRadius / 115.08 * 5));
    let earth = new planet(0, ((2*Math.PI)/500), .4, (sunRadius / 109.32 * 5));
    let mars = new planet(0, ((2*Math.PI)/941), .5, (sunRadius / 205.46 * 5));
    let jupiter = new planet(0, ((2*Math.PI)/6000), .6, (sunRadius / 9.96 * 5));
    let saturn = new planet(0, ((2*Math.PI)/14500), .7, (sunRadius / 11.96 * 5));
    let uranus = new planet(0, ((2*Math.PI)/42000), .8, (sunRadius / 27.46 * 5));
    let neptune = new planet(0, ((2*Math.PI)/82500), .9, (sunRadius / 28.28 * 5));
    planetArr.push(jupiter);
    /*planetArr.push(venus);
    planetArr.push(earth);
    planetArr.push(mars);
    planetArr.push(jupiter);
    planetArr.push(saturn);
    planetArr.push(uranus);
    planetArr.push(neptune);*/
    
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

    //Time to draw stuff
    
    //The Sun
    drawSolidRectangle(vec2(sunRadius, sunRadius), vec2(-sunRadius, sunRadius), vec2(-sunRadius, -sunRadius), vec2(sunRadius, -sunRadius), vec3(1, 1, .3), false, 0);
    drawSolidRectangle(vec2(sunRadius-.02, sunRadius-.02), vec2(-(sunRadius-.02), sunRadius-.02), vec2(-(sunRadius-.02), -(sunRadius-.02)), vec2(sunRadius-.02, -(sunRadius-.02)), vec3(1, 1, 1), false, 0);

    // Initialize programs for moving visuals

    program[0] = initShaders(gl, "mercury-shader", "fragment-shader");
    program[1] = initShaders(gl, "venus-shader", "fragment-shader");
    program[2] = initShaders(gl, "earth-shader", "fragment-shader");
    program[3] = initShaders(gl, "mars-shader", "fragment-shader");
    program[4] = initShaders(gl, "jupiter-shader", "fragment-shader");
    program[5] = initShaders(gl, "saturn-shader", "fragment-shader");
    program[6] = initShaders(gl, "uranus-shader", "fragment-shader");
    program[7] = initShaders(gl, "neptune-shader", "fragment-shader");

    //Initializing Loc arrays and drawing planets
    for (var i = 0; i < planetArr.length; i++) {
        verticesMov[i] = [];
        colorsMov[i] = [];
        drawSolidRectangle(vec2(planetArr[i].size, planetArr[i].size),
        vec2(-planetArr[i].size, planetArr[i].size), 
        vec2(-planetArr[i].size, -planetArr[i].size), 
        vec2(planetArr[i].size, -planetArr[i].size),
        vec3(1, 1, 1),
        true, i);
        gl.useProgram(program[i]);
        thetaLoc[i] = gl.getUniformLocation(program[i], "utheta");
        dxLoc[i] = gl.getUniformLocation(program[i], "udx");
        dyLoc[i] = gl.getUniformLocation(program[i], "udy");
        console.log('planet drawn');
    }
    console.log(planetArr[0].size);

    //Initializing program for static visuals
    programStat = initShaders(gl, "vertex-shader-still", "fragment-shader");

    //Button to change direction of revolution
    document.getElementById("Direction").onclick = function() {
        direction = -direction;
    }
    //Slider to manipulate revolution speed - NOT FINALIZED YET
    document.getElementById("slider").onchange = function(event) {
        speedMod = parseFloat(event.target.value);
    }

    render();
};

//draws a solid colored triangle and dictates whether its moving or not
function drawSolidTriangle(pt0, pt1, pt2, color, motion, planet) {
    if (motion) {
        verticesMov[planet].push(pt0);
        verticesMov[planet].push(pt1);
        verticesMov[planet].push(pt2);
        for (var i = 0; i < 3; i++)
            colorsMov[planet].push(color);
    } else {
        verticesStat.push(pt0);  
        verticesStat.push(pt1); 
        verticesStat.push(pt2);
        for (var i = 0; i < 3; i++)
            colorsStat.push(color);
    }
}

//draws a solid colored rectangle by using the drawSolidTriangle function twice
function drawSolidRectangle(pt0, pt1, pt2, pt3, color, motion, planet) {
    drawSolidTriangle(pt0, pt1, pt2, color, motion, planet);
    drawSolidTriangle(pt0, pt2, pt3, color, motion, planet);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Rendering the planets
    
    for (var i = 0; i < planetArr.length; i++) {
        gl.useProgram(program[i]);

        bufferId[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId[i]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMov[i]), gl.STATIC_DRAW);
    
        // Associate out shader variables with our data bufferData
    
        positionLoc[i] = gl.getAttribLocation(program[i], "aPosition");
        gl.vertexAttribPointer(positionLoc[i], 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc[i]);
    
        cBuffer[i] = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer[i]);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsMov[i]), gl.STATIC_DRAW );
        
        colorLoc[i] = gl.getAttribLocation(program[i], "aColor");
        gl.vertexAttribPointer(colorLoc[i], 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc[i]);

        //Revolving/Circular Movement
        planetArr[i].angle += planetArr[i].speed * direction;
        dx[i] = Math.cos(planetArr[i].angle) * planetArr[i].radius;
        dy[i] = Math.sin(planetArr[i].angle) * planetArr[i].radius;
        gl.uniform1f(dxLoc[i], dx[i]);
        gl.uniform1f(dyLoc[i], dy[i]);

        //Rotation
        theta[i] += .07;
        gl.uniform1f(thetaLoc[i], theta[i]);

        gl.drawArrays(gl.TRIANGLES, 0, verticesMov[i].length);
    }
    /*
    gl.useProgram(program[0]);

    bufferId[0] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId[0]);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMov[0]), gl.STATIC_DRAW);

    // Associate out shader variables with our data bufferData

    positionLoc[0] = gl.getAttribLocation(program[0], "aPosition");
    gl.vertexAttribPointer(positionLoc[0], 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc[0]);

    cBuffer[0] = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer[0]);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsMov[0]), gl.STATIC_DRAW );
    
    colorLoc[0] = gl.getAttribLocation(program[0], "aColor");
    gl.vertexAttribPointer(colorLoc[0], 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc[0]);

    //Revolving/Circular Movement
    planetArr[0].angle += planetArr[0].speed * direction;
    dx[0] = Math.cos(planetArr[0].angle) * planetArr[0].radius;
    dy[0] = Math.sin(planetArr[0].angle) * planetArr[0].radius;
    gl.uniform1f(dxLoc[0], dx[0]);
    gl.uniform1f(dyLoc[0], dy[0]);

    //Rotation
    theta[0] += .07;
    gl.uniform1f(thetaLoc[0], theta[0]);

    gl.drawArrays(gl.TRIANGLES, 0, verticesMov[0].length);*/
    
    //Starting the setup for static visual drawing
    gl.useProgram(programStat);
    
    var bufferIdStat = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdStat);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesStat), gl.STATIC_DRAW);

    var positionLocStat = gl.getAttribLocation(programStat, "aPosition");
    gl.vertexAttribPointer(positionLocStat, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocStat);

    let cBufferStat = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferStat);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsStat), gl.STATIC_DRAW );
    
    let colorLocStat = gl.getAttribLocation(programStat, "aColor");
    gl.vertexAttribPointer(colorLocStat, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocStat);

    //Drawing static visuals
    gl.drawArrays(gl.TRIANGLES, 0, verticesStat.length);

    requestAnimationFrame(render);
}