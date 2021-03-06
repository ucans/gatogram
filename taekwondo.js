// TODO : 배너가 텍스쳐 매핑

"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;

var vertices = [
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0),
];

const TORSO_ID = 0;
const TORSO_X_ID = 11;
const TORSO_Y_ID = 0;
const TORSO_Z_ID = 12;
const HEAD_ID = 1;
const HEAD_X_ID = 1;
const HEAD_Y_ID = 10;
const LEFT_UPEER_ARM_ID = 2;
const LEFT_LOWER_ARM_ID = 3;
const RIGHT_UPPER_ARM_ID = 4;
const RIGHT_LOWER_ARM_ID = 5;
const LEFT_UPPER_LEG_ID = 6;
const LEFT_LOWER_LEG_ID = 7;
const RIGHT_UPPER_LEG_ID = 8;
const RIGHT_LOWER_LEG_ID = 9;
// ==========Added variables==========
// TODO : 보드 추가
//const BOARD_ID = 11;


var numTimesToSubdivide = 5;
var sphereIndex = 6;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);
// ===================================
var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

// TODO : Board height, width 설정
var boardHeight;
var boardWidth;

// Vriables with moving
var movingDirections = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
// TODO : Animation 3때문에 3으로 바뀜
var animOrder = 3;
const FORWARD = 1;
const BACKWARD = 0;

var fColor;

// TODO : 보드 추가해야함
var numNodes = 12;
var numAngles = 13;
var theta = [45, 0, 120, 280, 110, 280, 190, 10, 160, 20, 0, 0, 0];
var stack = [];
var figure = [];

for (var i = 0; i < numNodes; i++)
  figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;
var pointsArray = [];

// Texture mapping
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

function scale4(a, b, c) {
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

function createNode(transform, render, sibling, child) {
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  };
  return node;
}

function initNodes(Id) {
  var m = mat4();

  switch (Id) {
    case TORSO_ID, TORSO_X_ID:
      m = rotate(theta[TORSO_ID], 0, 1, 0);
      m = mult(m, rotate(theta[TORSO_X_ID], 1, 0, 0));
      //m = mult(m, rotate(theta[TORSO_Y_ID], 0, 1, 0));
      m = mult(m, rotate(theta[TORSO_Z_ID], 0, 0, 1));
      figure[TORSO_ID] = createNode(m, torso, null, HEAD_ID);
      break;

    case HEAD_ID:
    case HEAD_X_ID:
    case HEAD_Y_ID:
      m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
      m = mult(m, rotate(theta[HEAD_X_ID], 1, 0, 0));
      m = mult(m, rotate(theta[HEAD_Y_ID], 0, 1, 0));
      m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
      figure[HEAD_ID] = createNode(m, head, LEFT_UPEER_ARM_ID, null);
      break;

    case LEFT_UPEER_ARM_ID:
      m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[LEFT_UPEER_ARM_ID], 1, 0, 0));
      figure[LEFT_UPEER_ARM_ID] = createNode(
        m,
        leftUpperArm,
        RIGHT_UPPER_ARM_ID,
        LEFT_LOWER_ARM_ID
      );
      break;

    case RIGHT_UPPER_ARM_ID:
      m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[RIGHT_UPPER_ARM_ID], 1, 0, 0));
      figure[RIGHT_UPPER_ARM_ID] = createNode(
        m,
        rightUpperArm,
        LEFT_UPPER_LEG_ID,
        RIGHT_LOWER_ARM_ID
      );
      break;

    case LEFT_UPPER_LEG_ID:
      m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
      m = mult(m, rotate(theta[LEFT_UPPER_LEG_ID], 1, 0, 0));
      figure[LEFT_UPPER_LEG_ID] = createNode(
        m,
        leftUpperLeg,
        RIGHT_UPPER_LEG_ID,
        LEFT_LOWER_LEG_ID
      );
      break;

    case RIGHT_UPPER_LEG_ID:
      m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
      m = mult(m, rotate(theta[RIGHT_UPPER_LEG_ID], 1, 0, 0));
      figure[RIGHT_UPPER_LEG_ID] = createNode(
        m,
        rightUpperLeg,
        null,
        RIGHT_LOWER_LEG_ID
      );
      break;

    case LEFT_LOWER_ARM_ID:
      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotate(theta[LEFT_LOWER_ARM_ID], 1, 0, 0));
      figure[LEFT_LOWER_ARM_ID] = createNode(m, leftLowerArm, null, null);
      break;

    case RIGHT_LOWER_ARM_ID:
      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotate(theta[RIGHT_LOWER_ARM_ID], 1, 0, 0));
      figure[RIGHT_LOWER_ARM_ID] = createNode(m, rightLowerArm, null, null);
      break;

    case LEFT_LOWER_LEG_ID:
      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotate(theta[LEFT_LOWER_LEG_ID], 1, 0, 0));
      figure[LEFT_LOWER_LEG_ID] = createNode(m, leftLowerLeg, null, null);
      break;

    case RIGHT_LOWER_LEG_ID:
      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotate(theta[RIGHT_LOWER_LEG_ID], 1, 0, 0));
      figure[RIGHT_LOWER_LEG_ID] = createNode(m, rightLowerLeg, null, null);
      break;

    // TODO : Board의 initNode 설정
    // case BOARD_ID:
    //   break;
  }
}

function traverse(Id) {
  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * torsoHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(torsoWidth, torsoHeight, torsoWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [1.0, 1.0, 1.0, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
   instanceMatrix = mult(instanceMatrix, scale4(0.9, 0.9, 0.9) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
   gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
    for(var i =6; i<sphereIndex; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
}

function leftUpperArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * upperArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperArmWidth, upperArmHeight, upperArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * lowerArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * upperArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperArmWidth, upperArmHeight, upperArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.0, 0.5 * lowerArmHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.8, 0.5 * upperLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperLegWidth, upperLegHeight, upperLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(0.8, 0.5 * lowerLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(-0.8, 0.5 * upperLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(upperLegWidth, upperLegHeight, upperLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
  instanceMatrix = mult(
    modelViewMatrix,
    translate(-0.8, 0.5 * lowerLegHeight, 0.0)
  );
  instanceMatrix = mult(
    instanceMatrix,
    scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth)
  );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  gl.uniform4fv(fColor, [0.0, 0.0, 0.501961, 1.0]);
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
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
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  instanceMatrix = mat4();
  projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
  modelViewMatrix = mat4();

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "modelViewMatrix"),
    false,
    flatten(modelViewMatrix)
  );
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projectionMatrix"),
    false,
    flatten(projectionMatrix)
  );

  fColor = gl.getUniformLocation(program, "fColor");
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  bannerToAnimLoc = gl.getUniformLocation(program, "bannerToAnim");

  cube();
  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  bannerToAnimLoc = gl.getUniformLocation(program, "bannerToAnim");
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

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

	image.crossorign = "Anonymous";
	image.src = "taekwondo.gif";
	
	renderBanner();

  for (i = 0; i < numNodes; i++) initNodes(i);

  canvas.addEventListener("click", function(event){
		bannerToAnim = !bannerToAnim;
		gl.uniform1i(bannerToAnimLoc, true);
		console.log(bannerToAnim);
		render();
	});

};

function configureTexture(image){
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
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

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT);
  traverse(TORSO_ID);
  if (bannerToAnim) playAnimation();
  else theta = [45, 0, 120, 280, 110, 280, 190, 10, 160, 20, 0, 0, 0];

  if(bannerToAnim)
    requestAnimFrame(render);
};

function playAnimation() {
  leftKick();
}

function swingNode(Id, min, max, speed) {
  if (movingDirections[Id] == FORWARD) theta[Id] += speed;
  else theta[Id] -= speed;

  if (theta[Id] >= max) movingDirections[Id] = BACKWARD;
  if (theta[Id] <= min) movingDirections[Id] = FORWARD;
  initNodes(Id);
}

function moveNode(Id, speed) {
  // 방향설정은 함수호출 이전에
  if (movingDirections[Id] == FORWARD) theta[Id] += speed;
  else theta[Id] -= speed;
  initNodes(Id);
}

var leftKick = function () {
  var anim3Playtime = 0;
  if (animOrder == 3 && anim3Playtime <= 100) {
    swingNode(LEFT_UPEER_ARM_ID, 115, 235, 2.32);
    sleep(200).then(() => swingNode(LEFT_LOWER_ARM_ID, 250, 365, 2.2));

    swingNode(LEFT_UPPER_LEG_ID, 70, 200, 2.5);
    swingNode(RIGHT_LOWER_ARM_ID, 220, 300, 1.65);
    
    swingNode(TORSO_X_ID, -10, 0, 0.2);
    console.log(theta[TORSO_X_ID]);

    sleep(200).then(() => swingNode(RIGHT_UPPER_LEG_ID, 160, 170, 0.2));
    sleep(200).then(() => swingNode(RIGHT_LOWER_LEG_ID, 0, 20, 0.3));
    sleep(500).then(() => swingNode(LEFT_LOWER_LEG_ID, 0, 10, 0.3));
    ++anim3Playtime;
  }
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

function cube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}