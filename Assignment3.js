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
var speedMod = 1;
var direction = 1;

//Initializing vertices and colors for moving and static visuals
let verticesMov;
let colorsMov;
let verticesStars;
let colorsStars;

//Initializing program for moving visuals (planets and sun) and program variable for static visuals
var program = [];
var bufferId = [];
var positionLoc;
let cBuffer;
let colorLoc = [];
var programStars;

//Initializing planet array
let planetArr;

//Initializing variables to manipulate solar system
var sunRadius = .1;
var sunPosX = 0;
var sunPosY = 0;
var scaleMod = 1;

//Initializing color option arrays
let colorsDefault = [];
let colorsPride = [];
let colorsUSA = [];

//Establishing planet object
function planet(angle, speed, orbitRadius, radius, rotation, color) {
    this.angle = angle;
    this.speed = speed;
    this.orbitRadius = orbitRadius;
    this.radius = radius;
    this.rotation = rotation;
    this.color = color;
}

//Processing keyboard input
window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    switch (key) {
        case 'W':
        case 'w':
            sunPosY += .1;
            break;
        case 'A':
        case 'a':
            sunPosX -= .1;
            break;
        case 'S':
        case 's':
            sunPosY -= .1;
            break;
        case 'D':
        case 'd':
            sunPosX += .1;
            break;
    }
}

window.onload = function init()
{   
    //Display initial slider label
    displaySliderLabel('timeSpeedSlider');
    displaySliderLabel('scaleSlider');

    //Initialize color option arrays
    colorsDefault.push(vec3(.7, .7, .7), vec3(.9, .7, .7), vec3(.5, .5, 1), vec3(1, .2, .2), vec3(.824, .709, .549), vec3(1, 1, .3), vec3(.55, .55, 1), vec3(.3, .3, 1), vec3(1, 1, .3));
    
    planetArr = [];
    //Initialize planet objects
    let mercury = new planet(0, ((2*Math.PI)/121), .23, (sunRadius / 285.41 * 10), .00017, vec3(.7, .7, .7));
    let venus = new planet(0, ((2*Math.PI)/308), .27, (sunRadius / 115.08 * 5), .00004, vec3(.9, .7, .7));
    let earth = new planet(0, ((2*Math.PI)/500), .31, (sunRadius / 109.32 * 5), .01, vec3(.5, .5, 1));
    let mars = new planet(0, ((2*Math.PI)/941), .35, (sunRadius / 205.46 * 5), .0097, vec3(1, .2, .2));
    let jupiter = new planet(0, ((2*Math.PI)/6000), .5, (sunRadius / 9.96 * 5), .024, vec3(.824, .709, .549));
    let saturn = new planet(0, ((2*Math.PI)/14500), .7, (sunRadius / 11.96 * 5), .022, vec3(1, 1, .3));
    let uranus = new planet(0, ((2*Math.PI)/42000), .85, (sunRadius / 27.46 * 5), .014, vec3(.55, .55, 1));
    let neptune = new planet(0, ((2*Math.PI)/82500), .95, (sunRadius / 28.28 * 5), .015, vec3(.3, .3, 1));
    //"Not really a planet, but making it a planet makes my life easier" - Jackson
    let sun = new planet(0, 0, 0, sunRadius, .00041, vec3(1, 1, .3));
    //Pushing planet objects onto the planet array
    planetArr.push(mercury);
    planetArr.push(venus);
    planetArr.push(earth);
    planetArr.push(mars);
    planetArr.push(jupiter);
    planetArr.push(saturn);
    planetArr.push(uranus);
    planetArr.push(neptune);
    planetArr.push(sun);
    
    //Setting up canvas and other WebGL stuff, you know the drill
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    //Initializing the endless black abyss that is outerspace
    gl.clearColor(0, 0, 0, 1.0);

    verticesMov = [];
    colorsMov = [];
    verticesStars = [];
    colorsStars = [];

    //Time to draw stuff

    //Stars - time to light up the sky
    let starSize = .01
    for (let i = 0; i < 150; i++) {
        let x = Math.random()*2 - 1.0; //random number between -1 and 1
        let y = Math.random()*2 - 1.0;
        let starColor = Math.random();
        drawSolidRectangle(vec2(x, y), vec2(x-starSize, y), vec2(x-starSize, y-starSize), vec2(x, y-starSize), vec3(starColor, starColor, starColor), false, 0);
    }
    

    // Initialize programs for moving visuals
    program[0] = initShaders(gl, "mercury-shader", "fragment-shader");
    program[1] = initShaders(gl, "venus-shader", "fragment-shader");
    program[2] = initShaders(gl, "earth-shader", "fragment-shader");
    program[3] = initShaders(gl, "mars-shader", "fragment-shader");
    program[4] = initShaders(gl, "jupiter-shader", "fragment-shader");
    program[5] = initShaders(gl, "saturn-shader", "fragment-shader");
    program[6] = initShaders(gl, "uranus-shader", "fragment-shader");
    program[7] = initShaders(gl, "neptune-shader", "fragment-shader");
    program[8] = initShaders(gl, "sun-shader", "fragment-shader");

    //Initializing Loc arrays and drawing planets
    for (var i = 0; i < planetArr.length; i++) {
        drawPlanet(i);
    }

    //Initializing program for stars (static visuals)

    programStars = initShaders(gl, "stars-shader", "fragment-shader");

    //Button to change direction of revolution
    document.getElementById("Direction").onclick = function() {
        direction = -direction;
    }
    //Slider to manipulate time speed
    document.getElementById("timeSpeedSlider").onchange = function(event) {
        for (var i = 0; i < planetArr.length; i++) {
            planetArr[i].speed /= speedMod;
            planetArr[i].rotation /= speedMod;
        }
        speedMod = parseFloat(event.target.value);
        for (var i = 0; i < planetArr.length; i++) {
            planetArr[i].speed *= speedMod;
            planetArr[i].rotation *= speedMod;
        }
        displaySliderLabel('timeSpeedSlider');
    }
    
    //Slider to manipulate scale of solar system
    document.getElementById("scaleSlider").onchange = function(event) {
        for (var i = 0; i < planetArr.length; i++) {
            planetArr[i].radius /= scaleMod;
            drawPlanet(i);
        }
        scaleMod = parseFloat(event.target.value);
        for (var i = 0; i < planetArr.length; i++) {
            planetArr[i].radius *= scaleMod;
            drawPlanet(i);
        }
        displaySliderLabel('scaleSlider');
    }

    render();
};

//Function for displaying slider labels (based off code found here: https://stackoverflow.com/questions/29103818/how-can-i-retrieve-and-display-slider-range-value)
function displaySliderLabel(sliderName) {
    var val = document.getElementById(sliderName).value;
    document.getElementById(sliderName+'Output').innerHTML = val;
}

//draws a solid colored triangle and dictates whether its moving or not
function drawSolidTriangle(pt0, pt1, pt2, color, motion, planet) {
    if (motion) {
        verticesMov[planet].push(pt0);
        verticesMov[planet].push(pt1);
        verticesMov[planet].push(pt2);
        for (var i = 0; i < 3; i++)
            colorsMov[planet].push(color);
    } else {
        verticesStars.push(pt0);  
        verticesStars.push(pt1); 
        verticesStars.push(pt2);
        for (var i = 0; i < 3; i++)
            colorsStars.push(color);
    }
}

//draws a solid colored rectangle by using the drawSolidTriangle function twice
function drawSolidRectangle(pt0, pt1, pt2, pt3, color, motion, planet) {
    drawSolidTriangle(pt0, pt1, pt2, color, motion, planet);
    drawSolidTriangle(pt0, pt2, pt3, color, motion, planet);
}

//draws planet given index of planetArr
function drawPlanet(i) {
    verticesMov[i] = [];
    colorsMov[i] = [];
    // Special Case: Saturn Rings
    if (i == 5) {
        drawSolidRectangle(vec2(planetArr[i].radius+.02, planetArr[i].radius+.02),
        vec2(-(planetArr[i].radius+.02), planetArr[i].radius+.02), 
        vec2(-(planetArr[i].radius+.02), -(planetArr[i].radius+.02)), 
        vec2(planetArr[i].radius+.02, -(planetArr[i].radius+.02)),
        vec3(1, .3, 0), true, i);

        drawSolidRectangle(vec2(planetArr[i].radius+.01, planetArr[i].radius+.01),
        vec2(-(planetArr[i].radius+.01), planetArr[i].radius+.01), 
        vec2(-(planetArr[i].radius+.01), -(planetArr[i].radius+.01)), 
        vec2(planetArr[i].radius+.01, -(planetArr[i].radius+.01)),
        vec3(0, 0, 0), true, i);

        drawSolidRectangle(vec2(planetArr[i].radius, planetArr[i].radius),
        vec2(-planetArr[i].radius, planetArr[i].radius), 
        vec2(-planetArr[i].radius, -planetArr[i].radius), 
        vec2(planetArr[i].radius, -planetArr[i].radius),
        planetArr[i].color, true, i);
    } else if (i == 8) { // Special Case: The Sun
        drawSolidRectangle(vec2(planetArr[i].radius, planetArr[i].radius),
        vec2(-planetArr[i].radius, planetArr[i].radius),
        vec2(-planetArr[i].radius, -planetArr[i].radius),
        vec2(planetArr[i].radius, -planetArr[i].radius),
        vec3(1, 1, .3), true, i);

        drawSolidRectangle(vec2(planetArr[i].radius-.02, planetArr[i].radius-.02),
        vec2(-(planetArr[i].radius-.02), planetArr[i].radius-.02),
        vec2(-(planetArr[i].radius-.02), -(planetArr[i].radius-.02)),
        vec2(planetArr[i].radius-.02, -(planetArr[i].radius-.02)),
        vec3(1, 1, 1), true, i);
    } else { // The rest of the planets
        drawSolidRectangle(vec2(planetArr[i].radius, planetArr[i].radius),
        vec2(-planetArr[i].radius, planetArr[i].radius), 
        vec2(-planetArr[i].radius, -planetArr[i].radius), 
        vec2(planetArr[i].radius, -planetArr[i].radius),
        planetArr[i].color, true, i);
    }
    thetaLoc[i] = gl.getUniformLocation(program[i], "utheta");
    dxLoc[i] = gl.getUniformLocation(program[i], "udx");
    dyLoc[i] = gl.getUniformLocation(program[i], "udy");
    theta[i] = 0;
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Starting the setup for static visual drawing

    gl.useProgram(programStars);
    
    var bufferIdStars = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdStars);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesStars), gl.STATIC_DRAW);

    var positionLocStars = gl.getAttribLocation(programStars, "aPosition");
    gl.vertexAttribPointer(positionLocStars, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocStars);

    let cBufferStars = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferStars);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsStars), gl.STATIC_DRAW );
    
    let colorLocStars = gl.getAttribLocation(programStars, "aColor");
    gl.vertexAttribPointer(colorLocStars, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocStars);

    //Drawing static visuals
    gl.drawArrays(gl.TRIANGLES, 0, verticesStars.length);

    //Rendering the planets and the sun
    
    for (var i = 0; i < planetArr.length; i++) {
        gl.useProgram(program[i]);
        
        bufferId[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId[i]);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesMov[i]), gl.STATIC_DRAW);
    
        // Associate out shader variables with our data bufferData
    
        positionLoc = gl.getAttribLocation(program[i], "aPosition");
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);
    
        cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsMov[i]), gl.STATIC_DRAW );
        
        colorLoc[i] = gl.getAttribLocation(program[i], "aColor");
        gl.vertexAttribPointer(colorLoc[i], 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc[i]);

        //Revolving/Circular Movement 
        if (i != 8) {
            planetArr[i].angle += planetArr[i].speed * direction;
            dx[i] = Math.cos(planetArr[i].angle) * (planetArr[i].orbitRadius*scaleMod) + sunPosX;
            dy[i] = Math.sin(planetArr[i].angle) * (planetArr[i].orbitRadius*scaleMod) + sunPosY;
        }
        dx[8] = sunPosX;
        dy[8] = sunPosY;
        gl.uniform1f(dxLoc[i], dx[i]);
        gl.uniform1f(dyLoc[i], dy[i]);
        //Rotation
        theta[i] += planetArr[i].rotation * direction;
        gl.uniform1f(thetaLoc[i], theta[i]);

        gl.drawArrays(gl.TRIANGLES, 0, verticesMov[i].length);
    }


    requestAnimationFrame(render);
}