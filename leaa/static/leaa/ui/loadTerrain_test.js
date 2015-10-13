/**
 * Created by Taylor on 9/8/2015.
 */
steal(function () {


    init();
    render(); // One call to render to prep the workspace.

    /**
     * Retrieves a selected DEM from our list of terrains.
     */
    $("a.dem").click(function() {
        var index = $(this).attr('value');   // index of the terrain we want
        temp_terrain = terrains[index];
        var name = temp_terrain.name;
        if (temp_terrain !== manager.ActiveDEM) {
            if (manager.ActiveDEM !== undefined) {
                cleanup();
            }
            manager.ActiveDEM = temp_terrain;

            // Get initial terrain geo, to be updated with DEM data
            var plane = new THREE.PlaneGeometry(temp_terrain.MAPx, temp_terrain.MAPy, temp_terrain.DEMx-1, temp_terrain.DEMy-1);
            plane.computeFaceNormals();
            plane.computeVertexNormals();

    	    // Import texture //TODO: rewrite this texture code to import a THREE.Texture, fixes flipped texture problem.
	        texture = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('static/leaa/resources/relief' + name +'.png')});

            texture.flipY = true;

            // Load the terrain and all stations
            manager.Loader.load('static/leaa/resources/dem'+ name + '.bin', function(data) {
                for (var i = 0, l = plane.vertices.length; i < l; i++ ) {
                    plane.vertices[i].z = data[i]/65535*temp_terrain.maxHeight;
                }
                terrainGeo = new THREE.Mesh(plane, texture);
                manager.TerrainMap = plane.vertices.slice();
                scene.add(terrainGeo);
                updateSodarLog('Added terrain: ' + temp_terrain.name, false);
                manager.SceneObjects.push(terrainGeo);

                // Get the related recordDates
                $("#dataPicker").empty();
                $.getJSON('/getDates/', {'terrainID': temp_terrain.id}, function(result) {
                    dates = result['dates'];
                    stationNames = result['stationNames'];
                }).done(function() {
                    if (dates.length == 0) {
                        console.log("No data found for this terrain. Pick another terrain for data viewing.");
                        $("#dataPicker").append('<li>No data for this terrain</li>');
                    } else {
                        console.log("Data found, adding to \"Select Data\" dropdown.");
                        $.each(dates, function(id, name) {
                            $("#dataPicker").append('<li><a href="#" class="recordDate">' + name + '</a></li>');
                        });
                    }
                })
            });
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            animate();
            $("#current-timestamp-label").html(name + "")
        }
    });

    /**
     * Initialize our workspace
     */
    function init() {

        manager = new VisManager();
        CAM_START = new THREE.Vector3(0,-80,80);
        container = document.getElementById("scene");

        // Setup Camera
        camera = new THREE.CombinedCamera(container.offsetWidth, container.offsetHeight, 60, 0.1, 500, -500, 1000);
        camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
        camera.up.set(0,0,1);

        // Setup Scene
        scene = new THREE.Scene();
        ambient = new THREE.AmbientLight(0xffffff);
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
        camera.aspect = container.offsetWidth/container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    /**
     * Remove all objects from scene and render once to clear UI.
     */
    function cleanup() {
        $.each(manager.SceneObjects, function(handle, threeObject) {
            scene.remove(threeObject);
            delete manager.SceneObjects.pop();
        });
        console.log("Scene cleared");
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
    });


    //TODO: See if we need this for adding arbitrary stations
    function calcStationPos(utmX, utmY) {
        var coords = [];
        var x = Math.floor(utmX - MIN_UTMx)/STEP_SIZE;
        coords.push(x);
        var y = Math.floor(MAX_UTMy - utmY)/STEP_SIZE;
        coords.push(y);
        return coords;
    }

});