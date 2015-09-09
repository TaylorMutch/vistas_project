/**
 * Created by Taylor on 9/8/2015.
 */
steal(function () {

    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log( item, loaded, total);
    };

    var camera, scene, renderer, activeDEM, terrainGeo;
    var cameraMode = true;  // true (default) is Perspective, false is Orthographic
    var CAM_START = new THREE.Vector3(0,-80,80);
    var container = document.getElementById("scene");
    WIDTH = container.offsetWidth;
    HEIGHT = container.offsetHeight;
    init();
    render(); // One call to render to prep the workspace.

    $("a.dem").click(function() {
        var tag_id = this.id;     // html id of the correct li
        var index = $(this).attr('value');   // index of the terrain we want
        var name = $(this).html();  // name of the terrain

        if (name !== activeDEM) {
            if (activeDEM !== undefined) {
                cleanup();
            }
            activeDEM = name;
            $("#current-timestamp-label").html("Loading " + name);
            var temp_terrain = terrains[index];
            //console.log(temp_terrain);
            var MAPx = temp_terrain.MAPx;
            var MAPy = temp_terrain.MAPy;
            var DEMx = temp_terrain.DEMx;
            var DEMy = temp_terrain.DEMy;
            var maxHeight = temp_terrain.maxHeight;

            // Get initial terrain geo, to be updated with DEM data
            var plane = new THREE.PlaneGeometry(MAPx, MAPy, DEMx-1, DEMy-1);
            plane.computeFaceNormals();
            plane.computeVertexNormals();

    	    // Import texture //TODO: rewrite this texture code to import a THREE.Texture, fixes flipped texture problem.
	        var texture = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('static/leaa/resources/relief' + name +'.png')});

            texture.flipY = true;
	        // Edit the height to match the DEM we requested
            var heightMap = [];

    	    // Declare the final terrain object to be added
            var loader = new THREE.TerrainLoader();
            loader.load('static/leaa/resources/dem'+ name + '.bin', function(data) {
                // console.log("Raw DEM data: " + data);
                for (var i = 0, l = plane.vertices.length; i < l; i++ ) {
                    //terrainGeo.vertices[i].z = data[i]/65535*1215;
                    plane.vertices[i].z = data[i]/65535*maxHeight;
                    heightMap[i] = data[i];
                }
                terrainGeo = new THREE.Mesh(plane, texture);
                scene.add(terrainGeo);
            //console.log("Heights: " + heightMap);
            });
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            animate();
        }

        //TODO: Get Station/Sodar data and load up the correct HTML elements on the page.
    });

    function init() {

        // Setup Camera
        //camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 1000);
        camera = new THREE.CombinedCamera(WIDTH, HEIGHT, 60, 0.1, 500, -500, 1000);
        camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
        camera.up.set(0,0,1);

        // Setup Scene
        scene = new THREE.Scene();
        var ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // Initialze controls
        orbit = new THREE.OrbitControls(camera, container);

        // Declare renderer settings
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0xfefefe, 1);
        renderer.autoClear = true;
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        WIDTH = container.offsetWidth;
        HEIGHT = container.offsetHeight;
        camera.aspect = WIDTH/HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(WIDTH, HEIGHT);
    }

    function cleanup() {
        scene.remove(terrainGeo);
        render();
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        orbit.update();
        renderer.render(scene,camera);
    }

    $("#setOrthographic").click(function () {
        camera.toOrthographic();
    });

    $("#setPerspective").click(function () {
        camera.toPerspective();
    })

});