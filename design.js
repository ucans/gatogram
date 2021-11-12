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
var head2Id = 20;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
// ==========Added variables==========
var pencilId = 10;
var pencilBId = 11;

var easelBodyId = 12;
var easelLeftLegId = 13;
var easelRightLegId = 14;
var easelPaperId = 15;

var drawingYellowId = 16;
var drawingSkyId = 17;
var drawingGreenId = 18;
var drawingBlueId = 19;
// ===================================
//몸통 길이 -1 했음 
var torsoHeight = 4.0;
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
// Variables with a pencil
var pencilWidth = 0.2;
var pencilHeight = 1.8;
var pencilBWidth = 0.15;
var pencilBHeight = 0.2;

var easelBodyWidth = 0.4;
var easelBodyHeight = 4.0; 
var easelLeftLegWidth = 0.4;
var easelLeftLegHeight = 7.1;
var easelRightLegWidth = 0.4;
var easelRightLegHeight = 7.0;
var easelPaperWidth = 2.2;
var easelPaperHeight = 3.0;

var drawingYellowWidth=1;
var drawingYellowHeight=1;
var drawingSkyWidth=1;
var drawingSkyHeight=1;
var drawingGreenWidth=1;
var drawingGreenHeight=1;
var drawingBlueWidth=1;
var drawingBlueHeight=1;
// ===================================

// ==========Added variables==========

// Vriables with moving
var movingDirections = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var animOrder = 1;
const FORWARD = 1;
const BACKWARD = 0;

// Variables with Animation
var timeAnim1 = 0;
var timeAnim2 = 0;
var timeAnim3 = 0;


var fColor;
var stopButton = false;
var easelLoc;
// ==================================

var numNodes = 20;
var numAngles = 21;

var theta = [30, 10, 140, -30, 100, -35, 100, 90, 100, 800, 20, 200, 90, 120, 240, 220, 190, 0, 190, 190, 0];

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

var drawingYellowShow=-9;
var drawingSkyShow=-9;
var drawingGreenShow=-9;
var drawingBlueShow=-9;

//------banner---------
var bannerToAnim=false;
var paperToAnim=false;
var bannerToAnimLoc;
var texCoordsArray=[];
var texture;
var texCoord=[vec2(0, 0),vec2(0, 1), vec2(1, 1), vec2(1, 0)];

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
    figure[torsoId] = createNode( m, torso, null, headId );
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
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, easelBodyId, rightLowerLegId );
    break;
   
   case easelBodyId:

    m = translate((torsoWidth+upperArmHeight+lowerArmHeight)-0.5, 0.3*torsoHeight, 0.0);
   m = mult(m, rotate(theta[easelBodyId], 1, 0, 0));
    figure[easelBodyId] = createNode( m, easelBody, null, easelLeftLegId );
    break;

   case easelLeftLegId:

    m = translate(easelBodyWidth-2, easelBodyHeight, -3.08);
   m = mult(m, rotate(theta[easelLeftLegId], 1, 0, 0));
    figure[easelLeftLegId] = createNode( m, easelLeftLeg, easelRightLegId, null );
    break;
   
   case easelRightLegId:

    m = translate(easelBodyWidth+1, easelBodyHeight, 3.0);
   m = mult(m, rotate(theta[easelRightLegId], 1, 0, 0));
    figure[easelRightLegId] = createNode( m, easelRightLeg, easelPaperId, null );
    break;
   
   case easelPaperId:

    m = translate((torsoWidth+upperArmHeight+lowerArmHeight)-8.8, easelBodyHeight+3, -3.1);
   m = mult(m, rotate(theta[easelPaperId], 0, 1, 1));
   m = mult(m, rotate(-27, 0, 0, 1));
   m = mult(m, rotate(5, 1, 0, 0));
    figure[easelPaperId] = createNode( m, easelPaper, null, drawingYellowId );
    break;
   
   case drawingYellowId:
   
    m = translate((torsoWidth+upperArmHeight+lowerArmHeight)-9, easelBodyHeight-2.7, drawingYellowShow);
   m = mult(m, rotate(theta[drawingYellowId], 1, 0, 0));
    figure[drawingYellowId] = createNode( m, drawingYellow, drawingSkyId, null );
    break;
   
   case drawingSkyId:
   
    m = translate((torsoWidth+upperArmHeight+lowerArmHeight)-9, easelBodyHeight-2.7, -3);
   m = mult(m, rotate(theta[drawingSkyId], 1, 0, 0));
    figure[drawingSkyId] = createNode( m, drawingSky, null, null );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, pencilId);
    break;

   case pencilId:

    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta[pencilId], 1, 0, 0));
    figure[pencilId] = createNode( m, pencil, null, pencilBId );
    break;
   
    case pencilBId:

    m = translate(0.0, pencilHeight, 0.0);
    m = mult(m, rotate(theta[pencilBId], 1, 0, 0));
    figure[pencilBId] = createNode( m, pencilB, null, null );
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
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [1.0, 1.0, 1.0, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
   instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
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

// Create a pencil
function pencil() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * pencilHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(pencilWidth, pencilHeight, pencilWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [1.0, 0.6, 0.0, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function pencilB() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * pencilBHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(pencilBWidth, pencilBHeight, pencilBWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.0, 0.0, 0.0, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// create easel
function easelBody() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * easelBodyHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(easelBodyWidth, easelBodyHeight, easelBodyWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.7, 0.4, 0.3, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function easelLeftLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * easelLeftLegHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(easelLeftLegWidth, easelLeftLegHeight, easelLeftLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.7, 0.4, 0.3, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function easelRightLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * easelRightLegHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(easelRightLegWidth, easelRightLegHeight, easelRightLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.7, 0.4, 0.3, 1.0]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function easelPaper() {
   
   
   gl.uniform1i(easelLoc, true);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * easelPaperHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(easelPaperWidth, easelPaperHeight, easelPaperWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.7, 0.8, 0.9, 0.9]);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
   gl.uniform1i(easelLoc, false);
}

function drawingYellow() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * drawingYellowHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(drawingYellowWidth, drawingYellowHeight, drawingYellowWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [1.0, 0.9, 0.0, 1.0]);
    for(var i =1; i<2; i++) gl.drawArrays(gl.TRIANGLES, 4*i, 3);
}

function drawingSky() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * drawingSkyHeight, 0.0) );
   instanceMatrix = mult(instanceMatrix, scale4(drawingYellowWidth, drawingYellowHeight, drawingYellowWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.6, 0.7, 0.9, 1.0]);
    for(var i =0; i<1; i++) gl.drawArrays(gl.TRIANGLES, 4*i, 3);
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

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);
   
   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.CULL_FACE);
   gl.cullFace(gl.FRONT);
   
    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
   
   fColor = gl.getUniformLocation(program, "fColor");
   bannerToAnimLoc=gl.getUniformLocation(program, "bannerToAnim");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
   
    cube();
   
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
   
   var design = new Image();
   design.onload = function() {
      configureTexture(design);
   }
   design.crossorign = "";
   design.src = "design.gif";

   
   renderBanner();
   
   
    
   

    for(i=0; i<numNodes; i++) {
      initNodes(i);
   }
   
      
   easelLoc=gl.getUniformLocation(program, "easel");
   gl.uniform1i(easelLoc, false);
   var image2;
   
   canvas.addEventListener("click", function(event){
      bannerToAnim = !bannerToAnim;
      image2 = new Image();
      image2.onload = function() {
         configureTexture(image2);
      }
      image2.crossorign = "";
      image2.src = "gachon.gif";
      gl.uniform1i(bannerToAnimLoc, true);
      render();
      paperToAnim=true;
   });
}

var renderBanner = function() {
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
   instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0) );
    // instanceMatrix = mult(instanceMatrix, rotate(theta[xAxis], 1, 0, 1)); // x-axis
   // instanceMatrix = mult(instanceMatrix, rotate(theta[yAxis], 0, 1, 1)); // y-axis
   instanceMatrix = mult(instanceMatrix, rotate(180, 0, 0, 1)); // z-axis
   instanceMatrix = mult(instanceMatrix, scale4( 15, 5, 15));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
   if(!bannerToAnim)
      requestAnimFrame(renderBanner);

}

var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(torsoId);
     
         designAnimation();
      
        requestAnimFrame(render);
}

function designAnimation(){
   drawing();
   //drawingYellowShow=-3.1;
   //initNodes(drawingYellowId);
   //drawing();
}

var anim1Playtime = 0;

var drawing = function (){
   if(animOrder == 1 && anim1Playtime <= 150){
      swingNode(rightUpperArmId, 110, 115, 0.5);
      if(anim1Playtime==50){
         drawingYellowShow=-10;
         initNodes(drawingYellowId);
      }
      swingNode(head1Id, -10, 10, 0.4);
      anim1Playtime += 1;
   }
   else {
      animOrder = 2;
      //Animation2();
   }
}

var anim2Playtime = 0;

var Animation2 = function (){
   upNode(leftUpperArmId, 90, 150, 0.5)
   //else Animation3();
}

var Animation3 = function (){
   if(animOrder == 3){
      swingJoint(leftUpperArmId, 115, 235, 2.5);
      swingJoint(rightUpperArmId, 115, 235, 2.5);
      swingJoint(leftUpperLegId, 140, 220, 2.0);
      swingJoint(rightUpperLegId, 140, 220, 2.0);
   }
   else Animation4();
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

function upNode(Id, min, max, speed){
   // 팔 각도범위 135~235
   // 윗다리 140~220
   if(movingDirections[Id] == FORWARD)
   theta[Id] += speed;
   
   
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