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
var head2Id = 11;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
// ==========Added variables==========
var comId = 10;
var com2Id=12
var chairId=13
var chair2Id=14
// ===================================

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;
// ==========Added variables==========
// Variables with a Flask
var comWidth = 3.0;
var comHeight = 0.2;

var com2Width=3.0
var com2Height=0.2

var chairWidth=3.0
var chairHeight=0.5
var chair2Width=4.0
var chair2Height=0.1

var numTimesToSubdivide = 5;
var sphereIndex = 6;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

// ===================================

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

var movingDirections = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var animOrder = 1;
const FORWARD = 1;
const BACKWARD = 0;

// Variables with Animation
var timeAnim1 = 0;
var timeAnim2 = 0;
var timeAnim3 = 0;

var fColor;


var numNodes = 15;

var theta = [-100, -80, 140, -50, 120, -40, 90, 110, 90, 90, -80, 180, 60, 0,90];

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
    figure[torsoId] = createNode( m, torso, null, headId ); //몸->머리
    break;

    case headId:
    case head1Id:
    case head2Id:
	
    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, comId); //머리->왼쪽위팔
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );//왼쪽위팔->오른쪽위팔,왼쪽아래팔
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId ); //오른쪽위팔->왼쪽위다리,오른쪽아래다리
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId ); //왼쪽위다리->오른쪽위다리,왼쪽아래다리
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );//오른쪽위다리->오른족아래다리
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );//왼쪽아래팔
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );//오른쪽아래팔
    break;


    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null ); //왼족위다리
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, chairId );//오른족위다리
    break;


	case comId:

    m = translate(1.0, -4.5, 3.0);
    m = mult(m, rotate(theta[comId], 1, 0, 0));
    figure[comId] = createNode( m, computer, null, com2Id );
    break;
	
	case com2Id:
	m = translate(-2.0, 1.3, -2.36);
    m = mult(m, rotate(theta[com2Id], 1, 0, 0));
    figure[com2Id] = createNode( m, computer2, null, null );
    break;

	case chairId:
	m = translate(-2.0, 0.32, 3.0);
    m = mult(m, rotate(theta[chairId], 1, 0, 0));
    figure[chairId] = createNode( m, chair, null, chair2Id );
    break;
	
	case chair2Id:
	m = translate(7.0, -1.5, 3.0);
    m = mult(m, rotate(theta[chair2Id], 1, 0, 0));
    figure[chair2Id] = createNode( m, chair2, null, null );
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
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.9, 0.9, 0.9, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
   instanceMatrix = mult(instanceMatrix, scale4(0.9, 0.9, 0.9) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =6; i<sphereIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
}


function leftUpperArm() {
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);   
   for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
	instanceMatrix = mult(modelViewMatrix, translate(0.8, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate( 0.8, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
	instanceMatrix = mult(modelViewMatrix, translate(-0.8, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(-0.8, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);	
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function computer() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * comHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(comWidth, comHeight, comWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.5, 0.2, 0.6]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function computer2() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * com2Height, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(com2Width, com2Height, com2Width) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [0.0, 0.5, 0.2, 0.7]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function chair() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * chairHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(chairWidth, chairHeight, chairWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [1.0, 0.4, 0.0, 0.7]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function chair2() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * chair2Height, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(chair2Width, chair2Height, chair2Width) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(fColor, [1.0, 0.4, 0.0, 0.7]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
	 
	 texCoordsArray.push(texCoord[0]);  //banner added
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

function triangle(a, b, c)
{
	pointsArray.push(a);
	pointsArray.push(b);
	pointsArray.push(c);
	
	sphereIndex += 3;
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
   
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

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
	image.src = "software.gif";

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

var anim1Playtime = 0;

var Animation1 = function (){ //Typing action
	if(animOrder == 1 && anim1Playtime <= 100){ //200
		swingNode(leftLowerArmId, -60, -50, 0.5);
		swingNode(rightLowerArmId, -20, -10, 0.5);
		anim1Playtime += 1;
	}
	else {
		animOrder = 2;
		Animation2(); //2번째 동작
	}
}

var anim2Playtime = 0;

var Animation2 = function (){ //Stroke action
	if(animOrder == 2 && anim2Playtime <= 120){
		swingNode(leftUpperArmId, 70, 140, 4.8);
		swingNode(rightUpperArmId, 60, 120, 4.2);
		anim2Playtime += 1;
	}
	else {
		animOrder = 3;
		Animation3();
		
	}
}

var anim3Playtime = 0;

var Animation3 = function (){ //computer broken
	if(animOrder == 3 && anim3Playtime <= 10){
		moveNode(comId, -1.0);
		anim3Playtime += 1;
	}
	//else Animation3();
		
}


function swingNode(Id, min, max, speed){  //흔드는 각도와 스피드
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


function moveNode(Id, speed){  //마지막에 도는함수
	// 방향설정은 함수호출 이전에

	if(movingDirections[Id] == BACKWARD)
		theta[Id] += speed;
	else 
		theta[Id] -= speed;

	initNodes(Id);
} 