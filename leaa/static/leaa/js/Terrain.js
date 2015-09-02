/**
 * Created by Taylor on 9/1/2015.
 */
var ORIGIN = new THREE.Vector3(0, 0, 0);
var CAM_START = new THREE.Vector3(0,-80,80);


// Constants //TODO: Obtain these from a settings request from controller
MAPx = 100;
MAPy = 76;
DEMx = 458;
DEMy = 344;

// Globals
var camera, scene, renderer;

// Get the element of the scene we want to render
var container = document.getElementById("scene");


/*
    We should be able to re-render the scene with new data obtained from the server, using an ajax request,
    and then update the variable within the scene instead of the whole page.
 */
WIDTH = container.offsetWidth;
HEIGHT = container.offsetHeight;

init();
animate();

function init() {
    //container = document.createElement( 'div' );
    //document.body.appendChild( container );


	// Setup Camera
    camera = new THREE.PerspectiveCamera(60 , WIDTH/HEIGHT, 0.1, 500);
	camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
	camera.up.set(0,0,1);

	// Setup Scene
    scene = new THREE.Scene();
    var ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

	// Initialize Controls
	orbit = new THREE.OrbitControls(camera, container);

    // General purpose manager for obtaining items.
    var manager = new THREE.LoadingManager();
    manager.onProgress = function( item, loaded, total) {
        console.log( item, loaded, total);
    };

    // Get initial terrain geo, to be updated with DEM data
    var terrainGeo = new THREE.PlaneGeometry(MAPx, MAPy, DEMx-1, DEMy-1);
    terrainGeo.computeFaceNormals();
    terrainGeo.computeVertexNormals();

	// Import texture TODO: make this malleable for taking arbitrary relief textures.
	var texture = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('static/leaa/resources/relief.png')});

	// Edit the height to match the DEM we requested TODO: Allow for arbitrary DEM.
    var heightMap = [];

	// Declare the final terrain object to be added
	var terrain;
    var loader = new THREE.TerrainLoader(manager);
    loader.load('static/leaa/resources/dem.bin', function(data) {
        for (var i = 0, l = terrainGeo.vertices.length; i < l; i++ ) {
            terrainGeo.vertices[i].z = data[i]/65535*1215;
            heightMap[i] = data[i];
        }
        terrain = new THREE.Mesh(terrainGeo, texture);
        scene.add(terrain);
    });

    // Declare renderer settings
    renderer = new THREE.WebGLRenderer();
    //renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0xfefefe, 1);
    renderer.autoClear = true;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize',onWindowResize,false);
}

function onWindowResize() {
    //windowHalfx = window.innerWidth / 2;
    //windowHalfy = window.innerHeight / 2;
    WIDTH = container.offsetWidth;
    HEIGHT = container.offsetHeight;
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize( WIDTH, HEIGHT);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render () {
    camera.lookAt(scene.position);
	orbit.update();
    //render.setSize(WIDTH,HEIGHT);
    renderer.render(scene,camera);
}