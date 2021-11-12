"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 14;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var characterLocation = -1.0

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.5;
var upperLegHeight = 2.5;
var headHeight = 1.8;
var headWidth = 1.0;

// ==========Added variables==========
// Variables with a Flask
var flaskNeckWidth = 0.3;
var flaskNeckHeight = 1.5;

var deskLocation = 2.0;

var deskWidth = 6.0;
var deskHeight = 0.5;
var deskLegWidth = 4.5;
var deskLegHeight = 4.7;
var chemicalWidth = 1.0;
var chemicalHeight = 2.0;
var barWidth = 0.4;
var barHeight = 5.0;

var flaskNeckId = 10;
var flaskBodyId = 11;
var flaskBubbleId = 12;

var stuffId = 13;

var bubble0 = false, bubble1 = false, bubble2 = false;
var desk = true, chemical0 = true, chemical1 = true, chemicalBar = true;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var numTimesToSubdivide = 5;
var flaskBodyIndex = 6; // Because of cube, it will be started from index of 6

// Vriables with Banner (Texture)
var bannerToAnim = false;
var bannerToAnimLoc;

var texCoordsArray = [];

var texture;

var texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)
];

// Variables with Animation
var animOrder = 1;
const FORWARD = 1;
const BACKWARD = 0;
var movingDirections = 
	[FORWARD, FORWARD, FORWARD, FORWARD, 
	FORWARD, FORWARD, FORWARD, FORWARD, 
	FORWARD, FORWARD, FORWARD, FORWARD, 
	FORWARD];

var timeAnim1 = 0;
var timeAnim2 = 0;
var timeAnim3 = 0;


var fColor;
var stopButton = false;

// ==================================

var numNodes = 14;
var numAngles = 15;

var theta = [-180, 10, 180, 0, 100, -20, 180, 0, 180, 0, 110, 0, 0, 0, 0];

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:

    m = rotate(theta[torsoId], 0, 1, 0 );
    figure[torsoId] = createNode( m, torso, stuffId, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;
	
	case stuffId:

    m = translate(torsoHeight, 0.0, 0.0);
	m = mult(m, rotate(theta[stuffId], 1, 0, 0))
    figure[stuffId] = createNode( m, stuff, null, null);
    break;

    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, flaskNeckId);
    break;

	case flaskNeckId:

    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta[flaskNeckId], 1, 0, 0));
    figure[flaskNeckId] = createNode( m, flaskNeck, flaskBubbleId, flaskBodyId );
    break;
	
	case flaskBodyId:

    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta[flaskBodyId], 1, 0, 0));
    figure[flaskBodyId] = createNode( m, flaskBody, null, null );
    break;
	
	case flaskBubbleId:

    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta[flaskBubbleId], 1, 0, 0));
    figure[flaskBubbleId] = createNode( m, flaskBubble, null, null );
    break;
	
    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
	
	
	}
}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [1.0, 1.0, 1.0, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4( 0.9, 0.9, 0.9));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =6; i<flaskBodyIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
}

function leftUpperArm() {
	instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
	instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
	instanceMatrix = mult(modelViewMatrix, translate(characterLocation + 0.8, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(characterLocation + 0.8, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
	instanceMatrix = mult(modelViewMatrix, translate(characterLocation -0.8, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(characterLocation-0.8, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// Create a flask neck
function flaskNeck() {
    instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.5 * flaskNeckHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(flaskNeckWidth, flaskNeckHeight, flaskNeckWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [1.0, 0.0, 1.0, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function flaskBody() {
    instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.0, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( 0.85, 0.85, 0.85));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [1.0, 0.0, 1.0, 1.0]);
	// i=6 => tetrahedron start point
    for(var i =6; i<flaskBodyIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
}

function flaskBubble() {
    gl.uniform4fv(fColor, [1.0, 0.0, 1.0, 1.0]);
	
	// Bubble 0
	if(bubble0){
		instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.4 * flaskNeckHeight, -0.6) );
		instanceMatrix = mult(instanceMatrix, scale4( 0.2, 0.2, 0.2));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =6; i<flaskBodyIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
	}
	
	// Bubble 1
	if(bubble1){
		instanceMatrix = mult(modelViewMatrix, translate(characterLocation, -0.1 * flaskNeckHeight, -1.0) );
		instanceMatrix = mult(instanceMatrix, scale4( 0.2, 0.2, 0.2));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =6; i<flaskBodyIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
	}
	
	// Bubble 2
	if(bubble2){
		instanceMatrix = mult(modelViewMatrix, translate(characterLocation, 0.3 * flaskNeckHeight, -1.5) );
		instanceMatrix = mult(instanceMatrix, scale4( 0.2, 0.2, 0.2));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =6; i<flaskBodyIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
	}
}

function stuff() {
	
	// Desk
	if(desk){
		gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
		
		// Desk
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation, 0.0, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(deskWidth, deskHeight, deskWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		
		// Desk-Leg
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation, -0.5*deskLegHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(deskLegWidth, deskLegHeight, deskLegWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
	
	// Chemical 0
	if(chemical0){
		gl.uniform4fv(fColor, [0.545098	, 0.270588, 0.07451, 1.0]);
		
		// Chemical
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation + 2.0*chemicalWidth, 0.5*deskHeight + 0.5*chemicalHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(chemicalWidth, chemicalHeight, chemicalWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		
		// Chemical Cap
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation + 2.0*chemicalWidth, 0.5*deskHeight + chemicalHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(0.5*chemicalWidth, 0.5*chemicalHeight, 0.5*chemicalWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
	
	// Chemical 1
	if(chemical1){
		gl.uniform4fv(fColor, [0.627451, 0.12549, 0.941176, 1.0]);
		
		// Chemical
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation + 1.0*chemicalWidth, 0.5*deskHeight+ 0.4*chemicalHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(1.3*chemicalWidth, 0.8*chemicalHeight, 1.2*chemicalWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		
		// Chemical Cap
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation + 1.0*chemicalWidth, deskHeight + 0.6*chemicalHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(1.3*0.5*chemicalWidth, 1.2*0.5*chemicalHeight, 1.2*0.5*chemicalWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
	
	// Chemical Bar
	if(chemicalBar){
		gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
		
		// Chemical bar - vertical
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation , 0.5*deskHeight + 0.5*barHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(barWidth, barHeight, barWidth) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
		
		// Chemical - horizontal
		instanceMatrix = mult(modelViewMatrix, translate(deskLocation - 0.5*0.4*barHeight, 0.5*deskHeight + 0.7*barHeight, 0.0) );
		instanceMatrix = mult(instanceMatrix, scale4(0.4*barHeight, barWidth, 0.4*barHeight) );
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
		for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
	 
	 texCoordsArray.push(texCoord[0]);
	 texCoordsArray.push(texCoord[1]);
	 texCoordsArray.push(texCoord[2]);
	 texCoordsArray.push(texCoord[0]);
	 texCoordsArray.push(texCoord[2]);
	 texCoordsArray.push(texCoord[3]);
}



function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function triangle(a, b, c)
{
	pointsArray.push(a);
	pointsArray.push(b);
	pointsArray.push(c);
	
	flaskBodyIndex += 3;
}

function divideTriangle(a, b, c, count)
{
	if (count > 0){
		var ab = mix(a, b, 0.5);
		var ac = mix(a, c, 0.5);
		var bc = mix(b, c, 0.5);
		
		ab = normalize(ab, true);
		ac = normalize(ac, true);
		bc = normalize(bc, true);
		
		divideTriangle(a, ab, ac, count-1);
		divideTriangle(ab, b, bc, count-1);
		divideTriangle(bc, c, ac, count-1);
		divideTriangle(ab, bc, ac, count-1);
	}
	
	else{
		triangle(a, b, c);
	}
	
}

function tetrahedron(a, b, c, d, n){
	divideTriangle(a, b, c, n);
	divideTriangle(d, c, b, n);
	divideTriangle(a, d, b, n);
	divideTriangle(a, c, d, n);
}

function configureTexture(image){
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	// let's assume all images are not a power of 2
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
	
	fColor = gl.getUniformLocation(program, "fColor");
	bannerToAnimLoc = gl.getUniformLocation(program, "bannerToAnim");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	
    cube();
	tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	var tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	
	var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord);
	
	var image = new Image();
	image.onload = function() {
		configureTexture(image);
	}
	image.crossorign = "";
	image.src = "chemical.gif";
	
	renderBanner();
	
    for(i=0; i<numNodes; i++) initNodes(i);
	
	canvas.addEventListener("click", function(event){
		bannerToAnim = !bannerToAnim;
		gl.uniform1i(bannerToAnimLoc, true);
		console.log(bannerToAnim);
		render();
	});
}

var renderBanner = function() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0) );
    // instanceMatrix = mult(instanceMatrix, rotate(theta[xAxis], 1, 0, 1)); // x-axis
	// instanceMatrix = mult(instanceMatrix, rotate(theta[yAxis], 0, 1, 1)); // y-axis
	instanceMatrix = mult(instanceMatrix, rotate(180, 0, 0, 1)); // z-axis
	instanceMatrix = mult(instanceMatrix, scale4( torsoHeight*3.0, torsoHeight*1.0, torsoHeight*3.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	if(!bannerToAnim)
		requestAnimFrame(renderBanner);
}

var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(torsoId);
		playAnimation();
		
        requestAnimFrame(render);
}

function playAnimation(){
	Animation1();
}

// Animation 1 - Turn the character from backside
var anim1Frame = 0;
var actionEnd = false;

var Animation1 = function (){
	if(animOrder == 1 && anim1Frame <= 42){
		moveNode(torsoId, 5.0);
		moveNode(leftUpperArmId, -1.43);
		moveNode(leftLowerArmId, -2.62);
		moveNode(rightUpperLegId, -0.24);
		moveNode(rightLowerLegId, 0.48);
		anim1Frame += 1;
	}
	else {
		animOrder = 2;
		Animation2();
	}
}

// Animation 2 - Swing the flask
var anim2Frame = 0;

var Animation2 = function (){
	if(animOrder == 2 && anim2Frame <= 20){
		// Caution! setTimeout will be overlapped.
		setTimeout(function() {
			swingNode(rightUpperArmId, 100, 120, 1.5);
			anim2Frame += 1;
		}, 500);
	}
	else {
		animOrder = 3;
		Animation3();
	}
}

// Animation 3 - Bubbles go out from the flask
var anim3Frame = 0;

var Animation3 = function (){
	if(animOrder == 3 && anim3Frame <= 100){
		setTimeout(function() {
			bubble0 = true;
			setTimeout(function() {
				bubble1 = true;
				setTimeout(function() {
					bubble2 = true;
				}, 500);
			}, 500);
		}, 500);
		anim3Frame += 1;
		/* setTimeout(function() {
			bubbles[bubbleIndex] = true;
			bubbleIndex += 1;
		}, 5000);
		
		setTimeout(function() {
			bubbles[bubbleIndex] = true;
		}, 9000); */
	}
	//else Animation4();
}

function swingNode(Id, min, max, speed){
	// 팔 각도범위 135~235
	// 윗다리 140~220
	if(movingDirections[Id] == FORWARD)
		theta[Id] += speed;
	else 
		theta[Id] -= speed;
	
	if(theta[Id] >= max)
		movingDirections[Id] = BACKWARD;
	if(theta[Id] <= min)
		movingDirections[Id] = FORWARD;
	initNodes(Id);
}

function moveNode(Id, speed){
	// 방향설정은 함수호출 이전에
	
	if(movingDirections[Id] == FORWARD)
		theta[Id] += speed;
	else 
		theta[Id] -= speed;

	initNodes(Id);
}