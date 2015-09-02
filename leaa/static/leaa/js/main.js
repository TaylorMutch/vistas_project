// LEAA main JS file

// GLOBALS

var canvas = document.getElementById("scene");

//var WIDTH  = $("#scene").width();
//var HEIGHT = $("#scene").height();

WIDTH = canvas.width();
HEIGHT = canvas.height();

var ORIGIN = new THREE.Vector3(0, 0, 0);
var CAM_START = new THREE.Vector3(0,-80,80);

var cameraMode = true;  // true (default) is Perspective, false is Orthographic
/**
// Abstract function that toggles inner text of a button.
function toggleText(button_id, origText, newText) {
	// Obtain the inner text of the button
	var text = document.getElementById(button_id).firstChild;
	// If the origText is present, input the newText; else, keep origText
	text.data = (text.data == origText) ? newText : origText;
}

// Specific function for toggling the animateButton 
function changeAnimateButtonText(animateButtonID) {
	var animateOffText = "Animate";
	var animateOnText = "Stop Animating";
	toggleText(animateButtonID,animateOffText,animateOnText);
}
*/
// var markerColor = 0xcccccc;
// var columnColor = 0x000000;
// var step = -1;

/** var height_scale = 2;
var vec_scale = 5;
var hex = 0xcccc00;
var wait_interval = 1000;
*/

//FLAGS for toggles
var showContours = false;
var showTimestamps = true;
var animating = false;

//UTM step size is 30 meters
var STEP_SIZE = 30;

MAPx = 100;
MAPy = 76;
DEMx = 458;
DEMy = 344;

// UTM
var MAX_UTMx = 572109.034; // rightmost
var MIN_UTMx = 558369.034; // leftmost
var MAX_UTMy = 4903953.876; //nortmost
var MIN_UTMy = 4893633.876; //southmost

// Lat/Lon

/*
upper right lat/lon: 44.286492, -122.268442
upper left lat/lon: 44.285258, -122.096256
lower right lat/lon: 44.192358, -122.097675
lower left lat/lon: 44.193586, -122.269592
center lat/lon: 44.239458, -122.182992

*/

// Initialize SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();

// Initialize CAMERA
// var camera = new THREE.CombinedCamera(WIDTH, HEIGHT, 60, 0.1, 500, -500, 1000);
// var camera = new THREE.OrthographicCamera(WIDTH/-8, WIDTH/8, HEIGHT/8, HEIGHT/-8, -500, 1000);
var camera = new THREE.PerspectiveCamera(60, WIDTH/HEIGHT, 0.1, 500);

var ambientLight = new THREE.AmbientLight(0xffffff);

//function setOrthographic() {
//	camera.toOrthographic();
//}

//function setPerspective() {
//	camera.toPerspective();
//}

// Set the camera to the global start position
camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
//camera.translateY( - 10);


// Set the cameraVUP position
camera.up.set(0,0,1);

// set the size of the canvas
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xfefefe, 1);
renderer.autoClear = true;

scene.add(ambientLight);

//Functions


var terrainLoader = new THREE.TerrainLoader();

// ----  TERRAIN  ----
var terrainGeometry = new THREE.PlaneGeometry(MAPx, MAPy, DEMx-1, DEMy-1);
// **update to this if possible, PlaneGeometry is deprecated**
// var terrainGeometry = new THREE.PlaneBufferGeometry(MAPx, MAPy, DEMx-1, DEMy-1);
terrainGeometry.computeFaceNormals();
terrainGeometry.computeVertexNormals();
	
var terrainMaterial = new THREE.MeshPhongMaterial(
	{
	map: THREE.ImageUtils.loadTexture('static/leaa/resources/reliefHJAndrews.png')
	});
var terrain;
var heightMap = [];
//var newScaler = 2.0;

terrainLoader.load('{% static "leaa/resources/demHJAndrews.bin" %}', function(data) {
	for (var i = 0, l = terrainGeometry.vertices.length; i < l; i++) {
		//terrainGeometry.vertices[i].z = (settings.demScale)*data[i]/65535*1215;
		terrainGeometry.vertices[i].z = data[i]/65535*1215;
		heightMap[i] = data[i];
	}
	terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
	scene.add(terrain);
});

// Test geometry

var box = new THREE.BoxGeometry(1,1,1);
var mat = new THREE.MeshBasicMaterial( {color:0xff0000});
var theBox = new THREE.Mesh(box, mat);
var wire = new THREE.WireframeHelper(theBox, 0x00ff00);
scene.add(theBox);
scene.add(wire);


var terrainMap = terrainGeometry.vertices;

// ----  COORDINATES  ----

var maxHeight = Math.max.apply(Math, heightMap);
var minHeight = Math.min.apply(Math, heightMap);

// --- MORE SETUP ---

// loadData();
// var clock = new THREE.Clock();

// attach controls to camera
var orbitcontrols = new THREE.OrbitControls(camera, document.getElementById('scene'));

// attach flythrough controls
//var flycontrols = new THREE.FlyControls(camera, document.getElementById('scene'));
//flycontrols.movementSpeed = 0;
//flycontrols.rollSpeed = 0;

// checkbox toggle for flythrough/orbit controls
function activateFlyControls() {
	if (document.getElementById('flycheck').checked){
		orbitcontrols.enabled = false;
		//flycontrols.movementSpeed = 50;
		//flycontrols.rollSpeed = 0.005;
	}
	else {
		//flycontrols.movementSpeed = 0;
		//flycontrols.rollSpeed = 0;
		orbitcontrols.enabled = true;
	}
}

/*
var controls;
var flyThroughEnabled = false; // false means controls are orbit controls.
var clock = new THREE.Clock();

function activateControls() {
	flyThroughEnabled = document.getElementById('flycheck');
	if (flyThroughEnabled){
		//if (controls )
		controls = new THREE.FlyControls(camera, document.getElementById('scene'));
		controls.movementSpeed = 50;
		controls.rollSpeed = 0.005;
	} else {
		controls = new THREE.OrbitControls(camera, document.getElementById('scene'));
	}
};

activateControls();
*/

// ----  RENDER  ----
function render() {   
	requestAnimationFrame(render);

	// update orbitcontrols
	//orbitcontrols.update();
	
	// update flycontrols
	//var delta = clock.getDelta();
	//flycontrols.update(delta);
	
	/*
	if (flyThroughEnabled)
	{
		var delta = clock.getDelta();
		controls.update(delta);
	}
	else {
		controls.update();
	}
	*/
	
	// Set the viewport
	renderer.setViewport(0, 0, WIDTH, HEIGHT);	
	renderer.render(scene, camera);
}

// Resize the window
function onWindowResize()
{
	WIDTH = canvas.width();
	HEIGHT = canvas.height();
	//WIDTH = $("#scene").width();
	//HEIGHT = $("#scene").height();
	camera.aspect = WIDTH/HEIGHT;
	camera.updateProjectionMatrix();
	renderer.setSize(WIDTH, HEIGHT);
	render();
}
